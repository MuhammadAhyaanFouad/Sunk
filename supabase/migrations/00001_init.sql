-- ============================================================================
-- Sunk — Initial schema
-- A relational PostgreSQL database for tracking gaming spend.
-- Applies to a fresh Supabase project.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.platform as enum ('steam','roblox','xbox','playstation','epic','nintendo','battlenet','gog');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.purchase_category as enum ('games','dlc','subscription','battle_pass','cosmetic','currency','loot_box','microtransaction','hardware','other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.subscription_status as enum ('active','cancelled','paused','trial');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.subscription_interval as enum ('monthly','yearly');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.goal_type as enum ('reduce_spend','save_up','hours_played','no_spend','custom');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.goal_status as enum ('active','completed','failed','archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.goal_unit as enum ('money','days','hours');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.insight_tone as enum ('positive','neutral','info');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.notification_kind as enum ('renewal','achievement','friend','insight','goal','system');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.achievement_rarity as enum ('common','uncommon','rare','epic','legendary');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.roast_level as enum ('off','mild','medium','extra_crispy');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.billing_status as enum ('active','canceled','past_due','none');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum ('paid','failed','refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.plan_tier as enum ('free','premium');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Trigger helper for updated_at
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- Profiles
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  email text,
  avatar_url text,
  bio text,
  country text,
  timezone text,
  referral_code text,
  plan plan_tier not null default 'free',
  level integer not null default 1,
  xp bigint not null default 0,
  xp_to_next_level bigint not null default 1000,
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_username_idx on public.profiles (lower(username));
create index if not exists profiles_plan_idx on public.profiles (plan);

-- ---------------------------------------------------------------------------
-- Connected platforms
-- ---------------------------------------------------------------------------
create table if not exists public.connected_platforms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  platform platform not null,
  platform_user_id text,
  display_name text,
  connected_at timestamptz not null default now(),
  last_synced_at timestamptz,
  total_spend numeric(12,2) not null default 0,
  total_games integer not null default 0,
  status text not null default 'connected' check (status in ('connected','expired','error')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, platform)
);

create index if not exists connected_platforms_user_idx on public.connected_platforms (user_id);

-- ---------------------------------------------------------------------------
-- Platform sync jobs
-- ---------------------------------------------------------------------------
create table if not exists public.platform_sync_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  platform platform not null,
  status text not null default 'running' check (status in ('running','succeeded','failed')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  items_found integer not null default 0,
  items_imported integer not null default 0,
  error text
);

create index if not exists platform_sync_jobs_user_idx on public.platform_sync_jobs (user_id);
create index if not exists platform_sync_jobs_status_idx on public.platform_sync_jobs (status);

-- ---------------------------------------------------------------------------
-- Games catalog
-- ---------------------------------------------------------------------------
create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  title text not null,
  cover_url text,
  developer text,
  publisher text,
  genres text[] default '{}',
  release_date date,
  rating numeric(3,1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists games_title_idx on public.games using gin (to_tsvector('english', title));
create index if not exists games_slug_idx on public.games (slug);

-- ---------------------------------------------------------------------------
-- Game library (per user)
-- ---------------------------------------------------------------------------
create table if not exists public.game_library (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  game_id uuid not null references public.games(id) on delete cascade,
  platforms platform[] default '{}',
  owned boolean not null default true,
  playtime_minutes bigint not null default 0,
  last_played_at timestamptz,
  total_spend numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, game_id)
);

create index if not exists game_library_user_idx on public.game_library (user_id);
create index if not exists game_library_user_spend_idx on public.game_library (user_id, total_spend desc);

-- ---------------------------------------------------------------------------
-- Purchase categories
-- ---------------------------------------------------------------------------
create table if not exists public.purchase_categories (
  id uuid primary key default gen_random_uuid(),
  slug purchase_category unique not null,
  label text not null,
  sort_order integer not null default 0
);

-- ---------------------------------------------------------------------------
-- Purchase tags
-- ---------------------------------------------------------------------------
create table if not exists public.purchase_tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  color text,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create index if not exists purchase_tags_user_idx on public.purchase_tags (user_id);

-- ---------------------------------------------------------------------------
-- Purchases
-- ---------------------------------------------------------------------------
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  game_id uuid references public.games(id) on delete set null,
  platform platform not null,
  category purchase_category not null default 'other',
  title text not null,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'USD',
  quantity integer not null default 1,
  status text not null default 'complete' check (status in ('complete','refunded','pending')),
  tags text[] default '{}',
  notes text,
  purchased_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists purchases_user_idx on public.purchases (user_id);
create index if not exists purchases_user_date_idx on public.purchases (user_id, purchased_at desc);
create index if not exists purchases_user_category_idx on public.purchases (user_id, category);
create index if not exists purchases_user_platform_idx on public.purchases (user_id, platform);
create index if not exists purchases_game_idx on public.purchases (game_id);
create index if not exists purchases_user_title_idx on public.purchases using gin (to_tsvector('english', title));

-- ---------------------------------------------------------------------------
-- Subscriptions
-- ---------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  platform platform,
  price numeric(10,2) not null default 0,
  currency text not null default 'USD',
  interval subscription_interval not null default 'monthly',
  status subscription_status not null default 'active',
  started_at timestamptz not null default now(),
  next_renewal timestamptz not null,
  last_renewed_at timestamptz,
  auto_renew boolean not null default true,
  logo_url text,
  category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_user_idx on public.subscriptions (user_id);
create index if not exists subscriptions_next_renewal_idx on public.subscriptions (next_renewal);

-- ---------------------------------------------------------------------------
-- Subscription history
-- ---------------------------------------------------------------------------
create table if not exists public.subscription_history (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  action text not null,
  detail jsonb default '{}',
  created_at timestamptz not null default now()
);

create index if not exists subscription_history_sub_idx on public.subscription_history (subscription_id);

-- ---------------------------------------------------------------------------
-- Renewals
-- ---------------------------------------------------------------------------
create table if not exists public.renewals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  amount numeric(10,2) not null,
  currency text not null default 'USD',
  due_at timestamptz not null,
  status text not null default 'upcoming' check (status in ('upcoming','paid','skipped','missed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists renewals_user_idx on public.renewals (user_id);
create index if not exists renewals_due_idx on public.renewals (due_at);

-- ---------------------------------------------------------------------------
-- Budgets
-- ---------------------------------------------------------------------------
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  monthly_limit numeric(10,2) not null default 0,
  current_spend numeric(10,2) not null default 0,
  start_date date not null default current_date,
  reset_day integer not null default 1,
  streak integer not null default 0,
  best_streak integer not null default 0,
  personal_best_month text,
  personal_best_spend numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

-- ---------------------------------------------------------------------------
-- Budget history
-- ---------------------------------------------------------------------------
create table if not exists public.budget_history (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references public.budgets(id) on delete cascade,
  month text not null,
  spent numeric(10,2) not null default 0,
  limit_amount numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  unique (budget_id, month)
);

create index if not exists budget_history_budget_idx on public.budget_history (budget_id);

-- ---------------------------------------------------------------------------
-- Goals
-- ---------------------------------------------------------------------------
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  type goal_type not null default 'custom',
  target numeric(12,2) not null,
  current numeric(12,2) not null default 0,
  unit goal_unit not null default 'money',
  status goal_status not null default 'active',
  streak integer not null default 0,
  started_at timestamptz not null default now(),
  end_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists goals_user_idx on public.goals (user_id);
create index if not exists goals_user_status_idx on public.goals (user_id, status);

-- ---------------------------------------------------------------------------
-- Goal progress
-- ---------------------------------------------------------------------------
create table if not exists public.goal_progress (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals(id) on delete cascade,
  value numeric(12,2) not null default 0,
  recorded_at timestamptz not null default now()
);

create index if not exists goal_progress_goal_idx on public.goal_progress (goal_id);

-- ---------------------------------------------------------------------------
-- Insights
-- ---------------------------------------------------------------------------
create table if not exists public.insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null,
  title text not null,
  body text not null,
  tone insight_tone not null default 'neutral',
  meta jsonb default '{}',
  created_at timestamptz not null default now()
);

create index if not exists insights_user_idx on public.insights (user_id);
create index if not exists insights_user_created_idx on public.insights (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind notification_kind not null default 'system',
  title text not null,
  body text,
  read boolean not null default false,
  action_href text,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on public.notifications (user_id);
create index if not exists notifications_user_read_idx on public.notifications (user_id, read);

-- ---------------------------------------------------------------------------
-- Friends
-- ---------------------------------------------------------------------------
create table if not exists public.friends (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  friend_user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'accepted' check (status in ('accepted','blocked')),
  created_at timestamptz not null default now(),
  unique (user_id, friend_user_id)
);

create index if not exists friends_user_idx on public.friends (user_id);

-- ---------------------------------------------------------------------------
-- Friend requests
-- ---------------------------------------------------------------------------
create table if not exists public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references public.profiles(id) on delete cascade,
  to_user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (from_user_id, to_user_id)
);

create index if not exists friend_requests_to_idx on public.friend_requests (to_user_id);

-- ---------------------------------------------------------------------------
-- Groups
-- ---------------------------------------------------------------------------
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  avatar_url text,
  invite_code text unique,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Group members
-- ---------------------------------------------------------------------------
create table if not exists public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member')),
  joined_at timestamptz not null default now(),
  unique (group_id, user_id)
);

create index if not exists group_members_group_idx on public.group_members (group_id);
create index if not exists group_members_user_idx on public.group_members (user_id);

-- ---------------------------------------------------------------------------
-- Group challenges
-- ---------------------------------------------------------------------------
create table if not exists public.group_challenges (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  status text not null default 'active' check (status in ('active','completed','cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists group_challenges_group_idx on public.group_challenges (group_id);

-- ---------------------------------------------------------------------------
-- Leaderboards (view over profiles + purchases)
-- ---------------------------------------------------------------------------
create or replace view public.leaderboards as
select
  p.id as user_id,
  p.username,
  p.display_name,
  p.avatar_url,
  p.level,
  coalesce(sum(pu.amount) filter (where pu.status <> 'refunded'), 0) as lifetime_spend,
  coalesce(sum(pu.amount) filter (where pu.status <> 'refunded' and pu.purchased_at >= date_trunc('month', now())), 0) as monthly_spend,
  0 as weekly_change,
  (p.id = auth.uid()) as is_you
from public.profiles p
left join public.purchases pu on pu.user_id = p.id
group by p.id
order by lifetime_spend desc;

-- ---------------------------------------------------------------------------
-- Achievements (catalog)
-- ---------------------------------------------------------------------------
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null,
  icon text,
  rarity achievement_rarity not null default 'common',
  target numeric(12,2) not null default 1,
  xp_reward integer not null default 100,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Badges (catalog)
-- ---------------------------------------------------------------------------
create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null,
  icon text,
  tier text not null default 'bronze',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- User badges
-- ---------------------------------------------------------------------------
create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique (user_id, badge_id)
);

create index if not exists user_badges_user_idx on public.user_badges (user_id);

-- ---------------------------------------------------------------------------
-- XP events
-- ---------------------------------------------------------------------------
create table if not exists public.xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  amount integer not null default 0,
  description text,
  created_at timestamptz not null default now()
);

create index if not exists xp_events_user_idx on public.xp_events (user_id);
create index if not exists xp_events_user_created_idx on public.xp_events (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Wrapped
-- ---------------------------------------------------------------------------
create table if not exists public.wrapped (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  year integer not null,
  data jsonb not null,
  shareable boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, year)
);

create index if not exists wrapped_user_idx on public.wrapped (user_id);

-- ---------------------------------------------------------------------------
-- Wishlist
-- ---------------------------------------------------------------------------
create table if not exists public.wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  cover_url text,
  platform platform,
  price numeric(10,2),
  notified boolean not null default false,
  added_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists wishlist_user_idx on public.wishlist (user_id);

-- ---------------------------------------------------------------------------
-- Wishlist price history
-- ---------------------------------------------------------------------------
create table if not exists public.wishlist_price_history (
  id uuid primary key default gen_random_uuid(),
  wishlist_id uuid not null references public.wishlist(id) on delete cascade,
  price numeric(10,2) not null,
  created_at timestamptz not null default now()
);

create index if not exists wishlist_price_history_item_idx on public.wishlist_price_history (wishlist_id);

-- ---------------------------------------------------------------------------
-- Billing customers
-- ---------------------------------------------------------------------------
create table if not exists public.billing_customers (
  id uuid primary key references public.profiles(id) on delete cascade,
  paddle_customer_id text unique,
  paddle_subscription_id text,
  plan plan_tier not null default 'free',
  status billing_status not null default 'none',
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Billing subscriptions
-- ---------------------------------------------------------------------------
create table if not exists public.billing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.billing_customers(id) on delete cascade,
  paddle_subscription_id text unique,
  plan plan_tier not null default 'premium',
  status billing_status not null default 'active',
  price numeric(10,2),
  currency text not null default 'USD',
  interval subscription_interval not null default 'monthly',
  current_period_start timestamptz,
  current_period_end timestamptz,
  next_billing_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists billing_subscriptions_customer_idx on public.billing_subscriptions (customer_id);

-- ---------------------------------------------------------------------------
-- Payments
-- ---------------------------------------------------------------------------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null default 'paddle',
  provider_payment_id text,
  amount numeric(10,2) not null,
  currency text not null default 'USD',
  status payment_status not null default 'paid',
  description text,
  method text,
  last4 text,
  paid_at timestamptz not null default now()
);

create index if not exists payments_user_idx on public.payments (user_id);

-- ---------------------------------------------------------------------------
-- Roast preferences (per-user toggle + level)
-- ---------------------------------------------------------------------------
create table if not exists public.roast_preferences (
  id uuid primary key references public.profiles(id) on delete cascade,
  level roast_level not null default 'off',
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Roast lines (catalog)
-- ---------------------------------------------------------------------------
create table if not exists public.roast_lines (
  id uuid primary key default gen_random_uuid(),
  level roast_level not null,
  line text not null
);

-- ---------------------------------------------------------------------------
-- Privacy settings
-- ---------------------------------------------------------------------------
create table if not exists public.privacy_settings (
  id uuid primary key references public.profiles(id) on delete cascade,
  profile_public boolean not null default true,
  show_spend boolean not null default true,
  show_playtime boolean not null default true,
  show_achievements boolean not null default true,
  allow_friend_requests boolean not null default true,
  allow_group_invites boolean not null default true,
  allow_leaderboard_ranking boolean not null default true,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Feature flags (catalog)
-- ---------------------------------------------------------------------------
create table if not exists public.feature_flags (
  key text primary key,
  enabled boolean not null default false,
  rollout integer not null default 100,
  description text,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Audit logs
-- ---------------------------------------------------------------------------
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  action text not null,
  entity text,
  entity_id uuid,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_user_idx on public.audit_logs (user_id);
create index if not exists audit_logs_created_idx on public.audit_logs (created_at desc);

-- ---------------------------------------------------------------------------
-- Sessions (application-level bookkeeping)
-- ---------------------------------------------------------------------------
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  device text,
  ip inet,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index if not exists sessions_user_idx on public.sessions (user_id);

-- ---------------------------------------------------------------------------
-- Search history
-- ---------------------------------------------------------------------------
create table if not exists public.search_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  query text not null,
  created_at timestamptz not null default now()
);

create index if not exists search_history_user_idx on public.search_history (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Saved filters
-- ---------------------------------------------------------------------------
create table if not exists public.saved_filters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  filter jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists saved_filters_user_idx on public.saved_filters (user_id);

-- ============================================================================
-- Triggers
-- ============================================================================
do $$
declare
  t text;
begin
  foreach t in array array['profiles','connected_platforms','games','game_library','purchases','subscriptions','renewals','budgets','budget_history','goals','wishlist','billing_customers','billing_subscriptions','saved_filters']
  loop
    execute format('drop trigger if exists trg_set_updated_at_%s on public.%s', t, t);
    execute format('create trigger trg_set_updated_at_%s before update on public.%s for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

-- Create a profile whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name, email, onboarded, created_at, updated_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', 'player_' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'username', 'Player'),
    new.email,
    false,
    now(),
    now()
  );
  insert into public.billing_customers (id) values (new.id) on conflict do nothing;
  insert into public.roast_preferences (id) values (new.id) on conflict do nothing;
  insert into public.privacy_settings (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.connected_platforms enable row level security;
alter table public.platform_sync_jobs enable row level security;
alter table public.games enable row level security;
alter table public.game_library enable row level security;
alter table public.purchase_categories enable row level security;
alter table public.purchase_tags enable row level security;
alter table public.purchases enable row level security;
alter table public.subscriptions enable row level security;
alter table public.subscription_history enable row level security;
alter table public.renewals enable row level security;
alter table public.budgets enable row level security;
alter table public.budget_history enable row level security;
alter table public.goals enable row level security;
alter table public.goal_progress enable row level security;
alter table public.insights enable row level security;
alter table public.notifications enable row level security;
alter table public.friends enable row level security;
alter table public.friend_requests enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.group_challenges enable row level security;
alter table public.achievements enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.xp_events enable row level security;
alter table public.wrapped enable row level security;
alter table public.wishlist enable row level security;
alter table public.wishlist_price_history enable row level security;
alter table public.billing_customers enable row level security;
alter table public.billing_subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.roast_preferences enable row level security;
alter table public.roast_lines enable row level security;
alter table public.privacy_settings enable row level security;
alter table public.feature_flags enable row level security;
alter table public.audit_logs enable row level security;
alter table public.sessions enable row level security;
alter table public.search_history enable row level security;
alter table public.saved_filters enable row level security;

-- ---------- Ownership policies (private per-user rows) ----------
create or replace function public.is_owner(owner uuid)
returns boolean
language sql
security definer
stable
as $$ select owner = auth.uid() $$;

do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'connected_platforms','platform_sync_jobs','game_library','purchase_tags','purchases',
    'subscriptions','subscription_history','renewals','budgets','goals','goal_progress','insights',
    'notifications','xp_events','wrapped','wishlist','wishlist_price_history','payments',
    'audit_logs','sessions','search_history','saved_filters'
  ]
  loop
    execute format('drop policy if exists "Owners have full access on %s" on public.%s', tbl, tbl);
    execute format('create policy "Owners have full access on %s" on public.%s for all using (public.is_owner(user_id)) with check (public.is_owner(user_id))', tbl, tbl);
  end loop;
end $$;

do $$
declare
  tbl text;
begin
  foreach tbl in array array['budget_history']
  loop
    execute format('drop policy if exists "Budget history via budget ownership" on public.%s', tbl);
    execute format('create policy "Budget history via budget ownership" on public.%s for all using (exists (select 1 from public.budgets b where b.id = budget_id and public.is_owner(b.user_id))) with check (exists (select 1 from public.budgets b where b.id = budget_id and public.is_owner(b.user_id)))', tbl);
  end loop;
end $$;

do $$
declare
  tbl text;
begin
  foreach tbl in array array['goal_progress']
  loop
    execute format('drop policy if exists "Goal progress via goal ownership" on public.%s', tbl);
    execute format('create policy "Goal progress via goal ownership" on public.%s for all using (exists (select 1 from public.goals g where g.id = goal_id and public.is_owner(g.user_id))) with check (exists (select 1 from public.goals g where g.id = goal_id and public.is_owner(g.user_id)))', tbl);
  end loop;
end $$;

-- Profiles: owners full access; others read public profile info.
drop policy if exists "Owner full access on profiles" on public.profiles;
create policy "Owner full access on profiles" on public.profiles
  for all using (public.is_owner(id)) with check (public.is_owner(id));

drop policy if exists "Anyone can view public profiles" on public.profiles;
create policy "Anyone can view public profiles" on public.profiles
  for select using (public.is_owner(id) or (exists (select 1 from public.privacy_settings ps where ps.id = profiles.id and ps.profile_public)));

-- Friends: each side manages their own edge.
drop policy if exists "Owner manages friends" on public.friends;
create policy "Owner manages friends" on public.friends
  for all using (public.is_owner(user_id)) with check (public.is_owner(user_id));

drop policy if exists "Friends visible to both parties" on public.friends;
create policy "Friends visible to both parties" on public.friends
  for select using (public.is_owner(friend_user_id));

-- Friend requests: receiver controls acceptance.
drop policy if exists "Owner manages outgoing requests" on public.friend_requests;
create policy "Owner manages outgoing requests" on public.friend_requests
  for all using (public.is_owner(from_user_id)) with check (public.is_owner(from_user_id));

drop policy if exists "Receiver can read requests" on public.friend_requests;
create policy "Receiver can read requests" on public.friend_requests
  for select using (public.is_owner(to_user_id));

-- Groups: members can read; creators manage.
drop policy if exists "Members read groups" on public.groups;
create policy "Members read groups" on public.groups
  for select using (
    public.is_owner(created_by)
    or exists (select 1 from public.group_members gm where gm.group_id = groups.id and public.is_owner(gm.user_id))
  );

drop policy if exists "Owners manage groups" on public.groups;
create policy "Owners manage groups" on public.groups
  for all using (public.is_owner(created_by)) with check (public.is_owner(created_by));

drop policy if exists "Members read group membership" on public.group_members;
create policy "Members read group membership" on public.group_members
  for select using (exists (select 1 from public.group_members gm where gm.group_id = group_members.group_id and public.is_owner(gm.user_id)) or public.is_owner(user_id));

drop policy if exists "Members manage own membership" on public.group_members;
create policy "Members manage own membership" on public.group_members
  for all using (public.is_owner(user_id)) with check (public.is_owner(user_id));

drop policy if exists "Group challenges read" on public.group_challenges;
create policy "Group challenges read" on public.group_challenges
  for select using (exists (select 1 from public.group_members gm where gm.group_id = group_challenges.group_id and public.is_owner(gm.user_id)));

-- User badges: owner only.
drop policy if exists "Owner manages user badges" on public.user_badges;
create policy "Owner manages user badges" on public.user_badges
  for all using (public.is_owner(user_id)) with check (public.is_owner(user_id));

-- Billing: owner only.
drop policy if exists "Owner manages billing customer" on public.billing_customers;
create policy "Owner manages billing customer" on public.billing_customers
  for all using (public.is_owner(id)) with check (public.is_owner(id));

drop policy if exists "Owner manages billing subscriptions" on public.billing_subscriptions;
create policy "Owner manages billing subscriptions" on public.billing_subscriptions
  for all using (exists (select 1 from public.billing_customers bc where bc.id = customer_id and public.is_owner(bc.id))) with check (exists (select 1 from public.billing_customers bc where bc.id = customer_id and public.is_owner(bc.id)));

drop policy if exists "Owner manages roast preferences" on public.roast_preferences;
create policy "Owner manages roast preferences" on public.roast_preferences
  for all using (public.is_owner(id)) with check (public.is_owner(id));

drop policy if exists "Owner manages privacy settings" on public.privacy_settings;
create policy "Owner manages privacy settings" on public.privacy_settings
  for all using (public.is_owner(id)) with check (public.is_owner(id));

-- ---------- Global catalog tables: readable by any authenticated user ----------
do $$
declare
  tbl text;
begin
  foreach tbl in array array['games','purchase_categories','achievements','badges','feature_flags']
  loop
    execute format('drop policy if exists "Any authenticated user reads %s" on public.%s', tbl, tbl);
    execute format('create policy "Any authenticated user reads %s" on public.%s for select using (auth.uid() is not null)', tbl, tbl);
  end loop;
end $$;

drop policy if exists "Roast lines read by anyone" on public.roast_lines;
create policy "Roast lines read by anyone" on public.roast_lines
  for select using (auth.uid() is not null);

-- ---------- Service-role only tables ----------
do $$
declare
  tbl text;
begin
  foreach tbl in array array['audit_logs','sessions','search_history']
  loop
    execute format('drop policy if exists "Service role only %s" on public.%s', tbl, tbl);
    execute format('create policy "Service role only %s" on public.%s for select using (false)', tbl, tbl);
  end loop;
end $$;

-- ============================================================================
-- Initial reference data
-- ============================================================================
insert into public.purchase_categories (slug, label, sort_order) values
  ('games', 'Games', 1),
  ('dlc', 'DLC', 2),
  ('subscription', 'Subscriptions', 3),
  ('battle_pass', 'Battle Passes', 4),
  ('cosmetic', 'Cosmetics', 5),
  ('currency', 'Currencies', 6),
  ('loot_box', 'Loot Boxes', 7),
  ('microtransaction', 'Microtransactions', 8),
  ('hardware', 'Hardware', 9),
  ('other', 'Other', 10)
on conflict (slug) do nothing;

insert into public.roast_lines (level, line) values
  ('mild', 'You''ve spent $2,984 on games. That''s a very expensive way to die to the same boss 40 times.'),
  ('mild', 'Your Steam library has 156 games and you''ve played 23. The other 133 are having a really good sleep.'),
  ('mild', '$612 on Roblox. Somewhere, a 12-year-old is driving a Bugatti with your money.'),
  ('medium', 'Your 2,648 hours of playtime cost you $1.13 per hour. Minimum wage workers are crying for you.'),
  ('medium', '74 days since you last touched EA Play, yet $4.99 leaves your account every single month.'),
  ('extra_crispy', '$2,984 in gaming spend and you still don''t have the ranked skin. We need to talk.'),
  ('extra_crispy', 'The Steam Deck you bought to play more currently plays more Steam sales than games.')
on conflict do nothing;
