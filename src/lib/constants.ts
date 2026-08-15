export const BRAND = {
  name: "Sunk",
  tagline: "Know Your Number.",
  description: "The home for your gaming spending.",
  url: "https://sunk.app",
};

export const PLATFORMS = [
  "steam",
  "roblox",
  "xbox",
  "playstation",
  "epic",
  "nintendo",
  "battlenet",
  "gog",
] as const;

export type PlatformId = (typeof PLATFORMS)[number];

export const PLATFORM_META: Record<
  PlatformId,
  { label: string; accent: string; gradient: string }
> = {
  steam: {
    label: "Steam",
    accent: "#66c0f4",
    gradient: "linear-gradient(135deg, #1b2838 0%, #2a475e 100%)",
  },
  roblox: {
    label: "Roblox",
    accent: "#e2231a",
    gradient: "linear-gradient(135deg, #111111 0%, #333333 100%)",
  },
  xbox: {
    label: "Xbox",
    accent: "#9bf00b",
    gradient: "linear-gradient(135deg, #107c10 0%, #0e5a0e 100%)",
  },
  playstation: {
    label: "PlayStation",
    accent: "#0070d1",
    gradient: "linear-gradient(135deg, #003087 0%, #0049b0 100%)",
  },
  epic: {
    label: "Epic Games",
    accent: "#a0a0a0",
    gradient: "linear-gradient(135deg, #121212 0%, #2b2b2b 100%)",
  },
  nintendo: {
    label: "Nintendo",
    accent: "#ff5c5c",
    gradient: "linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)",
  },
  battlenet: {
    label: "Battle.net",
    accent: "#00aeff",
    gradient: "linear-gradient(135deg, #003366 0%, #0055aa 100%)",
  },
  gog: {
    label: "GOG",
    accent: "#ffd63e",
    gradient: "linear-gradient(135deg, #262626 0%, #3d3d3d 100%)",
  },
};

export const PURCHASE_CATEGORIES = [
  "games",
  "dlc",
  "subscription",
  "battle_pass",
  "cosmetic",
  "currency",
  "loot_box",
  "microtransaction",
  "hardware",
  "other",
] as const;

export type PurchaseCategory = (typeof PURCHASE_CATEGORIES)[number];

export const CATEGORY_META: Record<PurchaseCategory, { label: string }> = {
  games: { label: "Games" },
  dlc: { label: "DLC" },
  subscription: { label: "Subscriptions" },
  battle_pass: { label: "Battle Passes" },
  cosmetic: { label: "Cosmetics" },
  currency: { label: "Currencies" },
  loot_box: { label: "Loot Boxes" },
  microtransaction: { label: "Microtransactions" },
  hardware: { label: "Hardware" },
  other: { label: "Other" },
};

export const ROAST_LEVELS = ["off", "mild", "medium", "extra_crispy"] as const;
export type RoastLevel = (typeof ROAST_LEVELS)[number];

export const ROAST_META: Record<RoastLevel, { label: string }> = {
  off: { label: "Off" },
  mild: { label: "Mild" },
  medium: { label: "Medium" },
  extra_crispy: { label: "Extra Crispy" },
};

export const APP_NAV = [
  { label: "Dashboard", href: "/", icon: "layout-dashboard" },
  { label: "Vault", href: "/vault", icon: "archive" },
  { label: "Subscriptions", href: "/subscriptions", icon: "refresh-cw" },
  { label: "Library", href: "/library", icon: "gamepad-2" },
  { label: "Goals", href: "/goals", icon: "target" },
  { label: "Budget", href: "/budget", icon: "wallet" },
  { label: "Insights", href: "/insights", icon: "sparkles" },
  { label: "Achievements", href: "/achievements", icon: "trophy" },
  { label: "Wishlist", href: "/wishlist", icon: "heart" },
  { label: "Friends", href: "/friends", icon: "users" },
  { label: "Leaderboards", href: "/leaderboards", icon: "bar-chart-3" },
  { label: "Wrapped", href: "/wrapped", icon: "gift" },
] as const;

export const MIN_PASSWORD_LENGTH = 8;
