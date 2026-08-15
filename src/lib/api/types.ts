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
import type { PlatformId, PurchaseCategory, RoastLevel } from "@/lib/constants";

export interface PurchaseInput {
  title: string;
  gameId?: string | null;
  platform: PlatformId;
  category: PurchaseCategory;
  amount: number;
  purchasedAt: string;
  tags?: string[];
  notes?: string | null;
}

export interface ConnectResult {
  platform: ConnectedPlatform;
  synced: number;
  discovered: number;
}

export interface SunkRepository {
  mode: "supabase" | "demo";

  getProfile(): Promise<Profile>;
  updateProfile(patch: Partial<Pick<Profile, "displayName" | "username" | "bio" | "avatarUrl" | "onboarded" | "country" | "timezone">>): Promise<Profile>;

  getStats(): Promise<Stats>;

  getPlatforms(): Promise<ConnectedPlatform[]>;
  connectPlatform(platform: PlatformId): Promise<ConnectResult>;
  disconnectPlatform(id: string): Promise<void>;

  getGames(): Promise<Game[]>;

  getPurchases(): Promise<Purchase[]>;
  addPurchase(input: PurchaseInput): Promise<Purchase>;
  updatePurchase(id: string, patch: Partial<PurchaseInput>): Promise<Purchase>;
  deletePurchase(id: string): Promise<void>;

  getSubscriptions(): Promise<Subscription[]>;
  updateSubscription(id: string, patch: Partial<Subscription>): Promise<Subscription>;

  getBudget(): Promise<Budget>;
  updateBudgetLimit(limit: number): Promise<Budget>;

  getGoals(): Promise<Goal[]>;
  addGoal(input: Omit<Goal, "id" | "status" | "streak">): Promise<Goal>;

  getInsights(): Promise<Insight[]>;

  getAchievements(): Promise<Achievement[]>;
  getBadges(): Promise<Badge[]>;
  getXpEvents(): Promise<XpEvent[]>;

  getNotifications(): Promise<Notification[]>;
  markNotificationsRead(ids?: string[]): Promise<void>;

  getFriends(): Promise<Friend[]>;
  getGroups(): Promise<Group[]>;
  getLeaderboard(): Promise<LeaderboardEntry[]>;

  getWishlist(): Promise<WishlistItem[]>;
  addWishlistItem(title: string): Promise<WishlistItem>;
  removeWishlistItem(id: string): Promise<void>;

  getWrapped(): Promise<WrappedData>;
  getRoast(level: RoastLevel): Promise<RoastData>;
  askSunk(query: string): Promise<AskSunkReply>;

  search(query: string): Promise<SearchResult[]>;

  getBilling(): Promise<BillingCustomer>;
  getPayments(): Promise<Payment[]>;
  upgradeToPremium(): Promise<BillingCustomer>;

  resetDemoData(): Promise<void>;
}
