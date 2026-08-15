-- ============================================================================
-- Sunk — Seed data (global catalog)
-- ============================================================================

insert into public.achievements (slug, title, description, icon, rarity, target, xp_reward) values
  ('first-100', 'Century Club', 'Spend $100 on gaming', 'dollar-sign', 'common', 100, 100),
  ('thousand', 'Committed', 'Spend $1,000 on gaming', 'trophy', 'uncommon', 1000, 250),
  ('deep-dive', 'Deep Dive', 'Hit $2,500 in lifetime spend', 'waves', 'uncommon', 2500, 300),
  ('whale', 'Honorary Whale', 'Reach $5,000 lifetime spend', 'fish', 'rare', 5000, 600),
  ('budget-streak-3', 'Consistency', 'Stay under budget 3 months in a row', 'shield-check', 'common', 3, 150),
  ('budget-streak-6', 'Iron Discipline', 'Stay under budget 6 months in a row', 'shield', 'uncommon', 6, 300),
  ('budget-streak-12', 'Unbreakable', 'Stay under budget for a full year', 'shield', 'epic', 12, 1000),
  ('library-100', 'Collector', 'Own 100 games across platforms', 'library', 'uncommon', 100, 250),
  ('hours-500', 'Time Investor', 'Log 500 hours of playtime', 'clock', 'common', 500, 200),
  ('hours-1000', 'Power Gamer', 'Log 1,000 hours of playtime', 'zap', 'rare', 1000, 500),
  ('hours-5000', 'Lifestyle Choice', 'Log 5,000 lifetime hours', 'flame', 'epic', 5000, 1500),
  ('renewal-freeze', 'Subscription Purge', 'Cancel 3 unused subscriptions', 'scissors', 'rare', 3, 350),
  ('wishlist-price', 'Patience Pays', 'Wait for a price drop before buying', 'tag', 'common', 1, 100),
  ('steam-deck', 'Hardware Enthusiast', 'Log your first hardware purchase', 'gamepad', 'uncommon', 1, 250),
  ('cost-per-hour', 'Efficiency Expert', 'Drop under $1 per hour on any game', 'percent', 'common', 1, 150),
  ('no-spend-7', 'Monk Mode', 'No purchases for 7 straight days', 'leaf', 'epic', 7, 800),
  ('no-spend-30', 'Enlightened', 'No purchases for 30 straight days', 'sun', 'legendary', 30, 2000),
  ('goal-3', 'Goal Getter', 'Complete 3 goals', 'target', 'uncommon', 3, 250),
  ('friend-5', 'Squad Up', 'Add 5 friends', 'users', 'common', 5, 100),
  ('wishlist-10', 'Dreamer', 'Keep 10 games on your wishlist', 'heart', 'common', 10, 100),
  ('platform-5', 'Everywhere Gamer', 'Connect 5 platforms', 'globe', 'rare', 5, 400),
  ('first-purchase', 'The First Cut', 'Track your first purchase', 'log-in', 'common', 1, 50)
on conflict (slug) do nothing;

insert into public.badges (slug, title, description, icon, tier) values
  ('early-bird', 'Early Bird', 'Signed up in the first wave of Sunk', 'bird', 'bronze'),
  ('connected', 'Multi-Platform', 'Connected 3 or more platforms', 'link', 'silver'),
  ('audit-veteran', 'Vault Veteran', 'First 100 purchases tracked', 'vault', 'silver'),
  ('insight-seeker', 'Insight Seeker', 'Viewed 50 insights', 'lightbulb', 'gold'),
  ('wallet-wizard', 'Wallet Wizard', 'Stayed under budget for a full season', 'wand', 'gold'),
  ('completionist', 'Almost Done', 'This badge is 90% complete. Classic.', 'check-circle', 'platinum')
on conflict (slug) do nothing;

insert into public.feature_flags (key, enabled, rollout, description) values
  ('wrapped_2025', true, 100, 'Wrapped year-in-review'),
  ('roast_mode', true, 100, 'Playful Roast Mode'),
  ('groups_beta', true, 50, 'Groups & group challenges'),
  ('command_palette', true, 100, 'Global command palette'),
  ('paddle_billing', true, 100, 'Paddle billing integration')
on conflict (key) do nothing;
