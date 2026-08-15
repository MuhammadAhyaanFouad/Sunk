import type { PlatformId, PurchaseCategory, RoastLevel } from "@/lib/constants";

export type { PlatformId, PurchaseCategory, RoastLevel };

export interface Profile {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
  onboarded: boolean;
  level: number;
  xp: number;
  xpToNextLevel: number;
  plan: "free" | "premium";
  country: string | null;
  timezone: string | null;
  referralCode: string | null;
}

export interface ConnectedPlatform {
  id: string;
  platform: PlatformId;
  platformUserId: string | null;
  displayName: string | null;
  connectedAt: string;
  lastSyncedAt: string | null;
  totalSpend: number;
  totalGames: number;
  status: "connected" | "expired" | "error";
}

export interface Game {
  id: string;
  title: string;
  slug: string;
  coverUrl: string | null;
  developer: string | null;
  publisher: string | null;
  genre: string[] | null;
  releaseDate: string | null;
  playtimeHours: number;
  lastPlayedAt: string | null;
  totalSpend: number;
  owned: boolean;
  platforms: PlatformId[];
  rating: number | null;
}

export interface Purchase {
  id: string;
  gameId: string | null;
  gameTitle: string | null;
  coverUrl: string | null;
  platform: PlatformId;
  category: PurchaseCategory;
  title: string;
  amount: number;
  currency: string;
  purchasedAt: string;
  quantity: number;
  status: "complete" | "refunded" | "pending";
  tags: string[];
  notes: string | null;
}

export interface Subscription {
  id: string;
  name: string;
  platform: PlatformId | null;
  price: number;
  currency: string;
  interval: "monthly" | "yearly";
  nextRenewal: string;
  status: "active" | "cancelled" | "paused" | "trial";
  startedAt: string;
  autoRenew: boolean;
  logoUrl: string | null;
  category: string | null;
  lastRenewedAt: string | null;
}

export interface Budget {
  id: string;
  monthlyLimit: number;
  currentSpend: number;
  startDate: string;
  resetDay: number;
  streak: number;
  bestStreak: number;
  personalBestMonth: string | null;
  personalBestSpend: number;
  history: BudgetHistoryEntry[];
}

export interface BudgetHistoryEntry {
  month: string;
  spent: number;
  limit: number;
}

export interface Goal {
  id: string;
  title: string;
  type: "reduce_spend" | "save_up" | "hours_played" | "no_spend" | "custom";
  target: number;
  current: number;
  unit: "money" | "days" | "hours";
  startDate: string;
  endDate: string | null;
  status: "active" | "completed" | "failed" | "archived";
  streak: number;
}

export interface Insight {
  id: string;
  kind:
    | "spend_trend"
    | "renewal_soon"
    | "cost_per_hour"
    | "platform_trend"
    | "unused_subscription"
    | "healthy_streak"
    | "spend_down"
    | "spend_up"
    | "new_best"
    | "library_growth";
  title: string;
  body: string;
  tone: "positive" | "neutral" | "info";
  createdAt: string;
  meta?: Record<string, unknown>;
}

export interface Achievement {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  progress: number;
  target: number;
  unlocked: boolean;
  unlockedAt: string | null;
  xpReward: number;
}

export interface Badge {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  tier: string;
  earnedAt: string | null;
}

export interface Notification {
  id: string;
  kind: "renewal" | "achievement" | "friend" | "insight" | "goal" | "system";
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  actionHref: string | null;
}

export interface Friend {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  status: "online" | "offline" | "idle";
  level: number;
  xp: number;
  lifetimeSpend: number;
  monthlySpend: number;
  lastActiveAt: string | null;
  isFriend: boolean;
  pending: boolean;
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
  avatarUrl: string | null;
  monthlyChallenge: { title: string; spend: number; progress: number } | null;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  level: number;
  lifetimeSpend: number;
  monthlySpend: number;
  weeklyChange: number;
  isYou: boolean;
}

export interface WishlistItem {
  id: string;
  title: string;
  coverUrl: string | null;
  platform: PlatformId | null;
  price: number | null;
  priceHistory: { date: string; price: number }[];
  addedAt: string;
  notified: boolean;
}

export interface XpEvent {
  id: string;
  type: string;
  amount: number;
  createdAt: string;
  description: string;
}

export interface WrappedData {
  year: number;
  totalSpend: number;
  totalPurchases: number;
  topGame: { title: string; amount: number } | null;
  topGames: { title: string; amount: number; count: number }[];
  topPlatform: PlatformId | null;
  mostPlayed: { title: string; hours: number } | null;
  mostExpensive: { title: string; amount: number } | null;
  subscriptionsActive: number;
  hoursPlayed: number;
  purchasesByMonth: { month: string; amount: number; count: number }[];
  platformBreakdown: { platform: PlatformId; amount: number }[];
  peakMonth: string | null;
  spendingPersonality: string;
  personalityTitle: string;
  shareable: boolean;
}

export interface RoastData {
  level: RoastLevel;
  lines: string[];
}

export interface AskSunkReply {
  verdict: "yes" | "maybe" | "no";
  answer: string;
  hint: string;
}

export interface SearchResult {
  type: "purchase" | "game" | "subscription" | "achievement" | "friend" | "action";
  id: string;
  title: string;
  subtitle: string;
  amount?: number;
  href: string;
  coverUrl?: string | null;
}

export interface BillingCustomer {
  plan: "free" | "premium";
  payoneerSubscriptionId: string | null;
  status: "active" | "canceled" | "past_due" | "none";
  nextBillingAt: string | null;
  price: number | null;
  currency: string;
  joinedAt: string;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: "paid" | "failed" | "refunded";
  paidAt: string;
  description: string;
  method: string;
  last4: string | null;
}

export interface Stats {
  lifetimeSpend: number;
  monthlySpend: number;
  lastMonthSpend: number;
  totalPurchases: number;
  totalGames: number;
  totalHours: number;
  averagePerHour: number;
  activeSubscriptions: number;
  monthlyRecurring: number;
  spendTrend: number;
  budgetStreak: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
}
