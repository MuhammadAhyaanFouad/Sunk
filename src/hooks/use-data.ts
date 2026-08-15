"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApi } from "@/lib/api";
import type { PurchaseInput } from "@/lib/api/types";
import type { RoastLevel } from "@/lib/constants";

export const qk = {
  profile: ["profile"] as const,
  stats: ["stats"] as const,
  platforms: ["platforms"] as const,
  games: ["games"] as const,
  purchases: ["purchases"] as const,
  subscriptions: ["subscriptions"] as const,
  budget: ["budget"] as const,
  goals: ["goals"] as const,
  insights: ["insights"] as const,
  achievements: ["achievements"] as const,
  badges: ["badges"] as const,
  xpEvents: ["xpEvents"] as const,
  notifications: ["notifications"] as const,
  friends: ["friends"] as const,
  groups: ["groups"] as const,
  leaderboard: ["leaderboard"] as const,
  wishlist: ["wishlist"] as const,
  wrapped: ["wrapped"] as const,
  roast: (level: RoastLevel) => ["roast", level] as const,
  search: (q: string) => ["search", q] as const,
  billing: ["billing"] as const,
  payments: ["payments"] as const,
};

const api = () => getApi();

export function useProfile() {
  return useQuery({ queryKey: qk.profile, queryFn: () => api().getProfile() });
}

export function useStats() {
  return useQuery({ queryKey: qk.stats, queryFn: () => api().getStats() });
}

export function usePlatforms() {
  return useQuery({ queryKey: qk.platforms, queryFn: () => api().getPlatforms() });
}

export function useGames() {
  return useQuery({ queryKey: qk.games, queryFn: () => api().getGames() });
}

export function usePurchases() {
  return useQuery({ queryKey: qk.purchases, queryFn: () => api().getPurchases() });
}

export function useSubscriptions() {
  return useQuery({ queryKey: qk.subscriptions, queryFn: () => api().getSubscriptions() });
}

export function useBudget() {
  return useQuery({ queryKey: qk.budget, queryFn: () => api().getBudget() });
}

export function useGoals() {
  return useQuery({ queryKey: qk.goals, queryFn: () => api().getGoals() });
}

export function useInsights() {
  return useQuery({ queryKey: qk.insights, queryFn: () => api().getInsights() });
}

export function useAchievements() {
  return useQuery({ queryKey: qk.achievements, queryFn: () => api().getAchievements() });
}

export function useBadges() {
  return useQuery({ queryKey: qk.badges, queryFn: () => api().getBadges() });
}

export function useXpEvents() {
  return useQuery({ queryKey: qk.xpEvents, queryFn: () => api().getXpEvents() });
}

export function useNotifications() {
  return useQuery({ queryKey: qk.notifications, queryFn: () => api().getNotifications() });
}

export function useFriends() {
  return useQuery({ queryKey: qk.friends, queryFn: () => api().getFriends() });
}

export function useGroups() {
  return useQuery({ queryKey: qk.groups, queryFn: () => api().getGroups() });
}

export function useLeaderboard() {
  return useQuery({ queryKey: qk.leaderboard, queryFn: () => api().getLeaderboard() });
}

export function useWishlist() {
  return useQuery({ queryKey: qk.wishlist, queryFn: () => api().getWishlist() });
}

export function useWrapped() {
  return useQuery({ queryKey: qk.wrapped, queryFn: () => api().getWrapped() });
}

export function useRoast(level: RoastLevel) {
  return useQuery({
    queryKey: qk.roast(level),
    queryFn: () => api().getRoast(level),
    enabled: level !== "off",
  });
}

export function useAskSunk() {
  return useMutation({
    mutationFn: (query: string) => api().askSunk(query),
  });
}

export function useSearch(query: string) {
  return useQuery({
    queryKey: qk.search(query),
    queryFn: () => api().search(query),
    enabled: query.trim().length > 1,
  });
}

export function useBilling() {
  return useQuery({ queryKey: qk.billing, queryFn: () => api().getBilling() });
}

export function usePayments() {
  return useQuery({ queryKey: qk.payments, queryFn: () => api().getPayments() });
}

/* ------------------------- mutations ------------------------- */

export function useAddPurchase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PurchaseInput) => api().addPurchase(input),
    onSuccess: async () => {
      await Promise.all([qc.invalidateQueries({ queryKey: qk.purchases }), qc.invalidateQueries({ queryKey: qk.stats })]);
      toast.success("Purchase added to your Vault");
    },
    onError: () => toast.error("Could not add purchase"),
  });
}

export function useDeletePurchase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api().deletePurchase(id),
    onSuccess: async () => {
      await Promise.all([qc.invalidateQueries({ queryKey: qk.purchases }), qc.invalidateQueries({ queryKey: qk.stats }), qc.invalidateQueries({ queryKey: qk.budget })]);
      toast.success("Purchase removed");
    },
    onError: () => toast.error("Could not remove purchase"),
  });
}

export function useUpdatePurchase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<PurchaseInput> }) => api().updatePurchase(id, patch),
    onSuccess: async () => {
      await Promise.all([qc.invalidateQueries({ queryKey: qk.purchases }), qc.invalidateQueries({ queryKey: qk.stats })]);
      toast.success("Purchase updated");
    },
    onError: () => toast.error("Could not update purchase"),
  });
}

export function useConnectPlatform() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (platform: import("@/lib/constants").PlatformId) => api().connectPlatform(platform),
    onSuccess: async (res) => {
      await qc.invalidateQueries({ queryKey: qk.platforms });
      toast.success(`${res.platform.platform} connected · ${res.synced} transactions synced`);
    },
    onError: () => toast.error("Could not connect platform"),
  });
}

export function useDisconnectPlatform() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api().disconnectPlatform(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: qk.platforms });
      toast.success("Platform disconnected");
    },
    onError: () => toast.error("Could not disconnect platform"),
  });
}

export function useUpdateSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<import("@/types").Subscription> }) => api().updateSubscription(id, patch),
    onSuccess: async () => {
      await Promise.all([qc.invalidateQueries({ queryKey: qk.subscriptions }), qc.invalidateQueries({ queryKey: qk.stats })]);
      toast.success("Subscription updated");
    },
    onError: () => toast.error("Could not update subscription"),
  });
}

export function useMarkNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids?: string[]) => api().markNotificationsRead(ids),
    onSuccess: async () => qc.invalidateQueries({ queryKey: qk.notifications }),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<Pick<import("@/types").Profile, "displayName" | "username" | "bio" | "avatarUrl" | "onboarded" | "country" | "timezone">>) => api().updateProfile(patch),
    onSuccess: async () => {
      await Promise.all([qc.invalidateQueries({ queryKey: qk.profile }), qc.invalidateQueries({ queryKey: qk.friends }), qc.invalidateQueries({ queryKey: qk.leaderboard })]);
      toast.success("Profile updated");
    },
    onError: () => toast.error("Could not update profile"),
  });
}

export function useAddGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<import("@/types").Goal, "id" | "status" | "streak">) => api().addGoal(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: qk.goals });
      toast.success("Goal created");
    },
    onError: () => toast.error("Could not create goal"),
  });
}

export function useAddWishlistItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (title: string) => api().addWishlistItem(title),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: qk.wishlist });
      toast.success("Added to wishlist");
    },
    onError: () => toast.error("Could not add to wishlist"),
  });
}

export function useRemoveWishlistItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api().removeWishlistItem(id),
    onSuccess: async () => qc.invalidateQueries({ queryKey: qk.wishlist }),
  });
}

export function useUpdateBudgetLimit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (limit: number) => api().updateBudgetLimit(limit),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: qk.budget });
      toast.success("Budget updated");
    },
    onError: () => toast.error("Could not update budget"),
  });
}

export function useUpgradeToPremium() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api().upgradeToPremium(),
    onSuccess: async () => {
      await Promise.all([qc.invalidateQueries({ queryKey: qk.billing }), qc.invalidateQueries({ queryKey: qk.profile })]);
      toast.success("Welcome to Premium");
    },
    onError: () => toast.error("Could not upgrade"),
  });
}

export function useResetDemoData() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api().resetDemoData(),
    onSuccess: async () => {
      await qc.invalidateQueries();
      toast.success("Demo data reset");
    },
    onError: () => toast.error("Could not reset demo data"),
  });
}

export function useUpgrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api().upgradeToPremium(),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: qk.billing });
      toast.success("Welcome to Sunk Premium");
    },
    onError: () => toast.error("Upgrade failed"),
  });
}
