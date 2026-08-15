"use client";

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
import type {
  ConnectResult,
  PurchaseInput,
  SunkRepository,
} from "@/lib/api/types";
import type { PlatformId, RoastLevel } from "@/lib/constants";
import {
  DEMO_ACHIEVEMENTS,
  DEMO_BADGES,
  DEMO_BUDGET,
  DEMO_FRIENDS,
  DEMO_GAMES,
  DEMO_GOALS,
  DEMO_GROUPS,
  DEMO_INSIGHTS,
  DEMO_LEADERBOARD,
  DEMO_NOTIFICATIONS,
  DEMO_PLATFORMS,
  DEMO_PROFILE,
  DEMO_PURCHASES,
  DEMO_ROAST,
  DEMO_SUBSCRIPTIONS,
  DEMO_WISHLIST,
  DEMO_XP_EVENTS,
} from "@/lib/demo/seed";
import { formatCurrency, uid } from "@/lib/utils";

const STORAGE_KEY = "sunk.demo.v2";

interface DemoState {
  profile: Profile;
  platforms: ConnectedPlatform[];
  games: Game[];
  purchases: Purchase[];
  subscriptions: Subscription[];
  budget: Budget;
  goals: Goal[];
  insights: Insight[];
  achievements: Achievement[];
  badges: Badge[];
  notifications: Notification[];
  friends: Friend[];
  groups: Group[];
  leaderboard: LeaderboardEntry[];
  wishlist: WishlistItem[];
  xpEvents: XpEvent[];
  billing: BillingCustomer;
  payments: Payment[];
}

const DEFAULT_BILLING: BillingCustomer = {
  plan: "premium",
  payoneerSubscriptionId: "sub_demo_payoneer",
  status: "active",
  nextBillingAt: new Date(Date.now() + 20 * 86400000).toISOString(),
  price: 4.99,
  currency: "USD",
  joinedAt: DEMO_PROFILE.createdAt,
};

const DEFAULT_PAYMENTS: Payment[] = [
  { id: "pay_1", amount: 4.99, currency: "USD", status: "paid", paidAt: new Date(Date.now() - 11 * 86400000).toISOString(), description: "Sunk Premium — monthly", method: "Visa", last4: "4242" },
  { id: "pay_2", amount: 4.99, currency: "USD", status: "paid", paidAt: new Date(Date.now() - 41 * 86400000).toISOString(), description: "Sunk Premium — monthly", method: "Visa", last4: "4242" },
  { id: "pay_3", amount: 4.99, currency: "USD", status: "paid", paidAt: new Date(Date.now() - 71 * 86400000).toISOString(), description: "Sunk Premium — monthly", method: "Visa", last4: "4242" },
  { id: "pay_4", amount: 59.99, currency: "USD", status: "paid", paidAt: new Date(Date.now() - 140 * 86400000).toISOString(), description: "Baldur's Gate 3", method: "PayPal", last4: null },
];

function buildState(): DemoState {
  return {
    profile: { ...DEMO_PROFILE },
    platforms: DEMO_PLATFORMS.map((p) => ({ ...p })),
    games: DEMO_GAMES.map((g) => ({ ...g, genre: g.genre ? [...g.genre] : null, platforms: [...g.platforms] })),
    purchases: DEMO_PURCHASES.map((p) => ({ ...p, tags: [...p.tags] })),
    subscriptions: DEMO_SUBSCRIPTIONS.map((s) => ({ ...s })),
    budget: { ...DEMO_BUDGET, history: DEMO_BUDGET.history.map((h) => ({ ...h })) },
    goals: DEMO_GOALS.map((g) => ({ ...g }) as Goal),
    insights: DEMO_INSIGHTS.map((i) => ({ ...i })),
    achievements: DEMO_ACHIEVEMENTS.map((a) => ({ ...a })),
    badges: DEMO_BADGES.map((b) => ({ ...b })),
    notifications: DEMO_NOTIFICATIONS.map((n) => ({ ...n })),
    friends: DEMO_FRIENDS.map((f) => ({ ...f })),
    groups: DEMO_GROUPS.map((g) => ({ ...g })),
    leaderboard: DEMO_LEADERBOARD.map((l) => ({ ...l })),
    wishlist: DEMO_WISHLIST.map((w) => ({ ...w, priceHistory: w.priceHistory.map((h) => ({ ...h })) })),
    xpEvents: DEMO_XP_EVENTS.map((x) => ({ ...x })),
    billing: { ...DEFAULT_BILLING },
    payments: DEFAULT_PAYMENTS.map((p) => ({ ...p })),
  };
}

function isBrowser() {
  return typeof window !== "undefined";
}

function load(): DemoState {
  if (!isBrowser()) return buildState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<DemoState>;
      const base = buildState();
      const fresh: DemoState = {
        ...base,
        ...parsed,
        profile: { ...base.profile, ...(parsed.profile ?? {}) },
        budget: { ...base.budget, ...(parsed.budget ?? {}), history: parsed.budget?.history?.length ? parsed.budget.history : base.budget.history },
      };
      return fresh;
    }
  } catch {
    /* ignore corrupt cache */
  }
  return buildState();
}

function persist(state: DemoState) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage full or unavailable */
  }
}

const wait = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));

function parseAskAmount(q: string): number | null {
  const m = q.match(/(?:\$|€|£)?\s*(\d+(?:[.,]\d+)?)/);
  if (!m) return null;
  const n = Number(m[1].replace(",", "."));
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100) / 100;
}

/* Designed demo numbers — the dashboard/profile/roast/wrapped copy is written
   against these, so pristine demo data must reproduce them exactly. Live user
   mutations stack on top as deltas. */
const DESIGNED = {
  lifetimeSpend: 2984.13,
  monthlySpend: 268.42,
  lastMonthSpend: 304.15,
  totalGames: 156,
  totalHours: 2648,
  spendTrend: -0.12,
};

function seedBaseline() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const inRange = (d: string, from: Date, to: Date) => {
    const t = new Date(d).getTime();
    return t >= from.getTime() && t < to.getTime();
  };
  const completed = DEMO_PURCHASES.filter((p) => p.status !== "refunded");
  return {
    lifetime: completed.reduce((s, p) => s + p.amount, 0),
    monthly: completed.filter((p) => inRange(p.purchasedAt, monthStart, now)).reduce((s, p) => s + p.amount, 0),
    lastMonth: completed.filter((p) => inRange(p.purchasedAt, prevStart, monthStart)).reduce((s, p) => s + p.amount, 0),
    count: completed.length,
    activeSubs: DEMO_SUBSCRIPTIONS.filter((s) => s.status === "active").length,
    recurring: DEMO_SUBSCRIPTIONS.filter((s) => s.status === "active").reduce((s, sub) => s + sub.price, 0),
  };
}

const SEED_BASELINE = seedBaseline();

export class DemoRepository implements SunkRepository {
  mode = "demo" as const;
  private state: DemoState = load();

  private get latest() {
    return this.state;
  }

  private save() {
    persist(this.state);
  }

  private randomPlaytime(): number {
    return Math.round(Math.random() * 40 + 5);
  }

  private computeStats(): Stats {
    const { purchases, subscriptions, profile } = this.state;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const inRange = (d: string, from: Date, to: Date) => {
      const t = new Date(d).getTime();
      return t >= from.getTime() && t < to.getTime();
    };
    const completed = purchases.filter((p) => p.status !== "refunded");
    const live = {
      lifetime: completed.reduce((s, p) => s + p.amount, 0),
      monthly: completed.filter((p) => inRange(p.purchasedAt, monthStart, now)).reduce((s, p) => s + p.amount, 0),
      lastMonth: completed.filter((p) => inRange(p.purchasedAt, prevStart, monthStart)).reduce((s, p) => s + p.amount, 0),
      count: completed.length,
      activeSubs: subscriptions.filter((s) => s.status === "active").length,
      recurring: subscriptions.filter((s) => s.status === "active").reduce((s, sub) => s + sub.price, 0),
    };
    const totalHours = DESIGNED.totalHours;
    const lifetimeSpend = Math.round((DESIGNED.lifetimeSpend + (live.lifetime - SEED_BASELINE.lifetime)) * 100) / 100;
    const monthlySpend = Math.round((DESIGNED.monthlySpend + (live.monthly - SEED_BASELINE.monthly)) * 100) / 100;
    const lastMonthSpend = Math.round((DESIGNED.lastMonthSpend + (live.lastMonth - SEED_BASELINE.lastMonth)) * 100) / 100;
    return {
      lifetimeSpend,
      monthlySpend,
      lastMonthSpend,
      totalPurchases: SEED_BASELINE.count + (live.count - SEED_BASELINE.count),
      totalGames: DESIGNED.totalGames,
      totalHours,
      averagePerHour: lifetimeSpend / totalHours,
      activeSubscriptions: SEED_BASELINE.activeSubs + (live.activeSubs - SEED_BASELINE.activeSubs),
      monthlyRecurring: Math.round((SEED_BASELINE.recurring + (live.recurring - SEED_BASELINE.recurring)) * 100) / 100,
      spendTrend: DESIGNED.spendTrend,
      budgetStreak: this.state.budget.streak,
      level: profile.level,
      xp: profile.xp,
      xpToNextLevel: profile.xpToNextLevel,
    };
  }

  async getProfile(): Promise<Profile> {
    await wait(140);
    return { ...this.state.profile };
  }

  async updateProfile(patch: Partial<Pick<Profile, "displayName" | "username" | "bio" | "avatarUrl" | "onboarded" | "country" | "timezone">>): Promise<Profile> {
    await wait();
    this.state.profile = { ...this.state.profile, ...patch };
    this.save();
    return { ...this.state.profile };
  }

  async getStats(): Promise<Stats> {
    await wait(160);
    return this.computeStats();
  }

  async getPlatforms(): Promise<ConnectedPlatform[]> {
    await wait(120);
    return this.state.platforms.map((p) => ({ ...p }));
  }

  async connectPlatform(platform: PlatformId): Promise<ConnectResult> {
    await wait(1400);
    const existing = this.state.platforms.find((p) => p.platform === platform);
    if (existing) {
      existing.status = "connected";
      existing.lastSyncedAt = new Date().toISOString();
      this.save();
      return { platform: { ...existing }, synced: 12, discovered: 0 };
    }
    const fresh: ConnectedPlatform = {
      id: uid(),
      platform,
      platformUserId: null,
      displayName: "nova",
      connectedAt: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString(),
      totalSpend: 0,
      totalGames: 0,
      status: "connected",
    };
    this.state.platforms.push(fresh);
    this.save();
    return { platform: { ...fresh }, synced: 0, discovered: 0 };
  }

  async disconnectPlatform(id: string): Promise<void> {
    await wait();
    this.state.platforms = this.state.platforms.filter((p) => p.id !== id);
    this.save();
  }

  async getGames(): Promise<Game[]> {
    await wait(160);
    return this.state.games.map((g) => ({ ...g, genre: g.genre ? [...g.genre] : null, platforms: [...g.platforms] }));
  }

  async getPurchases(): Promise<Purchase[]> {
    await wait(180);
    return this.state.purchases.map((p) => ({ ...p, tags: [...p.tags] }));
  }

  async addPurchase(input: PurchaseInput): Promise<Purchase> {
    await wait(260);
    const game = input.gameId ? this.state.games.find((g) => g.id === input.gameId) : undefined;
    const purchase: Purchase = {
      id: uid(),
      gameId: input.gameId ?? null,
      gameTitle: game?.title ?? null,
      coverUrl: game?.coverUrl ?? null,
      platform: input.platform,
      category: input.category,
      title: input.title,
      amount: input.amount,
      currency: "USD",
      purchasedAt: input.purchasedAt,
      quantity: 1,
      status: "complete",
      tags: input.tags ?? [],
      notes: input.notes ?? null,
    };
    this.state.purchases.unshift(purchase);
    this.save();
    return { ...purchase };
  }

  async updatePurchase(id: string, patch: Partial<PurchaseInput>): Promise<Purchase> {
    await wait(220);
    const idx = this.state.purchases.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Purchase not found");
    this.state.purchases[idx] = { ...this.state.purchases[idx], ...patch } as Purchase;
    this.save();
    return { ...this.state.purchases[idx] };
  }

  async deletePurchase(id: string): Promise<void> {
    await wait(180);
    this.state.purchases = this.state.purchases.filter((p) => p.id !== id);
    this.save();
  }

  async getSubscriptions(): Promise<Subscription[]> {
    await wait(140);
    return this.state.subscriptions.map((s) => ({ ...s }));
  }

  async updateSubscription(id: string, patch: Partial<Subscription>): Promise<Subscription> {
    await wait(220);
    const idx = this.state.subscriptions.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error("Subscription not found");
    this.state.subscriptions[idx] = { ...this.state.subscriptions[idx], ...patch };
    this.save();
    return { ...this.state.subscriptions[idx] };
  }

  async getBudget(): Promise<Budget> {
    await wait(150);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const liveMonth = this.state.purchases
      .filter((p) => p.status !== "refunded" && new Date(p.purchasedAt).getTime() >= monthStart)
      .reduce((s, p) => s + p.amount, 0);
    const currentSpend = Math.round((DESIGNED.monthlySpend + (liveMonth - SEED_BASELINE.monthly)) * 100) / 100;
    return {
      ...this.state.budget,
      currentSpend,
      history: this.state.budget.history.map((h) => ({ ...h })),
    };
  }

  async updateBudgetLimit(limit: number): Promise<Budget> {
    await wait(200);
    this.state.budget = { ...this.state.budget, monthlyLimit: limit };
    this.save();
    return { ...this.state.budget, history: this.state.budget.history.map((h) => ({ ...h })) };
  }

  async getGoals(): Promise<Goal[]> {
    await wait(150);
    return this.state.goals.map((g) => ({ ...g }));
  }

  async addGoal(input: Omit<Goal, "id" | "status" | "streak">): Promise<Goal> {
    await wait(240);
    const goal: Goal = { ...input, id: uid(), status: "active", streak: 0 };
    this.state.goals.unshift(goal);
    this.save();
    return { ...goal };
  }

  async getInsights(): Promise<Insight[]> {
    await wait(170);
    return this.state.insights.map((i) => ({ ...i }));
  }

  async getAchievements(): Promise<Achievement[]> {
    await wait(150);
    return this.state.achievements.map((a) => ({ ...a }));
  }

  async getBadges(): Promise<Badge[]> {
    await wait(120);
    return this.state.badges.map((b) => ({ ...b }));
  }

  async getXpEvents(): Promise<XpEvent[]> {
    await wait(130);
    return this.state.xpEvents.map((x) => ({ ...x }));
  }

  async getNotifications(): Promise<Notification[]> {
    await wait(150);
    return this.state.notifications.map((n) => ({ ...n }));
  }

  async markNotificationsRead(ids?: string[]): Promise<void> {
    await wait(120);
    if (!ids || ids.length === 0) {
      this.state.notifications = this.state.notifications.map((n) => ({ ...n, read: true }));
    } else {
      this.state.notifications = this.state.notifications.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n));
    }
    this.save();
  }

  async getFriends(): Promise<Friend[]> {
    await wait(140);
    return this.state.friends.map((f) => ({ ...f }));
  }

  async getGroups(): Promise<Group[]> {
    await wait(130);
    return this.state.groups.map((g) => ({ ...g }));
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    await wait(150);
    return this.state.leaderboard.map((l) => ({ ...l }));
  }

  async getWishlist(): Promise<WishlistItem[]> {
    await wait(140);
    return this.state.wishlist.map((w) => ({ ...w, priceHistory: w.priceHistory.map((h) => ({ ...h })) }));
  }

  async addWishlistItem(title: string): Promise<WishlistItem> {
    await wait(220);
    const item: WishlistItem = {
      id: uid(),
      title,
      coverUrl: null,
      platform: "steam",
      price: null,
      priceHistory: [],
      addedAt: new Date().toISOString(),
      notified: false,
    };
    this.state.wishlist.unshift(item);
    this.save();
    return { ...item };
  }

  async removeWishlistItem(id: string): Promise<void> {
    await wait(160);
    this.state.wishlist = this.state.wishlist.filter((w) => w.id !== id);
    this.save();
  }

  async getWrapped(): Promise<WrappedData> {
    await wait(420);
    const purchases = this.state.purchases;
    const yearPurchases = purchases.filter((p) => new Date(p.purchasedAt).getFullYear() === 2025);
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
    const byPlatform = new Map<PlatformId, number>();
    for (const p of yearPurchases) byPlatform.set(p.platform, (byPlatform.get(p.platform) ?? 0) + p.amount);
    const platformBreakdown = [...byPlatform.entries()]
      .map(([platform, amount]) => ({ platform, amount }))
      .sort((a, b) => b.amount - a.amount);
    const byMonth = new Map<string, { amount: number; count: number }>();
    for (const p of yearPurchases) {
      const m = p.purchasedAt.slice(0, 7);
      const cur = byMonth.get(m) ?? { amount: 0, count: 0 };
      cur.amount += p.amount;
      cur.count += 1;
      byMonth.set(m, cur);
    }
    const purchasesByMonth = [...byMonth.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, v]) => ({ month: month.slice(5) + "/" + month.slice(2, 4), amount: Math.round(v.amount * 100) / 100, count: v.count }));
    const peak = purchasesByMonth.reduce<{ month: string; amount: number } | null>((acc, m) => (acc === null || m.amount > acc.amount ? { month: m.month, amount: m.amount } : acc), null);
    const personality = totalSpend > 4000 ? "The Full Send" : totalSpend > 2500 ? "The Collector" : "The Value Seeker";
    const persona = personality;

    return {
      year: 2025,
      totalSpend: Math.round(totalSpend * 100) / 100,
      totalPurchases: yearPurchases.length,
      topGame,
      topGames,
      topPlatform: platformBreakdown[0]?.platform ?? null,
      mostPlayed: { title: "Counter-Strike 2", hours: 312 },
      mostExpensive: topGame,
      subscriptionsActive: this.state.subscriptions.filter((s) => s.status === "active").length,
      hoursPlayed: 812,
      purchasesByMonth,
      platformBreakdown,
      peakMonth: peak?.month ?? null,
      spendingPersonality: persona,
      personalityTitle: persona,
      shareable: true,
    };
  }

  async getRoast(level: RoastLevel): Promise<RoastData> {
    await wait(600);
    if (level === "off") return { level, lines: [] };
    return { level, lines: DEMO_ROAST[level] };
  }

  async search(query: string): Promise<SearchResult[]> {
    await wait(140);
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const results: SearchResult[] = [];
    for (const p of this.state.purchases.slice(0, 400)) {
      if (p.title.toLowerCase().includes(q)) {
        results.push({ type: "purchase", id: p.id, title: p.title, subtitle: `${p.platform} · ${new Date(p.purchasedAt).toLocaleDateString()}`, amount: p.amount, href: "/app/vault", coverUrl: p.coverUrl });
        if (results.length >= 8) break;
      }
    }
    if (results.length < 8) {
      for (const g of this.state.games) {
        if (g.title.toLowerCase().includes(q)) {
          results.push({ type: "game", id: g.id, title: g.title, subtitle: `${g.playtimeHours}h played · ${g.developer ?? "?"}`, href: "/app/library", coverUrl: g.coverUrl });
          if (results.length >= 8) break;
        }
      }
    }
    if (results.length < 8) {
      for (const s of this.state.subscriptions) {
        if (s.name.toLowerCase().includes(q)) {
          results.push({ type: "subscription", id: s.id, title: s.name, subtitle: `${s.price}/mo`, href: "/app/subscriptions" });
          if (results.length >= 8) break;
        }
      }
    }
    return results;
  }

  async askSunk(query: string): Promise<AskSunkReply> {
    await wait(520);
    const q = query.trim().toLowerCase();
    const stats = await this.getStats();
    const budget = await this.getBudget();
    const remaining = Math.max(0, Math.round((budget.monthlyLimit - budget.currentSpend) * 100) / 100);
    const amount = parseAskAmount(q);
    const hint = `${formatCurrency(budget.currentSpend)} of ${formatCurrency(budget.monthlyLimit)} used this month · ${formatCurrency(remaining)} left`;

    if (/budget|limit|how much.*(left|remain)|this month/.test(q) && amount === null) {
      return {
        verdict: "yes",
        answer: `You've spent ${formatCurrency(budget.currentSpend)} of your ${formatCurrency(budget.monthlyLimit)} monthly budget, so you have ${formatCurrency(remaining)} left to play with.`,
        hint,
      };
    }

    if (/subscription|recurring|per month|a month|monthly fee/.test(q)) {
      if (amount !== null) {
        const yearly = Math.round(amount * 12 * 100) / 100;
        const fits = yearly <= remaining;
        return {
          verdict: fits ? "yes" : "maybe",
          answer: `A ${formatCurrency(amount)}/mo sub runs ~${formatCurrency(yearly)} a year. Against the ${formatCurrency(remaining)} you have left, that's ${fits ? "well within reach" : "a real bite out of your month"}.`,
          hint,
        };
      }
      return {
        verdict: "maybe",
        answer: `You're paying ${formatCurrency(stats.monthlyRecurring)}/mo in active subscriptions — ${formatCurrency(Math.round(stats.monthlyRecurring * 12 * 100) / 100)}/yr before you even buy a single game. Worth a prune.`,
        hint,
      };
    }

    if (amount !== null) {
      if (amount <= remaining * 0.4) {
        return {
          verdict: "yes",
          answer: `You're clear. ${formatCurrency(amount)} fits comfortably inside the ${formatCurrency(remaining)} you have left this month — go on, treat yourself.`,
          hint,
        };
      }
      if (amount <= remaining) {
        return {
          verdict: "maybe",
          answer: `It's affordable on paper — ${formatCurrency(amount)} against ${formatCurrency(remaining)} left. But it would eat most of the month, so make sure it's worth it.`,
          hint,
        };
      }
      return {
        verdict: "no",
        answer: `Not this month. ${formatCurrency(amount)} is more than the ${formatCurrency(remaining)} you have left in budget.`,
        hint,
      };
    }

    return {
      verdict: "yes",
      answer: `Here's the state of play: ${formatCurrency(stats.lifetimeSpend)} spent all-time across ${stats.totalPurchases} purchases, ${formatCurrency(stats.monthlySpend)} this month against a ${formatCurrency(budget.monthlyLimit)} budget. Ask me something like "can I buy this game for $50" and I'll give you a straight answer.`,
      hint,
    };
  }

  async getBilling(): Promise<BillingCustomer> {
    await wait(150);
    return { ...this.state.billing };
  }

  async getPayments(): Promise<Payment[]> {
    await wait(160);
    return this.state.payments.map((p) => ({ ...p }));
  }

  async upgradeToPremium(): Promise<BillingCustomer> {
    await wait(1200);
    this.state.billing = {
      ...this.state.billing,
      plan: "premium",
      payoneerSubscriptionId: "sub_demo_payoneer",
      status: "active",
      nextBillingAt: new Date(Date.now() + 30 * 86400000).toISOString(),
      price: 4.99,
    };
    this.save();
    return { ...this.state.billing };
  }

  async resetDemoData(): Promise<void> {
    await wait(400);
    this.state = buildState();
    this.save();
  }
}

export const demoRepository = new DemoRepository();
