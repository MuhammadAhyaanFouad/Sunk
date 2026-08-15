import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Achievement,
  AskSunkReply,
  Badge,
  BillingCustomer,
  Budget,
  ConnectedPlatform,
  Friend,
  Game,
  Goal,
  Group,
  Insight,
  LeaderboardEntry,
  Notification,
  Payment,
  Profile,
  Purchase,
  RoastData,
  SearchResult,
  Stats,
  Subscription,
  WishlistItem,
  WrappedData,
  XpEvent,
} from "@/types";
import type { ConnectResult, PurchaseInput, SunkRepository } from "@/lib/api/types";
import type { PlatformId, RoastLevel } from "@/lib/constants";
import { ROAST_META } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

function toPurchase(row: Record<string, unknown>): Purchase {
  return {
    id: String(row.id),
    gameId: (row.game_id as string | null) ?? null,
    gameTitle: (row.game_title as string | null) ?? null,
    coverUrl: (row.cover_url as string | null) ?? null,
    platform: row.platform as PlatformId,
    category: row.category as Purchase["category"],
    title: String(row.title),
    amount: Number(row.amount),
    currency: String(row.currency ?? "USD"),
    purchasedAt: String(row.purchased_at),
    quantity: Number(row.quantity ?? 1),
    status: (row.status as Purchase["status"]) ?? "complete",
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    notes: (row.notes as string | null) ?? null,
  };
}

function toSubscription(row: Record<string, unknown>): Subscription {
  return {
    id: String(row.id),
    name: String(row.name),
    platform: (row.platform as PlatformId | null) ?? null,
    price: Number(row.price),
    currency: String(row.currency ?? "USD"),
    interval: (row.interval as Subscription["interval"]) ?? "monthly",
    nextRenewal: String(row.next_renewal),
    status: (row.status as Subscription["status"]) ?? "active",
    startedAt: String(row.started_at),
    autoRenew: Boolean(row.auto_renew),
    logoUrl: (row.logo_url as string | null) ?? null,
    category: (row.category as string | null) ?? null,
    lastRenewedAt: (row.last_renewed_at as string | null) ?? null,
  };
}

function toInsight(row: Record<string, unknown>): Insight {
  return {
    id: String(row.id),
    kind: row.kind as Insight["kind"],
    title: String(row.title),
    body: String(row.body),
    tone: (row.tone as Insight["tone"]) ?? "neutral",
    createdAt: String(row.created_at),
    meta: (row.meta as Record<string, unknown> | null) ?? undefined,
  };
}

export class SupabaseRepository implements SunkRepository {
  mode = "supabase" as const;
  constructor(private client: SupabaseClient) {}

  async getProfile(): Promise<Profile> {
    const { data, error } = await this.client.from("profiles").select("*").single();
    if (error) throw error;
    return {
      id: String(data.id),
      username: String(data.username ?? ""),
      displayName: String(data.display_name ?? data.username ?? ""),
      email: String(data.email ?? ""),
      avatarUrl: (data.avatar_url as string | null) ?? null,
      bio: (data.bio as string | null) ?? null,
      createdAt: String(data.created_at),
      onboarded: Boolean(data.onboarded),
      level: Number(data.level ?? 1),
      xp: Number(data.xp ?? 0),
      xpToNextLevel: Number(data.xp_to_next_level ?? 1000),
      plan: (data.plan as Profile["plan"]) ?? "free",
      country: (data.country as string | null) ?? null,
      timezone: (data.timezone as string | null) ?? null,
      referralCode: (data.referral_code as string | null) ?? null,
    };
  }

  async updateProfile(patch: Partial<Pick<Profile, "displayName" | "username" | "bio" | "avatarUrl" | "onboarded" | "country" | "timezone">>): Promise<Profile> {
    const { error } = await this.client.from("profiles").update({
      ...(patch.displayName !== undefined ? { display_name: patch.displayName } : {}),
      ...(patch.username !== undefined ? { username: patch.username } : {}),
      ...(patch.bio !== undefined ? { bio: patch.bio } : {}),
      ...(patch.avatarUrl !== undefined ? { avatar_url: patch.avatarUrl } : {}),
      ...(patch.onboarded !== undefined ? { onboarded: patch.onboarded } : {}),
      ...(patch.country !== undefined ? { country: patch.country } : {}),
      ...(patch.timezone !== undefined ? { timezone: patch.timezone } : {}),
    }).eq("id", (await this.client.auth.getUser()).data.user?.id ?? "");
    if (error) throw error;
    return this.getProfile();
  }

  async getStats(): Promise<Stats> {
    const profile = await this.getProfile();
    const [purchases, subscriptions, games] = await Promise.all([
      this.getPurchases(),
      this.getSubscriptions(),
      this.getGames(),
    ]);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const inRange = (d: string, from: Date, to: Date) => {
      const t = new Date(d).getTime();
      return t >= from.getTime() && t < to.getTime();
    };
    const monthlySpend = purchases.filter((p) => inRange(p.purchasedAt, monthStart, now)).reduce((s, p) => s + p.amount, 0);
    const lastMonthSpend = purchases.filter((p) => inRange(p.purchasedAt, prevStart, monthStart)).reduce((s, p) => s + p.amount, 0);
    const lifetimeSpend = purchases.reduce((s, p) => s + p.amount, 0);
    const totalHours = games.reduce((s, g) => s + g.playtimeHours, 0);
    return {
      lifetimeSpend,
      monthlySpend,
      lastMonthSpend,
      totalPurchases: purchases.length,
      totalGames: games.length,
      totalHours: Math.round(totalHours),
      averagePerHour: totalHours > 0 ? lifetimeSpend / totalHours : 0,
      activeSubscriptions: subscriptions.filter((s) => s.status === "active").length,
      monthlyRecurring: subscriptions.filter((s) => s.status === "active").reduce((s, sub) => s + sub.price, 0),
      spendTrend: lastMonthSpend > 0 ? (monthlySpend - lastMonthSpend) / lastMonthSpend : 0,
      budgetStreak: 0,
      level: profile.level,
      xp: profile.xp,
      xpToNextLevel: profile.xpToNextLevel,
    };
  }

  async getPlatforms(): Promise<ConnectedPlatform[]> {
    const { data, error } = await this.client.from("connected_platforms").select("*").order("connected_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: String(row.id),
      platform: row.platform as PlatformId,
      platformUserId: (row.platform_user_id as string | null) ?? null,
      displayName: (row.display_name as string | null) ?? null,
      connectedAt: String(row.connected_at),
      lastSyncedAt: (row.last_synced_at as string | null) ?? null,
      totalSpend: Number(row.total_spend ?? 0),
      totalGames: Number(row.total_games ?? 0),
      status: (row.status as ConnectedPlatform["status"]) ?? "connected",
    }));
  }

  async connectPlatform(platform: PlatformId): Promise<ConnectResult> {
    const user = (await this.client.auth.getUser()).data.user;
    if (!user) throw new Error("Unauthenticated");
    const { data, error } = await this.client.from("connected_platforms").insert({
      user_id: user.id,
      platform,
      status: "connected",
      connected_at: new Date().toISOString(),
    }).select().single();
    if (error) throw error;
    await this.client.from("platform_sync_jobs").insert({
      user_id: user.id,
      platform,
      status: "running",
      started_at: new Date().toISOString(),
    });
    return {
      platform: {
        id: String(data.id),
        platform: data.platform as PlatformId,
        platformUserId: null,
        displayName: null,
        connectedAt: String(data.connected_at),
        lastSyncedAt: null,
        totalSpend: 0,
        totalGames: 0,
        status: "connected",
      },
      synced: 0,
      discovered: 0,
    };
  }

  async disconnectPlatform(id: string): Promise<void> {
    const { error } = await this.client.from("connected_platforms").delete().eq("id", id);
    if (error) throw error;
  }

  async getGames(): Promise<Game[]> {
    const { data, error } = await this.client.from("game_library").select("*, games(*)");
    if (error) throw error;
    return (data ?? []).map((row) => {
      const g = row.games as Record<string, unknown> | null;
      return {
        id: String(row.game_id),
        title: String(g?.title ?? row.game_title ?? ""),
        slug: String(g?.slug ?? ""),
        coverUrl: (g?.cover_url as string | null) ?? null,
        developer: (g?.developer as string | null) ?? null,
        publisher: (g?.publisher as string | null) ?? null,
        genre: Array.isArray(g?.genres) ? (g.genres as string[]) : null,
        releaseDate: (g?.release_date as string | null) ?? null,
        playtimeHours: Number(row.playtime_minutes ?? 0) / 60,
        lastPlayedAt: (row.last_played_at as string | null) ?? null,
        totalSpend: Number(row.total_spend ?? 0),
        owned: Boolean(row.owned),
        platforms: (row.platforms as PlatformId[]) ?? [],
        rating: g?.rating != null ? Number(g.rating) : null,
      };
    });
  }

  async getPurchases(): Promise<Purchase[]> {
    const { data, error } = await this.client.from("purchases").select("*").order("purchased_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toPurchase);
  }

  async addPurchase(input: PurchaseInput): Promise<Purchase> {
    const user = (await this.client.auth.getUser()).data.user;
    if (!user) throw new Error("Unauthenticated");
    const { data, error } = await this.client.from("purchases").insert({
      user_id: user.id,
      game_id: input.gameId ?? null,
      platform: input.platform,
      category: input.category,
      title: input.title,
      amount: input.amount,
      currency: "USD",
      purchased_at: input.purchasedAt,
      tags: input.tags ?? [],
      notes: input.notes ?? null,
    }).select().single();
    if (error) throw error;
    return toPurchase(data);
  }

  async updatePurchase(id: string, patch: Partial<PurchaseInput>): Promise<Purchase> {
    const { error } = await this.client.from("purchases").update({
      ...(patch.title !== undefined ? { title: patch.title } : {}),
      ...(patch.amount !== undefined ? { amount: patch.amount } : {}),
      ...(patch.platform !== undefined ? { platform: patch.platform } : {}),
      ...(patch.category !== undefined ? { category: patch.category } : {}),
      ...(patch.purchasedAt !== undefined ? { purchased_at: patch.purchasedAt } : {}),
      ...(patch.tags !== undefined ? { tags: patch.tags } : {}),
      ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
    }).eq("id", id);
    if (error) throw error;
    return this.getPurchases().then((all) => all.find((p) => p.id === id)!);
  }

  async deletePurchase(id: string): Promise<void> {
    const { error } = await this.client.from("purchases").delete().eq("id", id);
    if (error) throw error;
  }

  async getSubscriptions(): Promise<Subscription[]> {
    const { data, error } = await this.client.from("subscriptions").select("*").order("next_renewal", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(toSubscription);
  }

  async updateSubscription(id: string, patch: Partial<Subscription>): Promise<Subscription> {
    const { error } = await this.client.from("subscriptions").update({
      ...(patch.price !== undefined ? { price: patch.price } : {}),
      ...(patch.autoRenew !== undefined ? { auto_renew: patch.autoRenew } : {}),
      ...(patch.status !== undefined ? { status: patch.status } : {}),
    }).eq("id", id);
    if (error) throw error;
    return this.getSubscriptions().then((all) => all.find((s) => s.id === id)!);
  }

  async getBudget(): Promise<Budget> {
    const { data, error } = await this.client.from("budgets").select("*, budget_history(*)").maybeSingle();
    if (error) throw error;
    if (!data) return { id: "none", monthlyLimit: 0, currentSpend: 0, startDate: new Date().toISOString(), resetDay: 1, streak: 0, bestStreak: 0, personalBestMonth: null, personalBestSpend: 0, history: [] };
    return {
      id: String(data.id),
      monthlyLimit: Number(data.monthly_limit),
      currentSpend: Number(data.current_spend),
      startDate: String(data.start_date),
      resetDay: Number(data.reset_day ?? 1),
      streak: Number(data.streak ?? 0),
      bestStreak: Number(data.best_streak ?? 0),
      personalBestMonth: (data.personal_best_month as string | null) ?? null,
      personalBestSpend: Number(data.personal_best_spend ?? 0),
      history: (data.budget_history ?? []).map((h: Record<string, unknown>) => ({ month: String(h.month), spent: Number(h.spent), limit: Number(h.limit) })),
    };
  }

  async updateBudgetLimit(limit: number): Promise<Budget> {
    const { error } = await this.client.from("budgets").update({ monthly_limit: limit }).eq("id", "default");
    if (error) throw error;
    return this.getBudget();
  }

  async getGoals(): Promise<Goal[]> {
    const { data, error } = await this.client.from("goals").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: String(row.id),
      title: String(row.title),
      type: row.type as Goal["type"],
      target: Number(row.target),
      current: Number(row.current),
      unit: (row.unit as Goal["unit"]) ?? "money",
      startDate: String(row.started_at ?? row.created_at),
      endDate: (row.end_date as string | null) ?? null,
      status: (row.status as Goal["status"]) ?? "active",
      streak: Number(row.streak ?? 0),
    }));
  }

  async addGoal(input: Omit<Goal, "id" | "status" | "streak">): Promise<Goal> {
    const user = (await this.client.auth.getUser()).data.user;
    if (!user) throw new Error("Unauthenticated");
    const { data, error } = await this.client.from("goals").insert({
      user_id: user.id,
      title: input.title,
      type: input.type,
      target: input.target,
      current: input.current ?? 0,
      unit: input.unit,
      started_at: input.startDate,
      end_date: input.endDate,
    }).select().single();
    if (error) throw error;
    return {
      id: String(data.id),
      title: String(data.title),
      type: data.type as Goal["type"],
      target: Number(data.target),
      current: Number(data.current),
      unit: (data.unit as Goal["unit"]) ?? "money",
      startDate: String(data.started_at ?? data.created_at),
      endDate: (data.end_date as string | null) ?? null,
      status: (data.status as Goal["status"]) ?? "active",
      streak: Number(data.streak ?? 0),
    };
  }

  async getInsights(): Promise<Insight[]> {
    const { data, error } = await this.client.from("insights").select("*").order("created_at", { ascending: false }).limit(50);
    if (error) throw error;
    return (data ?? []).map(toInsight);
  }

  async getAchievements(): Promise<Achievement[]> {
    const { data, error } = await this.client.from("achievements").select("*").order("xp_reward", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: String(row.id),
      slug: String(row.slug),
      title: String(row.title),
      description: String(row.description),
      icon: String(row.icon ?? "trophy"),
      rarity: (row.rarity as Achievement["rarity"]) ?? "common",
      progress: Number(row.progress ?? 0),
      target: Number(row.target),
      unlocked: Boolean(row.unlocked),
      unlockedAt: (row.unlocked_at as string | null) ?? null,
      xpReward: Number(row.xp_reward ?? 0),
    }));
  }

  async getBadges(): Promise<Badge[]> {
    const { data, error } = await this.client.from("user_badges").select("*, badges(*)");
    if (error) throw error;
    return (data ?? []).map((row) => {
      const b = row.badges as Record<string, unknown> | null;
      return {
        id: String(row.badge_id),
        slug: String(b?.slug ?? ""),
        title: String(b?.title ?? ""),
        description: String(b?.description ?? ""),
        icon: String(b?.icon ?? "award"),
        tier: String(b?.tier ?? "bronze"),
        earnedAt: (row.earned_at as string | null) ?? null,
      };
    });
  }

  async getXpEvents(): Promise<XpEvent[]> {
    const { data, error } = await this.client.from("xp_events").select("*").order("created_at", { ascending: false }).limit(50);
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: String(row.id),
      type: String(row.type),
      amount: Number(row.amount),
      createdAt: String(row.created_at),
      description: String(row.description ?? ""),
    }));
  }

  async getNotifications(): Promise<Notification[]> {
    const { data, error } = await this.client.from("notifications").select("*").order("created_at", { ascending: false }).limit(50);
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: String(row.id),
      kind: (row.kind as Notification["kind"]) ?? "system",
      title: String(row.title),
      body: String(row.body),
      read: Boolean(row.read),
      createdAt: String(row.created_at),
      actionHref: (row.action_href as string | null) ?? null,
    }));
  }

  async markNotificationsRead(ids?: string[]): Promise<void> {
    if (ids && ids.length > 0) {
      await this.client.from("notifications").update({ read: true }).in("id", ids);
    } else {
      await this.client.from("notifications").update({ read: true }).eq("read", false);
    }
  }

  async getFriends(): Promise<Friend[]> {
    const { data, error } = await this.client.from("friends").select("*");
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: String(row.id),
      username: String(row.username),
      displayName: String(row.display_name ?? row.username),
      avatarUrl: (row.avatar_url as string | null) ?? null,
      status: (row.status as Friend["status"]) ?? "offline",
      level: Number(row.level ?? 1),
      xp: Number(row.xp ?? 0),
      lifetimeSpend: Number(row.lifetime_spend ?? 0),
      monthlySpend: Number(row.monthly_spend ?? 0),
      lastActiveAt: (row.last_active_at as string | null) ?? null,
      isFriend: true,
      pending: false,
    }));
  }

  async getGroups(): Promise<Group[]> {
    const { data, error } = await this.client.from("groups").select("*");
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: String(row.id),
      name: String(row.name),
      description: (row.description as string | null) ?? null,
      memberCount: Number(row.member_count ?? 0),
      avatarUrl: (row.avatar_url as string | null) ?? null,
      monthlyChallenge: (row.monthly_challenge as Group["monthlyChallenge"]) ?? null,
    }));
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const { data, error } = await this.client.from("leaderboards").select("*").order("lifetime_spend", { ascending: false }).limit(50);
    if (error) throw error;
    return (data ?? []).map((row, i) => ({
      rank: i + 1,
      userId: String(row.user_id),
      username: String(row.username),
      displayName: String(row.display_name ?? row.username),
      avatarUrl: (row.avatar_url as string | null) ?? null,
      level: Number(row.level ?? 1),
      lifetimeSpend: Number(row.lifetime_spend ?? 0),
      monthlySpend: Number(row.monthly_spend ?? 0),
      weeklyChange: Number(row.weekly_change ?? 0),
      isYou: Boolean(row.is_you),
    }));
  }

  async getWishlist(): Promise<WishlistItem[]> {
    const { data, error } = await this.client.from("wishlist").select("*, wishlist_price_history(*)").order("added_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: String(row.id),
      title: String(row.title),
      coverUrl: (row.cover_url as string | null) ?? null,
      platform: (row.platform as PlatformId | null) ?? null,
      price: row.price != null ? Number(row.price) : null,
      priceHistory: (row.wishlist_price_history ?? []).map((h: Record<string, unknown>) => ({ date: String(h.created_at), price: Number(h.price) })),
      addedAt: String(row.added_at),
      notified: Boolean(row.notified),
    }));
  }

  async addWishlistItem(title: string): Promise<WishlistItem> {
    const user = (await this.client.auth.getUser()).data.user;
    if (!user) throw new Error("Unauthenticated");
    const { data, error } = await this.client.from("wishlist").insert({ user_id: user.id, title }).select().single();
    if (error) throw error;
    return {
      id: String(data.id),
      title: String(data.title),
      coverUrl: null,
      platform: null,
      price: null,
      priceHistory: [],
      addedAt: String(data.added_at),
      notified: false,
    };
  }

  async removeWishlistItem(id: string): Promise<void> {
    const { error } = await this.client.from("wishlist").delete().eq("id", id);
    if (error) throw error;
  }

  async getWrapped(): Promise<WrappedData> {
    const [purchases, subscriptions] = await Promise.all([this.getPurchases(), this.getSubscriptions()]);
    const year = new Date().getFullYear();
    const yearPurchases = purchases.filter((p) => new Date(p.purchasedAt).getFullYear() === year);
    const totalSpend = yearPurchases.reduce((s, p) => s + p.amount, 0);
    const byGame = new Map<string, { title: string; amount: number; count: number }>();
    for (const p of yearPurchases) {
      const key = p.gameTitle ?? p.title;
      const cur = byGame.get(key) ?? { title: key, amount: 0, count: 0 };
      cur.amount += p.amount;
      cur.count += 1;
      byGame.set(key, cur);
    }
    const topGame = [...byGame.values()].sort((a, b) => b.amount - a.amount)[0] ?? null;
    const topGames = [...byGame.values()].sort((a, b) => b.amount - a.amount).slice(0, 5);
    const platformBreakdown: { platform: PlatformId; amount: number }[] = [];
    const byPlatform = new Map<PlatformId, number>();
    for (const p of yearPurchases) byPlatform.set(p.platform, (byPlatform.get(p.platform) ?? 0) + p.amount);
    for (const [platform, amount] of byPlatform) platformBreakdown.push({ platform, amount });
    platformBreakdown.sort((a, b) => b.amount - a.amount);
    return {
      year,
      totalSpend: Math.round(totalSpend * 100) / 100,
      totalPurchases: yearPurchases.length,
      topGame,
      topGames,
      topPlatform: platformBreakdown[0]?.platform ?? null,
      mostPlayed: null,
      mostExpensive: topGame,
      subscriptionsActive: subscriptions.filter((s) => s.status === "active").length,
      hoursPlayed: 0,
      purchasesByMonth: [],
      platformBreakdown,
      peakMonth: null,
      spendingPersonality: totalSpend > 4000 ? "The Full Send" : totalSpend > 2500 ? "The Collector" : "The Value Seeker",
      personalityTitle: totalSpend > 4000 ? "The Full Send" : totalSpend > 2500 ? "The Collector" : "The Value Seeker",
      shareable: true,
    };
  }

  async getRoast(level: RoastLevel): Promise<RoastData> {
    const { data, error } = await this.client.from("roast_preferences").select("lines").eq("level", level).maybeSingle();
    if (error || !data) return { level, lines: [] };
    return { level, lines: (data.lines as string[]) ?? [] };
  }

  async askSunk(query: string): Promise<AskSunkReply> {
    const [stats, budget] = await Promise.all([this.getStats(), this.getBudget()]);
    const remaining = Math.max(0, Math.round((budget.monthlyLimit - budget.currentSpend) * 100) / 100);
    const amountMatch = query.match(/(?:\$|€|£)?\s*(\d+(?:[.,]\d+)?)/);
    const amount = amountMatch ? Number(amountMatch[1].replace(",", ".")) : null;
    const hint = `You have ${formatCurrency(remaining)} left this month`;
    if (amount !== null && Number.isFinite(amount)) {
      if (amount <= remaining) {
        return { verdict: "yes", answer: `${formatCurrency(amount)} fits inside the ${formatCurrency(remaining)} you have left this month.`, hint };
      }
      return { verdict: "no", answer: `${formatCurrency(amount)} is more than the ${formatCurrency(remaining)} you have left.`, hint };
    }
    return {
      verdict: "yes",
      answer: `You've spent ${formatCurrency(stats.monthlySpend)} this month against a ${formatCurrency(budget.monthlyLimit)} budget. Ask me "can I buy X for $50" and I'll check it against what's left.`,
      hint,
    };
  }

  async search(query: string): Promise<SearchResult[]> {
    if (!query.trim()) return [];
    const { error } = await this.client.from("search_history").insert({ query: query.trim() });
    void error;
    const q = query.trim();
    const results: SearchResult[] = [];
    const { data: purchases } = await this.client.from("purchases").select("id,title,platform,purchased_at,cover_url,amount").ilike("title", `%${q}%`).limit(6);
    for (const p of purchases ?? []) {
      results.push({ type: "purchase", id: String(p.id), title: String(p.title), subtitle: `${String(p.platform)} · ${new Date(String(p.purchased_at)).toLocaleDateString()}`, amount: Number(p.amount), href: "/app/vault", coverUrl: (p.cover_url as string | null) ?? null });
    }
    return results;
  }

  async getBilling(): Promise<BillingCustomer> {
    const { data, error } = await this.client.from("billing_customers").select("*, billing_subscriptions(*)").maybeSingle();
    if (error) throw error;
    if (!data) return { plan: "free", payoneerSubscriptionId: null, status: "none", nextBillingAt: null, price: null, currency: "USD", joinedAt: new Date().toISOString() };
    const sub = (data.billing_subscriptions as Record<string, unknown>[] | null)?.[0];
    return {
      plan: (data.plan as BillingCustomer["plan"]) ?? "free",
      payoneerSubscriptionId: (data.payoneer_subscription_id as string | null) ?? null,
      status: ((sub?.status as BillingCustomer["status"]) ?? (data.status as BillingCustomer["status"])) ?? "none",
      nextBillingAt: (sub?.next_billing_at as string | null) ?? null,
      price: sub?.price != null ? Number(sub.price) : null,
      currency: (sub?.currency as string | null) ?? "USD",
      joinedAt: String(data.joined_at ?? new Date().toISOString()),
    };
  }

  async getPayments(): Promise<Payment[]> {
    const { data, error } = await this.client.from("payments").select("*").order("paid_at", { ascending: false }).limit(30);
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: String(row.id),
      amount: Number(row.amount),
      currency: String(row.currency ?? "USD"),
      status: (row.status as Payment["status"]) ?? "paid",
      paidAt: String(row.paid_at),
      description: String(row.description),
      method: String(row.method ?? ""),
      last4: (row.last4 as string | null) ?? null,
    }));
  }

  async upgradeToPremium(): Promise<BillingCustomer> {
    throw new Error("Premium upgrades are handled server-side through Payoneer.");
  }

  async resetDemoData(): Promise<void> {
    throw new Error("resetDemoData is only available in demo mode.");
  }
}

export const ROAST_META_FALLBACK = ROAST_META;
