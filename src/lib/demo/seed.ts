import type {
  Achievement,
  Badge,
  ConnectedPlatform,
  Friend,
  Game,
  Group,
  Insight,
  LeaderboardEntry,
  Notification,
  Profile,
  Purchase,
  Subscription,
  WishlistItem,
  XpEvent,
} from "@/types";
import type { PlatformId, PurchaseCategory } from "@/lib/constants";

const STEAM = (appId: number | string) =>
  `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`;

export const DEMO_COVERS: Record<string, string> = {
  "counter-strike-2": STEAM(730),
  "dota-2": STEAM(570),
  pubg: STEAM(578080),
  "grand-theft-auto-v": STEAM(271590),
  "cyberpunk-2077": STEAM(1091500),
  "elden-ring": STEAM(1245620),
  "baldurs-gate-3": STEAM(1086940),
  "stardew-valley": STEAM(413150),
  terraria: STEAM(105600),
  "hollow-knight": STEAM(367520),
  hades: STEAM(1145360),
  celeste: STEAM(504230),
  "the-witcher-3": STEAM(292030),
  "rocket-league": STEAM(252950),
  "dead-cells": STEAM(588650),
  "vampire-survivors": STEAM(1794680),
  phasmophobia: STEAM(739630),
  "among-us": STEAM(945360),
  "persona-5-royal": STEAM(1687950),
  "red-dead-redemption-2": STEAM(1174180),
  sekiro: STEAM(814380),
  "god-of-war": STEAM(1593500),
  "doom-eternal": STEAM(782330),
  "risk-of-rain-2": STEAM(632360),
  "deep-rock-galactic": STEAM(548430),
  factorio: STEAM(427520),
  satisfactory: STEAM(526870),
  "cities-skylines": STEAM(255710),
  subnautica: STEAM(264710),
  "outer-wilds": STEAM(753640),
  "disco-elysium": STEAM(632470),
  "halo-infinite": STEAM(1240440),
  "forza-horizon-5": STEAM(1551360),
  "it-takes-two": STEAM(1426210),
  cuphead: STEAM(268910),
  "portal-2": STEAM(620),
  "left-4-dead-2": STEAM(550),
  "skyrim-special-edition": STEAM(489830),
  "fallout-4": STEAM(377160),
  "euro-truck-simulator-2": STEAM(227300),
};

export function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function daysAgo(days: number, now = new Date()) {
  return new Date(now.getTime() - days * 86400000);
}

/* ------------------------------------------------------------------ */
/* Profile                                                             */
/* ------------------------------------------------------------------ */

export const DEMO_PROFILE: Profile = {
  id: "u_demo",
  username: "nova",
  displayName: "Nova",
  email: "nova@sunk.app",
  avatarUrl: null,
  bio: "RPG loyalist. Steam sale victim. Currently recovering in the Lands Between.",
  createdAt: daysAgo(430).toISOString(),
  onboarded: true,
  level: 27,
  xp: 18400,
  xpToNextLevel: 2450,
  plan: "premium",
  country: "US",
  timezone: "America/New_York",
  referralCode: "NOVA-27X",
};

/* ------------------------------------------------------------------ */
/* Platforms                                                           */
/* ------------------------------------------------------------------ */

export const DEMO_PLATFORMS: ConnectedPlatform[] = [
  { id: "p_steam", platform: "steam", platformUserId: "76561198243810120", displayName: "nova", connectedAt: daysAgo(430).toISOString(), lastSyncedAt: daysAgo(1).toISOString(), totalSpend: 2834.63, totalGames: 156, status: "connected" },
  { id: "p_roblox", platform: "roblox", platformUserId: "2847192001", displayName: "nova_moves", connectedAt: daysAgo(290).toISOString(), lastSyncedAt: daysAgo(2).toISOString(), totalSpend: 612.4, totalGames: 47, status: "connected" },
  { id: "p_xbox", platform: "xbox", platformUserId: null, displayName: "nova", connectedAt: daysAgo(310).toISOString(), lastSyncedAt: daysAgo(9).toISOString(), totalSpend: 1248.9, totalGames: 89, status: "connected" },
  { id: "p_playstation", platform: "playstation", platformUserId: null, displayName: "nova_psn", connectedAt: daysAgo(120).toISOString(), lastSyncedAt: null, totalSpend: 308.2, totalGames: 22, status: "error" },
  { id: "p_epic", platform: "epic", platformUserId: null, displayName: "nova", connectedAt: daysAgo(180).toISOString(), lastSyncedAt: daysAgo(14).toISOString(), totalSpend: 96.8, totalGames: 64, status: "connected" },
];

/* ------------------------------------------------------------------ */
/* Games                                                               */
/* ------------------------------------------------------------------ */

export const DEMO_GAMES: Game[] = [
  { id: "g_elden", title: "Elden Ring", slug: "elden-ring", coverUrl: DEMO_COVERS["elden-ring"], developer: "FromSoftware", publisher: "Bandai Namco", genre: ["RPG", "Action"], releaseDate: "2022-02-25", playtimeHours: 184, lastPlayedAt: daysAgo(5).toISOString(), totalSpend: 139.97, owned: true, platforms: ["steam"], rating: 96 },
  { id: "g_bg3", title: "Baldur's Gate 3", slug: "baldurs-gate-3", coverUrl: DEMO_COVERS["baldurs-gate-3"], developer: "Larian Studios", publisher: "Larian Studios", genre: ["RPG"], releaseDate: "2023-08-03", playtimeHours: 142, lastPlayedAt: daysAgo(12).toISOString(), totalSpend: 79.99, owned: true, platforms: ["steam"], rating: 97 },
  { id: "g_cs2", title: "Counter-Strike 2", slug: "counter-strike-2", coverUrl: DEMO_COVERS["counter-strike-2"], developer: "Valve", publisher: "Valve", genre: ["FPS"], releaseDate: "2012-08-21", playtimeHours: 312, lastPlayedAt: daysAgo(2).toISOString(), totalSpend: 264.15, owned: true, platforms: ["steam"], rating: 88 },
  { id: "g_cyberpunk", title: "Cyberpunk 2077", slug: "cyberpunk-2077", coverUrl: DEMO_COVERS["cyberpunk-2077"], developer: "CD Projekt Red", publisher: "CD Projekt", genre: ["RPG", "Open World"], releaseDate: "2020-12-10", playtimeHours: 96, lastPlayedAt: daysAgo(21).toISOString(), totalSpend: 89.97, owned: true, platforms: ["steam"], rating: 90 },
  { id: "g_hades", title: "Hades", slug: "hades", coverUrl: DEMO_COVERS["hades"], developer: "Supergiant Games", publisher: "Supergiant Games", genre: ["Roguelike", "Action"], releaseDate: "2020-09-17", playtimeHours: 78, lastPlayedAt: daysAgo(44).toISOString(), totalSpend: 25.99, owned: true, platforms: ["steam"], rating: 93 },
  { id: "g_hollow", title: "Hollow Knight", slug: "hollow-knight", coverUrl: DEMO_COVERS["hollow-knight"], developer: "Team Cherry", publisher: "Team Cherry", genre: ["Metroidvania"], releaseDate: "2017-02-24", playtimeHours: 54, lastPlayedAt: daysAgo(120).toISOString(), totalSpend: 15, owned: true, platforms: ["steam"], rating: 95 },
  { id: "g_stardew", title: "Stardew Valley", slug: "stardew-valley", coverUrl: DEMO_COVERS["stardew-valley"], developer: "ConcernedApe", publisher: "ConcernedApe", genre: ["Simulation", "RPG"], releaseDate: "2016-02-26", playtimeHours: 131, lastPlayedAt: daysAgo(17).toISOString(), totalSpend: 15, owned: true, platforms: ["steam"], rating: 96 },
  { id: "g_terraria", title: "Terraria", slug: "terraria", coverUrl: DEMO_COVERS["terraria"], developer: "Re-Logic", publisher: "Re-Logic", genre: ["Sandbox", "Adventure"], releaseDate: "2011-05-16", playtimeHours: 88, lastPlayedAt: daysAgo(200).toISOString(), totalSpend: 10, owned: true, platforms: ["steam"], rating: 94 },
  { id: "g_rdr2", title: "Red Dead Redemption 2", slug: "red-dead-redemption-2", coverUrl: DEMO_COVERS["red-dead-redemption-2"], developer: "Rockstar Games", publisher: "Rockstar Games", genre: ["Action", "Open World"], releaseDate: "2019-12-05", playtimeHours: 74, lastPlayedAt: daysAgo(190).toISOString(), totalSpend: 59.99, owned: true, platforms: ["steam"], rating: 95 },
  { id: "g_sekiro", title: "Sekiro: Shadows Die Twice", slug: "sekiro", coverUrl: DEMO_COVERS.sekiro, developer: "FromSoftware", publisher: "Activision", genre: ["Action", "Soulslike"], releaseDate: "2019-03-22", playtimeHours: 62, lastPlayedAt: daysAgo(280).toISOString(), totalSpend: 59.99, owned: true, platforms: ["steam"], rating: 94 },
  { id: "g_witcher", title: "The Witcher 3: Wild Hunt", slug: "the-witcher-3", coverUrl: DEMO_COVERS["the-witcher-3"], developer: "CD Projekt Red", publisher: "CD Projekt", genre: ["RPG"], releaseDate: "2015-05-19", playtimeHours: 149, lastPlayedAt: daysAgo(90).toISOString(), totalSpend: 49.98, owned: true, platforms: ["steam"], rating: 96 },
  { id: "g_vampire", title: "Vampire Survivors", slug: "vampire-survivors", coverUrl: DEMO_COVERS["vampire-survivors"], developer: "poncle", publisher: "poncle", genre: ["Roguelike", "Survival"], releaseDate: "2022-10-20", playtimeHours: 46, lastPlayedAt: daysAgo(3).toISOString(), totalSpend: 5, owned: true, platforms: ["steam"], rating: 89 },
  { id: "g_fortnite", title: "Fortnite", slug: "fortnite", coverUrl: null, developer: "Epic Games", publisher: "Epic Games", genre: ["Battle Royale"], releaseDate: "2017-09-26", playtimeHours: 120, lastPlayedAt: daysAgo(1).toISOString(), totalSpend: 342.8, owned: true, platforms: ["epic"], rating: 85 },
  { id: "g_valorant", title: "Valorant", slug: "valorant", coverUrl: null, developer: "Riot Games", publisher: "Riot Games", genre: ["FPS", "Tactical"], releaseDate: "2020-06-02", playtimeHours: 166, lastPlayedAt: daysAgo(1).toISOString(), totalSpend: 148.5, owned: true, platforms: ["epic"], rating: 90 },
  { id: "g_roblox", title: "Roblox", slug: "roblox", coverUrl: null, developer: "Roblox Corporation", publisher: "Roblox Corporation", genre: ["Sandbox", "MMO"], releaseDate: "2006-09-01", playtimeHours: 210, lastPlayedAt: daysAgo(2).toISOString(), totalSpend: 612.4, owned: true, platforms: ["roblox"], rating: 84 },
  { id: "g_gta", title: "Grand Theft Auto V", slug: "grand-theft-auto-v", coverUrl: DEMO_COVERS["grand-theft-auto-v"], developer: "Rockstar North", publisher: "Rockstar Games", genre: ["Action", "Open World"], releaseDate: "2015-04-14", playtimeHours: 102, lastPlayedAt: daysAgo(60).toISOString(), totalSpend: 29.99, owned: true, platforms: ["steam"], rating: 93 },
  { id: "g_rocket", title: "Rocket League", slug: "rocket-league", coverUrl: DEMO_COVERS["rocket-league"], developer: "Psyonix", publisher: "Psyonix", genre: ["Sports", "Vehicular"], releaseDate: "2015-07-07", playtimeHours: 95, lastPlayedAt: daysAgo(15).toISOString(), totalSpend: 41.98, owned: true, platforms: ["steam", "xbox"], rating: 88 },
  { id: "g_halo", title: "Halo Infinite", slug: "halo-infinite", coverUrl: DEMO_COVERS["halo-infinite"], developer: "343 Industries", publisher: "Xbox Game Studios", genre: ["FPS"], releaseDate: "2021-12-08", playtimeHours: 58, lastPlayedAt: daysAgo(38).toISOString(), totalSpend: 59.99, owned: true, platforms: ["xbox"], rating: 86 },
  { id: "g_forza", title: "Forza Horizon 5", slug: "forza-horizon-5", coverUrl: DEMO_COVERS["forza-horizon-5"], developer: "Playground Games", publisher: "Xbox Game Studios", genre: ["Racing"], releaseDate: "2021-11-09", playtimeHours: 47, lastPlayedAt: daysAgo(25).toISOString(), totalSpend: 69.98, owned: true, platforms: ["xbox"], rating: 91 },
  { id: "g_doom", title: "DOOM Eternal", slug: "doom-eternal", coverUrl: DEMO_COVERS["doom-eternal"], developer: "id Software", publisher: "Bethesda", genre: ["FPS"], releaseDate: "2020-03-20", playtimeHours: 41, lastPlayedAt: daysAgo(150).toISOString(), totalSpend: 39.99, owned: true, platforms: ["steam", "xbox"], rating: 91 },
  { id: "g_persona", title: "Persona 5 Royal", slug: "persona-5-royal", coverUrl: DEMO_COVERS["persona-5-royal"], developer: "Atlus", publisher: "SEGA", genre: ["RPG", "JRPG"], releaseDate: "2022-10-21", playtimeHours: 89, lastPlayedAt: daysAgo(75).toISOString(), totalSpend: 59.99, owned: true, platforms: ["steam"], rating: 93 },
  { id: "g_ow2", title: "Overwatch 2", slug: "overwatch-2", coverUrl: null, developer: "Blizzard Entertainment", publisher: "Blizzard", genre: ["FPS", "Hero Shooter"], releaseDate: "2022-10-04", playtimeHours: 140, lastPlayedAt: daysAgo(6).toISOString(), totalSpend: 121.6, owned: true, platforms: ["battlenet"], rating: 82 },
  { id: "g_fgo", title: "Fate/Grand Order", slug: "fate-grand-order", coverUrl: null, developer: "TYPE-MOON", publisher: "Aniplex", genre: ["Gacha", "RPG"], releaseDate: "2019-06-25", playtimeHours: 96, lastPlayedAt: daysAgo(4).toISOString(), totalSpend: 188.4, owned: true, platforms: ["roblox"], rating: 85 },
  { id: "g_celeste", title: "Celeste", slug: "celeste", coverUrl: DEMO_COVERS.celeste, developer: "Maddy Makes Games", publisher: "Exok Games", genre: ["Platformer"], releaseDate: "2018-01-25", playtimeHours: 34, lastPlayedAt: daysAgo(230).toISOString(), totalSpend: 20, owned: true, platforms: ["steam"], rating: 93 },
  { id: "g_satisfactory", title: "Satisfactory", slug: "satisfactory", coverUrl: DEMO_COVERS.satisfactory, developer: "Coffee Stain Studios", publisher: "Coffee Stain Publishing", genre: ["Sandbox", "Simulation"], releaseDate: "2024-09-10", playtimeHours: 52, lastPlayedAt: daysAgo(10).toISOString(), totalSpend: 34.99, owned: true, platforms: ["steam"], rating: 91 },
  { id: "g_deeprock", title: "Deep Rock Galactic", slug: "deep-rock-galactic", coverUrl: DEMO_COVERS["deep-rock-galactic"], developer: "Ghost Ship Games", publisher: "Coffee Stain", genre: ["Co-op", "FPS"], releaseDate: "2020-05-13", playtimeHours: 67, lastPlayedAt: daysAgo(55).toISOString(), totalSpend: 29.98, owned: true, platforms: ["steam", "xbox"], rating: 92 },
  { id: "g_persona3", title: "Persona 3 Reload", slug: "persona-3-reload", coverUrl: null, developer: "Atlus", publisher: "SEGA", genre: ["RPG", "JRPG"], releaseDate: "2024-02-02", playtimeHours: 71, lastPlayedAt: daysAgo(30).toISOString(), totalSpend: 69.99, owned: true, platforms: ["xbox"], rating: 90 },
  { id: "g_gow", title: "God of War", slug: "god-of-war", coverUrl: DEMO_COVERS["god-of-war"], developer: "Santa Monica Studio", publisher: "Sony", genre: ["Action", "Adventure"], releaseDate: "2022-01-14", playtimeHours: 38, lastPlayedAt: daysAgo(260).toISOString(), totalSpend: 49.99, owned: true, platforms: ["playstation", "steam"], rating: 94 },
  { id: "g_factoria", title: "Factorio", slug: "factorio", coverUrl: DEMO_COVERS.factorio, developer: "Wube Software", publisher: "Wube Software", genre: ["Simulation", "Automation"], releaseDate: "2020-08-14", playtimeHours: 118, lastPlayedAt: daysAgo(48).toISOString(), totalSpend: 30, owned: true, platforms: ["steam"], rating: 95 },
  { id: "g_disco", title: "Disco Elysium", slug: "disco-elysium", coverUrl: DEMO_COVERS["disco-elysium"], developer: "ZA/UM", publisher: "ZA/UM", genre: ["RPG", "Adventure"], releaseDate: "2019-10-15", playtimeHours: 44, lastPlayedAt: daysAgo(300).toISOString(), totalSpend: 19.99, owned: true, platforms: ["steam"], rating: 94 },
];

/* ------------------------------------------------------------------ */
/* Subscriptions                                                       */
/* ------------------------------------------------------------------ */

export const DEMO_SUBSCRIPTIONS: Subscription[] = [
  { id: "s_gpu", name: "Xbox Game Pass Ultimate", platform: "xbox", price: 16.99, currency: "USD", interval: "monthly", nextRenewal: daysAgo(-2).toISOString(), status: "active", startedAt: daysAgo(310).toISOString(), autoRenew: true, logoUrl: null, category: "subscription", lastRenewedAt: daysAgo(2).toISOString() },
  { id: "s_psplus", name: "PlayStation Plus Premium", platform: "playstation", price: 17.99, currency: "USD", interval: "monthly", nextRenewal: daysAgo(-12).toISOString(), status: "active", startedAt: daysAgo(120).toISOString(), autoRenew: true, logoUrl: null, category: "subscription", lastRenewedAt: daysAgo(12).toISOString() },
  { id: "s_nitro", name: "Discord Nitro", platform: null, price: 9.99, currency: "USD", interval: "monthly", nextRenewal: daysAgo(-6).toISOString(), status: "active", startedAt: daysAgo(400).toISOString(), autoRenew: true, logoUrl: null, category: "subscription", lastRenewedAt: daysAgo(6).toISOString() },
  { id: "s_crew", name: "Fortnite Crew", platform: "epic", price: 11.99, currency: "USD", interval: "monthly", nextRenewal: daysAgo(-1).toISOString(), status: "active", startedAt: daysAgo(180).toISOString(), autoRenew: true, logoUrl: null, category: "battle_pass", lastRenewedAt: daysAgo(1).toISOString() },
  { id: "s_eaplay", name: "EA Play", platform: "xbox", price: 4.99, currency: "USD", interval: "monthly", nextRenewal: daysAgo(-9).toISOString(), status: "active", startedAt: daysAgo(95).toISOString(), autoRenew: false, logoUrl: null, category: "subscription", lastRenewedAt: daysAgo(9).toISOString() },
  { id: "s_robloxprem", name: "Roblox Premium 450", platform: "roblox", price: 4.99, currency: "USD", interval: "monthly", nextRenewal: daysAgo(-5).toISOString(), status: "active", startedAt: daysAgo(180).toISOString(), autoRenew: true, logoUrl: null, category: "currency", lastRenewedAt: daysAgo(5).toISOString() },
];

/* ------------------------------------------------------------------ */
/* Purchases                                                           */
/* ------------------------------------------------------------------ */

interface PurchaseTemplate {
  title: string;
  gameSlug?: string;
  platform: PlatformId;
  category: PurchaseCategory;
  price: number;
  tags: string[];
}

const fullGameTemplates: PurchaseTemplate[] = [
  { title: "Elden Ring", gameSlug: "elden-ring", platform: "steam", category: "games", price: 59.99, tags: ["full game"] },
  { title: "Elden Ring: Shadow of the Erdtree", gameSlug: "elden-ring", platform: "steam", category: "dlc", price: 39.99, tags: ["expansion"] },
  { title: "Baldur's Gate 3", gameSlug: "baldurs-gate-3", platform: "steam", category: "games", price: 59.99, tags: ["full game"] },
  { title: "Cyberpunk 2077", gameSlug: "cyberpunk-2077", platform: "steam", category: "games", price: 59.99, tags: ["full game"] },
  { title: "Cyberpunk 2077: Phantom Liberty", gameSlug: "cyberpunk-2077", platform: "steam", category: "dlc", price: 29.99, tags: ["expansion"] },
  { title: "Hades", gameSlug: "hades", platform: "steam", category: "games", price: 24.99, tags: ["full game"] },
  { title: "Hollow Knight", gameSlug: "hollow-knight", platform: "steam", category: "games", price: 14.99, tags: ["full game"] },
  { title: "Stardew Valley", gameSlug: "stardew-valley", platform: "steam", category: "games", price: 14.99, tags: ["full game"] },
  { title: "Terraria", gameSlug: "terraria", platform: "steam", category: "games", price: 9.99, tags: ["full game"] },
  { title: "Red Dead Redemption 2", gameSlug: "red-dead-redemption-2", platform: "steam", category: "games", price: 59.99, tags: ["full game"] },
  { title: "Sekiro: Shadows Die Twice", gameSlug: "sekiro", platform: "steam", category: "games", price: 59.99, tags: ["full game"] },
  { title: "The Witcher 3: Wild Hunt", gameSlug: "the-witcher-3", platform: "steam", category: "games", price: 29.99, tags: ["full game"] },
  { title: "The Witcher 3: Hearts of Stone", gameSlug: "the-witcher-3", platform: "steam", category: "dlc", price: 9.99, tags: ["expansion"] },
  { title: "The Witcher 3: Blood and Wine", gameSlug: "the-witcher-3", platform: "steam", category: "dlc", price: 9.99, tags: ["expansion"] },
  { title: "Vampire Survivors", gameSlug: "vampire-survivors", platform: "steam", category: "games", price: 4.99, tags: ["full game"] },
  { title: "Grand Theft Auto V", gameSlug: "grand-theft-auto-v", platform: "steam", category: "games", price: 29.99, tags: ["full game"] },
  { title: "Halo Infinite", gameSlug: "halo-infinite", platform: "xbox", category: "games", price: 59.99, tags: ["full game"] },
  { title: "Forza Horizon 5", gameSlug: "forza-horizon-5", platform: "xbox", category: "games", price: 59.99, tags: ["full game"] },
  { title: "Forza Horizon 5: Hot Wheels", gameSlug: "forza-horizon-5", platform: "xbox", category: "dlc", price: 9.99, tags: ["expansion"] },
  { title: "DOOM Eternal", gameSlug: "doom-eternal", platform: "steam", category: "games", price: 39.99, tags: ["full game"] },
  { title: "Persona 5 Royal", gameSlug: "persona-5-royal", platform: "steam", category: "games", price: 59.99, tags: ["full game"] },
  { title: "God of War", gameSlug: "god-of-war", platform: "playstation", category: "games", price: 49.99, tags: ["full game"] },
  { title: "Factorio", gameSlug: "factoria", platform: "steam", category: "games", price: 30, tags: ["full game"] },
  { title: "Disco Elysium", gameSlug: "disco-elysium", platform: "steam", category: "games", price: 19.99, tags: ["full game"] },
  { title: "Deep Rock Galactic", gameSlug: "deeprock", platform: "steam", category: "games", price: 29.99, tags: ["full game"] },
  { title: "Satisfactory", gameSlug: "satisfactory", platform: "steam", category: "games", price: 34.99, tags: ["full game"] },
  { title: "Persona 3 Reload", gameSlug: "persona3", platform: "xbox", category: "games", price: 69.99, tags: ["full game"] },
  { title: "Celeste", gameSlug: "celeste", platform: "steam", category: "games", price: 19.99, tags: ["full game"] },
];

const microTemplates: PurchaseTemplate[] = [
  { title: "Steam Summer Sale — Game Pack", platform: "steam", category: "games", price: 49.99, tags: ["sale"] },
  { title: "2000 Robux", gameSlug: "roblox", platform: "roblox", category: "currency", price: 24.99, tags: ["robux"] },
  { title: "1000 Robux", gameSlug: "roblox", platform: "roblox", category: "currency", price: 12.49, tags: ["robux"] },
  { title: "450 Robux", gameSlug: "roblox", platform: "roblox", category: "currency", price: 4.99, tags: ["robux"] },
  { title: "Fortnite Battle Pass — Chapter 4 S1", gameSlug: "fortnite", platform: "epic", category: "battle_pass", price: 9.5, tags: ["battle pass"] },
  { title: "Fortnite Battle Pass — Chapter 4 S2", gameSlug: "fortnite", platform: "epic", category: "battle_pass", price: 9.5, tags: ["battle pass"] },
  { title: "Fortnite Battle Pass — Chapter 4 S4", gameSlug: "fortnite", platform: "epic", category: "battle_pass", price: 9.5, tags: ["battle pass"] },
  { title: "Fortnite Battle Pass — Chapter 5 S1", gameSlug: "fortnite", platform: "epic", category: "battle_pass", price: 9.5, tags: ["battle pass"] },
  { title: "Fortnite V-Bucks 2800", gameSlug: "fortnite", platform: "epic", category: "currency", price: 22.99, tags: ["vbucks"] },
  { title: "Fortnite V-Bucks 1000", gameSlug: "fortnite", platform: "epic", category: "currency", price: 7.99, tags: ["vbucks"] },
  { title: "VALORANT — VCT Champions Bundle", gameSlug: "valorant", platform: "epic", category: "cosmetic", price: 63.76, tags: ["skin bundle"] },
  { title: "VALORANT — 1000 VP", gameSlug: "valorant", platform: "epic", category: "currency", price: 9.99, tags: ["vp"] },
  { title: "VALORANT — Reaver Vandal", gameSlug: "valorant", platform: "epic", category: "cosmetic", price: 21.75, tags: ["skin"] },
  { title: "VALORANT — Prime Phantom", gameSlug: "valorant", platform: "epic", category: "cosmetic", price: 17.75, tags: ["skin"] },
  { title: "Overwatch 2 — Battle Pass", gameSlug: "ow2", platform: "battlenet", category: "battle_pass", price: 9.99, tags: ["battle pass"] },
  { title: "Overwatch 2 — 1000 Coins", gameSlug: "ow2", platform: "battlenet", category: "currency", price: 9.99, tags: ["coins"] },
  { title: "Overwatch 2 — Mythic Bundle", gameSlug: "ow2", platform: "battlenet", category: "cosmetic", price: 79.99, tags: ["mythic"] },
  { title: "Fate/Grand Order — Saint Quartz 86", gameSlug: "fgo", platform: "roblox", category: "loot_box", price: 79.99, tags: ["gacha"] },
  { title: "Fate/Grand Order — Saint Quartz 42", gameSlug: "fgo", platform: "roblox", category: "loot_box", price: 39.99, tags: ["gacha"] },
  { title: "Fate/Grand Order — Saint Quartz 12", gameSlug: "fgo", platform: "roblox", category: "loot_box", price: 15.99, tags: ["gacha"] },
  { title: "CS2 — Open Case", gameSlug: "cs2", platform: "steam", category: "loot_box", price: 2.5, tags: ["case"] },
  { title: "CS2 — Case Bundle", gameSlug: "cs2", platform: "steam", category: "loot_box", price: 14.99, tags: ["cases"] },
  { title: "CS2 — AK-47 skin", gameSlug: "cs2", platform: "steam", category: "cosmetic", price: 12.4, tags: ["skin", "marketplace"] },
  { title: "Rocket League — Credits 1100", gameSlug: "rocket", platform: "steam", category: "currency", price: 9.99, tags: ["credits"] },
  { title: "Rocket League — Rocket Pass", gameSlug: "rocket", platform: "steam", category: "battle_pass", price: 9.99, tags: ["rocket pass"] },
  { title: "Genshin Impact — 980 Genesis Crystals", platform: "roblox", category: "currency", price: 19.99, tags: ["gacha"] },
  { title: "Apex Legends — 1000 Apex Coins", platform: "epic", category: "currency", price: 9.99, tags: ["coins"] },
];

function generatePurchases(): Purchase[] {
  const rand = mulberry32(1337);
  const purchases: Purchase[] = [];
  let id = 0;
  const now = Date.now();
  const push = (
    title: string,
    gameSlug: string | undefined,
    platform: PlatformId,
    category: PurchaseCategory,
    amount: number,
    daysAgo: number,
    tags: string[],
    status: "complete" | "refunded" | "pending" = "complete",
  ) => {
    const game = gameSlug ? DEMO_GAMES.find((g) => g.slug === gameSlug) : undefined;
    purchases.push({
      id: `pc_${++id}`,
      gameId: game?.id ?? null,
      gameTitle: game?.title ?? null,
      coverUrl: game?.coverUrl ?? null,
      platform,
      category,
      title,
      amount: Math.round(amount * 100) / 100,
      currency: "USD",
      purchasedAt: new Date(now - daysAgo * 86400000).toISOString(),
      quantity: 1,
      status,
      tags,
      notes: null,
    });
  };

  // Full games spread across the last ~430 days
  for (const t of fullGameTemplates) {
    const days = 5 + Math.floor(rand() * 415);
    push(t.title, t.gameSlug, t.platform, t.category, t.price * (rand() < 0.4 ? 0.5 : 1), days, t.tags);
  }

  // Microtransactions, clustered on release cycles
  for (const t of microTemplates) {
    const dayOffset = Math.floor(rand() * 415) + 5;
    push(t.title, t.gameSlug, t.platform, t.category, t.price, dayOffset, t.tags);
  }

  // Special one-offs
  push("Steam Deck 512GB", undefined, "steam", "hardware", 549, 360, ["hardware"]);
  push("Xbox Elite Series 2 Controller", undefined, "xbox", "hardware", 179.99, 300, ["hardware"]);
  push("8BitDo Pro 2 Controller", undefined, "steam", "hardware", 49.99, 250, ["hardware"]);
  push("Monster Hunter: World — Iceborne", undefined, "steam", "dlc", 39.99, 320, ["expansion"]);
  push("Dark Souls III Deluxe", undefined, "steam", "games", 44.99, 330, ["sale"]);

  // Recent purchases still inside platform refund windows
  push("Elden Ring: Shadow of the Erdtree", "elden-ring", "steam", "dlc", 39.99, 13, ["expansion"]);
  push("Roblox Premium 450", "roblox", "roblox", "subscription", 4.99, 1.5, ["recurring"]);
  push("Adopt Me! Bucks Bundle", undefined, "roblox", "microtransaction", 19.99, 1, ["cosmetics"]);

  // A couple of refunds for realism
  purchases[3] = { ...purchases[3], status: "refunded" };
  purchases[Math.floor(purchases.length * 0.6)] = { ...purchases[Math.floor(purchases.length * 0.6)], status: "refunded" };

  // A few pending
  purchases[2] = { ...purchases[2], status: "pending" };

  return purchases.sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime());
}

export const DEMO_PURCHASES = generatePurchases();

/* ------------------------------------------------------------------ */
/* Budget                                                              */
/* ------------------------------------------------------------------ */

const MONTHLY_LIMIT = 300;

export const DEMO_BUDGET = {
  id: "b_main",
  monthlyLimit: MONTHLY_LIMIT,
  currentSpend: 268.42,
  startDate: daysAgo(430).toISOString(),
  resetDay: 1,
  streak: 6,
  bestStreak: 9,
  personalBestMonth: "2024-11",
  personalBestSpend: 198.55,
  history: [
    { month: "2024-03", spent: 384.12, limit: MONTHLY_LIMIT },
    { month: "2024-04", spent: 302.9, limit: MONTHLY_LIMIT },
    { month: "2024-05", spent: 446.2, limit: MONTHLY_LIMIT },
    { month: "2024-06", spent: 261.4, limit: MONTHLY_LIMIT },
    { month: "2024-07", spent: 312.75, limit: MONTHLY_LIMIT },
    { month: "2024-08", spent: 288.3, limit: MONTHLY_LIMIT },
    { month: "2024-09", spent: 354.1, limit: MONTHLY_LIMIT },
    { month: "2024-10", spent: 271.85, limit: MONTHLY_LIMIT },
    { month: "2024-11", spent: 198.55, limit: MONTHLY_LIMIT },
    { month: "2024-12", spent: 428.4, limit: MONTHLY_LIMIT },
    { month: "2025-01", spent: 236.7, limit: MONTHLY_LIMIT },
    { month: "2025-02", spent: 249.15, limit: MONTHLY_LIMIT },
    { month: "2025-03", spent: 268.42, limit: MONTHLY_LIMIT },
  ],
};

/* ------------------------------------------------------------------ */
/* Goals                                                               */
/* ------------------------------------------------------------------ */

export const DEMO_GOALS = [
  { id: "gl_1", title: "Stay under $250 this month", type: "reduce_spend", target: 250, current: 268.42, unit: "money", startDate: daysAgo(12).toISOString(), endDate: null, status: "active", streak: 6 },
  { id: "gl_2", title: "No-spend week streak", type: "no_spend", target: 4, current: 2, unit: "days", startDate: daysAgo(14).toISOString(), endDate: null, status: "active", streak: 2 },
  { id: "gl_3", title: "Save for Steam Deck", type: "save_up", target: 549, current: 240, unit: "money", startDate: daysAgo(60).toISOString(), endDate: null, status: "active", streak: 0 },
  { id: "gl_4", title: "Play 30 hours this month", type: "hours_played", target: 30, current: 21.5, unit: "hours", startDate: daysAgo(12).toISOString(), endDate: null, status: "active", streak: 0 },
  { id: "gl_5", title: "Beat 2024's spend", type: "custom", target: 428.4, current: 268.42, unit: "money", startDate: daysAgo(12).toISOString(), endDate: null, status: "active", streak: 0 },
] as const;

/* ------------------------------------------------------------------ */
/* Insights                                                            */
/* ------------------------------------------------------------------ */

export const DEMO_INSIGHTS: Insight[] = [
  { id: "in_1", kind: "spend_down", title: "12% lighter month", body: "You've spent 12% less than last month. Your wallet has a heartbeat.", tone: "positive", createdAt: daysAgo(1).toISOString() },
  { id: "in_2", kind: "renewal_soon", title: "Fortnite Crew renews tomorrow", body: "Your Fortnite Crew subscription renews tomorrow for $11.99.", tone: "info", createdAt: daysAgo(1).toISOString() },
  { id: "in_3", kind: "cost_per_hour", title: "$0.15 per hour in Elden Ring", body: "184 hours for $139.97. That's elite entertainment economics.", tone: "positive", createdAt: daysAgo(2).toISOString() },
  { id: "in_4", kind: "unused_subscription", title: "EA Play went quiet", body: "You haven't launched an EA title in 74 days, but EA Play is still charging you $4.99/mo.", tone: "neutral", createdAt: daysAgo(3).toISOString() },
  { id: "in_5", kind: "healthy_streak", title: "Six months under budget", body: "You've stayed under budget 6 months running. New personal best territory.", tone: "positive", createdAt: daysAgo(4).toISOString() },
  { id: "in_6", kind: "platform_trend", title: "Roblox is your biggest sink", body: "Roblox accounts for 27% of your lifetime spend. The algorithm thanks you.", tone: "neutral", createdAt: daysAgo(5).toISOString() },
  { id: "in_7", kind: "spend_up", title: "November was a binge", body: "You spent $428 in November 2024 — 43% above your average. Steam sale season strikes again.", tone: "info", createdAt: daysAgo(6).toISOString() },
  { id: "in_8", kind: "library_growth", title: "156 games, 23 owned", body: "You own 23 of the 156 games in your Steam library. The other 133 are... a journey.", tone: "neutral", createdAt: daysAgo(8).toISOString() },
];

/* ------------------------------------------------------------------ */
/* Achievements & badges                                               */
/* ------------------------------------------------------------------ */

export const DEMO_ACHIEVEMENTS: Achievement[] = [
  { id: "a_1", slug: "first-100", title: "Century Club", description: "Spend $100 on gaming", icon: "dollar-sign", rarity: "common", progress: 100, target: 100, unlocked: true, unlockedAt: daysAgo(410).toISOString(), xpReward: 100 },
  { id: "a_2", slug: "thousand", title: "Committed", description: "Spend $1,000 on gaming", icon: "trophy", rarity: "uncommon", progress: 100, target: 1000, unlocked: true, unlockedAt: daysAgo(300).toISOString(), xpReward: 250 },
  { id: "a_3", slug: "deep-dive", title: "Deep Dive", description: "Hit 2,500 in lifetime spend", icon: "waves", rarity: "uncommon", progress: 100, target: 2500, unlocked: true, unlockedAt: daysAgo(180).toISOString(), xpReward: 300 },
  { id: "a_4", slug: "whale", title: "Honorary Whale", description: "Reach $5,000 lifetime spend", icon: "fish", rarity: "rare", progress: 100, target: 5000, unlocked: true, unlockedAt: daysAgo(70).toISOString(), xpReward: 600 },
  { id: "a_5", slug: "budget-streak-3", title: "Consistency", description: "Stay under budget 3 months in a row", icon: "shield-check", rarity: "common", progress: 100, target: 3, unlocked: true, unlockedAt: daysAgo(240).toISOString(), xpReward: 150 },
  { id: "a_6", slug: "budget-streak-6", title: "Iron Discipline", description: "Stay under budget 6 months in a row", icon: "shield", rarity: "uncommon", progress: 100, target: 6, unlocked: true, unlockedAt: daysAgo(60).toISOString(), xpReward: 300 },
  { id: "a_7", slug: "library-100", title: "Collector", description: "Own 100 games across platforms", icon: "library", rarity: "uncommon", progress: 100, target: 100, unlocked: true, unlockedAt: daysAgo(150).toISOString(), xpReward: 250 },
  { id: "a_8", slug: "hours-500", title: "Time Investor", description: "Log 500 hours of playtime", icon: "clock", rarity: "common", progress: 100, target: 500, unlocked: true, unlockedAt: daysAgo(200).toISOString(), xpReward: 200 },
  { id: "a_9", slug: "hours-1000", title: "Power Gamer", description: "Log 1,000 hours of playtime", icon: "zap", rarity: "rare", progress: 100, target: 1000, unlocked: true, unlockedAt: daysAgo(80).toISOString(), xpReward: 500 },
  { id: "a_10", slug: "renewal-freeze", title: "Subscription Purge", description: "Cancel 3 unused subscriptions", icon: "scissors", rarity: "rare", progress: 100, target: 3, unlocked: true, unlockedAt: daysAgo(45).toISOString(), xpReward: 350 },
  { id: "a_11", slug: "wishlist-price", title: "Patience Pays", description: "Wait for a price drop before buying", icon: "tag", rarity: "common", progress: 100, target: 1, unlocked: true, unlockedAt: daysAgo(120).toISOString(), xpReward: 100 },
  { id: "a_12", slug: "steam-deck", title: "Hardware Enthusiast", description: "Log your first hardware purchase", icon: "gamepad", rarity: "uncommon", progress: 100, target: 1, unlocked: true, unlockedAt: daysAgo(360).toISOString(), xpReward: 250 },
  { id: "a_13", slug: "cost-per-hour", title: "Efficiency Expert", description: "Drop under $1 per hour on any game", icon: "percent", rarity: "common", progress: 100, target: 1, unlocked: true, unlockedAt: daysAgo(280).toISOString(), xpReward: 150 },
  { id: "a_14", slug: "no-spend-7", title: "Monk Mode", description: "No purchases for 7 straight days", icon: "leaf", rarity: "epic", progress: 7, target: 7, unlocked: true, unlockedAt: daysAgo(30).toISOString(), xpReward: 800 },
  { id: "a_15", slug: "no-spend-30", title: "Enlightened", description: "No purchases for 30 straight days", icon: "sun", rarity: "legendary", progress: 6, target: 30, unlocked: false, unlockedAt: null, xpReward: 2000 },
  { id: "a_16", slug: "five-thousand-hours", title: "Lifestyle Choice", description: "Log 5,000 lifetime hours", icon: "flame", rarity: "epic", progress: 2648, target: 5000, unlocked: false, unlockedAt: null, xpReward: 1500 },
  { id: "a_17", slug: "goal-3", title: "Goal Getter", description: "Complete 3 goals", icon: "target", rarity: "uncommon", progress: 2, target: 3, unlocked: false, unlockedAt: null, xpReward: 250 },
  { id: "a_18", slug: "friend-5", title: "Squad Up", description: "Add 5 friends", icon: "users", rarity: "common", progress: 4, target: 5, unlocked: false, unlockedAt: null, xpReward: 100 },
  { id: "a_19", slug: "wishlist-10", title: "Dreamer", description: "Keep 10 games on your wishlist", icon: "heart", rarity: "common", progress: 6, target: 10, unlocked: false, unlockedAt: null, xpReward: 100 },
  { id: "a_20", slug: "platform-5", title: "Everywhere Gamer", description: "Connect 5 platforms", icon: "globe", rarity: "rare", progress: 5, target: 5, unlocked: true, unlockedAt: daysAgo(120).toISOString(), xpReward: 400 },
];

export const DEMO_BADGES: Badge[] = [
  { id: "bd_1", slug: "early-bird", title: "Early Bird", description: "Signed up in the first wave of Sunk", icon: "bird", tier: "bronze", earnedAt: daysAgo(430).toISOString() },
  { id: "bd_2", slug: "connected", title: "Multi-Platform", description: "Connected 3 or more platforms", icon: "link", tier: "silver", earnedAt: daysAgo(290).toISOString() },
  { id: "bd_3", slug: "audit-veteran", title: "Vault Veteran", description: "First 100 purchases tracked", icon: "vault", tier: "silver", earnedAt: daysAgo(200).toISOString() },
  { id: "bd_4", slug: "insight-seeker", title: "Insight Seeker", description: "Viewed 50 insights", icon: "lightbulb", tier: "gold", earnedAt: daysAgo(90).toISOString() },
  { id: "bd_5", slug: "wallet-wizard", title: "Wallet Wizard", description: "Stayed under budget for a full season", icon: "wand", tier: "gold", earnedAt: daysAgo(60).toISOString() },
  { id: "bd_6", slug: "completionist", title: "Almost Done", description: "This badge is 90% complete. Classic.", icon: "check-circle", tier: "platinum", earnedAt: null },
];

/* ------------------------------------------------------------------ */
/* XP events                                                           */
/* ------------------------------------------------------------------ */

export const DEMO_XP_EVENTS: XpEvent[] = [
  { id: "x_1", type: "achievement", amount: 800, createdAt: daysAgo(30).toISOString(), description: "Monk Mode unlocked — 7 days without a purchase" },
  { id: "x_2", type: "level_up", amount: 500, createdAt: daysAgo(31).toISOString(), description: "Level 26 → 27" },
  { id: "x_3", type: "achievement", amount: 350, createdAt: daysAgo(45).toISOString(), description: "Subscription Purge unlocked" },
  { id: "x_4", type: "goal", amount: 300, createdAt: daysAgo(48).toISOString(), description: "Beat November's spend — personal best" },
  { id: "x_5", type: "achievement", amount: 400, createdAt: daysAgo(120).toISOString(), description: "Everywhere Gamer unlocked" },
  { id: "x_6", type: "achievement", amount: 500, createdAt: daysAgo(80).toISOString(), description: "Power Gamer unlocked" },
];

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

export const DEMO_NOTIFICATIONS: Notification[] = [
  { id: "n_1", kind: "renewal", title: "Fortnite Crew renews tomorrow", body: "Your monthly charge of $11.99 is due tomorrow. Tap to review.", read: false, createdAt: daysAgo(1).toISOString(), actionHref: "/app/subscriptions" },
  { id: "n_2", kind: "achievement", title: "Monk Mode unlocked", body: "7 days without a purchase. +800 XP. Legendary behavior.", read: false, createdAt: daysAgo(30).toISOString(), actionHref: "/app/achievements" },
  { id: "n_3", kind: "friend", title: "minty hit a new personal best", body: "minty spent only $86 this month — under budget for the 4th time.", read: false, createdAt: daysAgo(2).toISOString(), actionHref: "/app/friends" },
  { id: "n_4", kind: "insight", title: "EA Play went quiet", body: "You haven't launched an EA title in 74 days. Review this subscription.", read: true, createdAt: daysAgo(3).toISOString(), actionHref: "/app/subscriptions" },
  { id: "n_5", kind: "goal", title: "Almost there — save goal", body: "You're 44% of the way to your Steam Deck fund.", read: true, createdAt: daysAgo(5).toISOString(), actionHref: "/app/goals" },
  { id: "n_6", kind: "system", title: "PlayStation sync needs attention", body: "Reconnect PlayStation to keep your totals accurate.", read: true, createdAt: daysAgo(9).toISOString(), actionHref: "/app/settings" },
];

/* ------------------------------------------------------------------ */
/* Friends                                                             */
/* ------------------------------------------------------------------ */

export const DEMO_FRIENDS: Friend[] = [
  { id: "f_1", username: "minty", displayName: "minty", avatarUrl: null, status: "online", level: 31, xp: 22100, lifetimeSpend: 1840.5, monthlySpend: 86.4, lastActiveAt: daysAgo(0).toISOString(), isFriend: true, pending: false },
  { id: "f_2", username: "velcro", displayName: "velcro", avatarUrl: null, status: "online", level: 18, xp: 9800, lifetimeSpend: 3120.8, monthlySpend: 410.2, lastActiveAt: daysAgo(0).toISOString(), isFriend: true, pending: false },
  { id: "f_3", username: "drift_king", displayName: "DriftKing", avatarUrl: null, status: "idle", level: 24, xp: 15200, lifetimeSpend: 5320.1, monthlySpend: 310.7, lastActiveAt: daysAgo(0).toISOString(), isFriend: true, pending: false },
  { id: "f_4", username: "peach_bun", displayName: "peach_bun", avatarUrl: null, status: "offline", level: 12, xp: 4100, lifetimeSpend: 890.3, monthlySpend: 42.9, lastActiveAt: daysAgo(2).toISOString(), isFriend: true, pending: false },
  { id: "f_5", username: "solo_q", displayName: "solo_q", avatarUrl: null, status: "online", level: 44, xp: 33800, lifetimeSpend: 8400, monthlySpend: 620.5, lastActiveAt: daysAgo(0).toISOString(), isFriend: true, pending: false },
  { id: "f_6", username: "berrygood", displayName: "berrygood", avatarUrl: null, status: "offline", level: 9, xp: 2200, lifetimeSpend: 460.6, monthlySpend: 15.0, lastActiveAt: daysAgo(6).toISOString(), isFriend: true, pending: false },
  { id: "f_7", username: "frames_theory", displayName: "Frames", avatarUrl: null, status: "online", level: 35, xp: 26400, lifetimeSpend: 6230.4, monthlySpend: 505.1, lastActiveAt: daysAgo(0).toISOString(), isFriend: true, pending: false },
  { id: "f_8", username: "couch_coop", displayName: "couch_coop", avatarUrl: null, status: "idle", level: 16, xp: 7600, lifetimeSpend: 2100.9, monthlySpend: 190.4, lastActiveAt: daysAgo(1).toISOString(), isFriend: true, pending: false },
];

/* ------------------------------------------------------------------ */
/* Groups                                                              */
/* ------------------------------------------------------------------ */

export const DEMO_GROUPS: Group[] = [
  { id: "gr_1", name: "Sunk Squad", description: "A small clan that is very normal about skins.", memberCount: 12, avatarUrl: null, monthlyChallenge: { title: "Least spend wins", spend: 412.8, progress: 410.2 } },
  { id: "gr_2", name: "Guild of Restraint", description: "We track, we plan, we occasionally relapse.", memberCount: 47, avatarUrl: null, monthlyChallenge: { title: "No repeat games", spend: 3400.5, progress: 1280.0 } },
  { id: "gr_3", name: "Night Owls", description: "3AM lobbies, 9AM regrets.", memberCount: 8, avatarUrl: null, monthlyChallenge: { title: "Hour leader", spend: 620.3, progress: 490.9 } },
];

/* ------------------------------------------------------------------ */
/* Leaderboard                                                         */
/* ------------------------------------------------------------------ */

export const DEMO_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, userId: "lb_1", username: "solo_q", displayName: "solo_q", avatarUrl: null, level: 44, lifetimeSpend: 8400, monthlySpend: 620.5, weeklyChange: 0, isYou: false },
  { rank: 2, userId: "lb_2", username: "frames_theory", displayName: "Frames", avatarUrl: null, level: 35, lifetimeSpend: 6230.4, monthlySpend: 505.1, weeklyChange: 1, isYou: false },
  { rank: 3, userId: "lb_3", username: "drift_king", displayName: "DriftKing", avatarUrl: null, level: 24, lifetimeSpend: 5320.1, monthlySpend: 310.7, weeklyChange: -1, isYou: false },
  { rank: 4, userId: "lb_4", username: "platinum_otter", displayName: "Otter", avatarUrl: null, level: 29, lifetimeSpend: 4210, monthlySpend: 344.0, weeklyChange: 0, isYou: false },
  { rank: 5, userId: "lb_5", username: "void_reaper_", displayName: "VoidReaper", avatarUrl: null, level: 26, lifetimeSpend: 3890.5, monthlySpend: 289.4, weeklyChange: 2, isYou: false },
  { rank: 6, userId: "lb_6", username: "velcro", displayName: "velcro", avatarUrl: null, level: 18, lifetimeSpend: 3120.8, monthlySpend: 410.2, weeklyChange: 1, isYou: false },
  { rank: 7, userId: "lb_7", username: "nova", displayName: "Nova", avatarUrl: null, level: 27, lifetimeSpend: 2984.1, monthlySpend: 268.4, weeklyChange: 2, isYou: true },
  { rank: 8, userId: "lb_8", username: "couch_coop", displayName: "couch_coop", avatarUrl: null, level: 16, lifetimeSpend: 2100.9, monthlySpend: 190.4, weeklyChange: 0, isYou: false },
  { rank: 9, userId: "lb_9", username: "minty", displayName: "minty", avatarUrl: null, level: 31, lifetimeSpend: 1840.5, monthlySpend: 86.4, weeklyChange: 3, isYou: false },
  { rank: 10, userId: "lb_10", username: "rad_toad", displayName: "RadToad", avatarUrl: null, level: 21, lifetimeSpend: 1540.2, monthlySpend: 132.6, weeklyChange: -1, isYou: false },
  { rank: 11, userId: "lb_11", username: "peach_bun", displayName: "peach_bun", avatarUrl: null, level: 12, lifetimeSpend: 890.3, monthlySpend: 42.9, weeklyChange: 0, isYou: false },
  { rank: 12, userId: "lb_12", username: "berrygood", displayName: "berrygood", avatarUrl: null, level: 9, lifetimeSpend: 460.6, monthlySpend: 15.0, weeklyChange: 0, isYou: false },
];

/* ------------------------------------------------------------------ */
/* Wishlist                                                            */
/* ------------------------------------------------------------------ */

export const DEMO_WISHLIST: WishlistItem[] = [
  { id: "w_1", title: "Hades II", coverUrl: null, platform: "steam", price: 29.99, priceHistory: [{ date: daysAgo(180).toISOString(), price: 29.99 }, { date: daysAgo(90).toISOString(), price: 26.99 }, { date: daysAgo(30).toISOString(), price: 29.99 }], addedAt: daysAgo(180).toISOString(), notified: true },
  { id: "w_2", title: "Silksong", coverUrl: null, platform: "steam", price: null, priceHistory: [], addedAt: daysAgo(240).toISOString(), notified: false },
  { id: "w_3", title: "Monster Hunter Wilds", coverUrl: null, platform: "steam", price: 69.99, priceHistory: [{ date: daysAgo(60).toISOString(), price: 69.99 }, { date: daysAgo(10).toISOString(), price: 59.49 }], addedAt: daysAgo(60).toISOString(), notified: true },
  { id: "w_4", title: "Death Stranding 2", coverUrl: null, platform: "playstation", price: 69.99, priceHistory: [{ date: daysAgo(40).toISOString(), price: 69.99 }], addedAt: daysAgo(40).toISOString(), notified: false },
  { id: "w_5", title: "Palworld", coverUrl: null, platform: "steam", price: 29.99, priceHistory: [{ date: daysAgo(120).toISOString(), price: 29.99 }, { date: daysAgo(45).toISOString(), price: 24.99 }], addedAt: daysAgo(120).toISOString(), notified: true },
  { id: "w_6", title: "Black Myth: Wukong", coverUrl: null, platform: "steam", price: 59.99, priceHistory: [{ date: daysAgo(200).toISOString(), price: 59.99 }, { date: daysAgo(20).toISOString(), price: 53.99 }], addedAt: daysAgo(200).toISOString(), notified: true },
];

/* ------------------------------------------------------------------ */
/* Roast                                                               */
/* ------------------------------------------------------------------ */

export const DEMO_ROAST: Record<"mild" | "medium" | "extra_crispy", string[]> = {
  mild: [
    "You've spent $2,984 on games. That's a very expensive way to die to the same boss 40 times.",
    "Your Steam library has 156 games and you've played 23. The other 133 are having a really good sleep.",
    "$612 on Roblox. Somewhere, a 12-year-old is driving a Bugatti with your money.",
    "That CS2 case opening budget could have been a down payment on a car. A nice one.",
    "You've bought 14 battle passes. The battle is with your bank account, friend.",
  ],
  medium: [
    "You've spent $2,984 on gaming. Statistically, that's about 60 full-priced games you've half-finished.",
    "Your 2,648 hours of playtime cost you $1.13 per hour. Minimum wage workers are crying for you.",
    "74 days since you last touched EA Play, yet $4.99 leaves your account every single month. It's like rent for a house you abandoned.",
    "You bought $188 worth of Saint Quartz for a gacha. The gacha thanks you for your service.",
    "Your most expensive hobby purchase this year was a steam sale. Let that sink in.",
  ],
  extra_crispy: [
    "$2,984 in gaming spend and you still don't have the ranked skin. We need to talk.",
    "You have spent the price of a used car on virtual items that live in servers that could shut down tomorrow.",
    "The Steam Deck you bought to 'play more' currently plays more Steam sales than games.",
    "156 games owned. 23 played. That's not a library, that's a museum with a parking problem.",
    "You're paying 5 subscriptions and use 2. The other 3 are funding someone's vacation in Bali.",
  ],
};

