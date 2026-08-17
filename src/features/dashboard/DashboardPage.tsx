"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  Sparkles,
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  RefreshCw,
  Trophy,
  Plus,
} from "lucide-react";
import { format, isSameDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { MonthlySpendChart } from "@/components/charts/MonthlySpendChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { Avatar } from "@/components/ui/Avatar";
import { MarqueeText } from "@/components/ui/MarqueeText";
import {
  useStats,
  useBudget,
  useSubscriptions,
  usePurchases,
  usePlatforms,
  useFriends,
  useProfile,
  useLeaderboard,
  useGoals,
} from "@/hooks/use-data";
import { formatCurrency, timeAgo, cn } from "@/lib/utils";
import { CATEGORY_META, PLATFORM_META, type PlatformId } from "@/lib/constants";
import { useApp } from "@/context/app-context";
import type { Goal } from "@/types";

const PLATFORM_COLOR: Record<PlatformId, string> = {
  roblox: "#FF5C7A",
  steam: "#5CC8FF",
  epic: "#8B5CF6",
  playstation: "#2DD4BF",
  xbox: "#9BF00B",
  nintendo: "#FF5C5C",
  battlenet: "#00AEFF",
  gog: "#FFD63E",
};

const REFUND_WINDOW_HOURS: Record<PlatformId, number> = {
  steam: 14 * 24,
  roblox: 48,
  epic: 14 * 24,
  playstation: 14 * 24,
  xbox: 14 * 24,
  nintendo: 14 * 24,
  battlenet: 14 * 24,
  gog: 30 * 24,
};

const SSR_CLOCK = new Date(2026, 6, 1);

function Tile({ label, value, sub }: { label: string; value: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-edge bg-surface p-5 transition-all duration-300 hover:border-edge-strong">
      <p className="text-[12.5px] text-ink-muted">{label}</p>
      <p className="mt-1.5 font-mono text-[24px] font-semibold leading-none tracking-tight text-ink tabular">{value}</p>
      {sub && <p className="mt-1.5 text-[12px] text-ink-faint">{sub}</p>}
    </div>
  );
}

function ProgressBar({
  pct,
  color,
  track = "#1B1B1B",
  className,
}: {
  pct: number;
  color: string;
  track?: string;
  className?: string;
}) {
  return (
    <div className={cn("h-[6px] w-full overflow-hidden rounded-[3px]", className)} style={{ backgroundColor: track }}>
      <div className="h-full rounded-[3px]" style={{ width: `${Math.max(0, Math.min(pct, 100))}%`, backgroundColor: color }} />
    </div>
  );
}

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: budget } = useBudget();
  const { data: subscriptions } = useSubscriptions();
  const { data: purchases } = usePurchases();
  const { data: platforms } = usePlatforms();
  const { data: friends } = useFriends();
  const { data: profile } = useProfile();
  const { data: goals } = useGoals();
  const { data: leaderboard } = useLeaderboard();
  const { prefs } = useApp();

  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setNow(new Date()));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Stable SSR/initial fallback — prevents hydration mismatches from time-dependent text.
  const clock = now ?? SSR_CLOCK;
  const year = clock.getFullYear();

  const hour = clock.getHours();
  const greeting = hour < 5 ? "Good night" : hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : hour < 21 ? "Good evening" : "Good night";

  const yearPurchases = useMemo(
    () => (purchases ?? []).filter((p) => p.status !== "refunded" && new Date(p.purchasedAt).getFullYear() === year),
    [purchases, year],
  );

  const yearSpend = yearPurchases.reduce((sum, p) => sum + p.amount, 0);
  const yearPlatforms = new Set(yearPurchases.map((p) => p.platform)).size;

  const perPlatformYear = useMemo(() => {
    const map = new Map<PlatformId, number>();
    for (const p of yearPurchases) map.set(p.platform, (map.get(p.platform) ?? 0) + p.amount);
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [yearPurchases]);

  const biggestPurchase = yearPurchases.length ? Math.max(...yearPurchases.map((p) => p.amount)) : 0;
  const topPlatform = perPlatformYear[0]?.[0];
  const monthsWithData = new Set(yearPurchases.map((p) => p.purchasedAt.slice(0, 7))).size;
  const avgPerMonth = monthsWithData ? yearSpend / monthsWithData : 0;

  const monthlySeries = useMemo(() => {
    if (!purchases?.length) return [];
    const byMonth = new Map<string, Map<PlatformId, number>>();
    for (const p of purchases) {
      if (p.status === "refunded") continue;
      const key = p.purchasedAt.slice(0, 7);
      if (!byMonth.has(key)) byMonth.set(key, new Map());
      const m = byMonth.get(key)!;
      m.set(p.platform, (m.get(p.platform) ?? 0) + p.amount);
    }
    return [...byMonth.keys()]
      .sort()
      .slice(-6)
      .map((month) => {
        const map = byMonth.get(month)!;
        const plats = [...map.entries()].map(([platform, amount]) => ({ platform, amount }));
        return { month, total: plats.reduce((s, x) => s + x.amount, 0), platforms: plats };
      });
  }, [purchases]);

  const platformBreakdown = platforms?.map((p) => ({ platform: p.platform, amount: p.totalSpend })) ?? [];
  const budgetPct = budget ? (budget.currentSpend / budget.monthlyLimit) * 100 : 0;
  const overBudget = budget ? budget.currentSpend - budget.monthlyLimit : 0;
  const activeFriends = friends?.filter((f) => f.status === "online").length ?? 0;
  const recentPurchases = purchases?.slice(0, 3) ?? [];
  const upcomingRenewals = subscriptions?.filter((s) => s.status === "active").slice(0, 4) ?? [];
  const activeGoals = goals?.filter((g) => g.status === "active") ?? [];

  // Month-over-month trend
  const thisMonthSpend = useMemo(
    () => (purchases ?? []).filter((p) => p.status !== "refunded" && p.purchasedAt.slice(0, 7) === format(clock, "yyyy-MM")).reduce((s, p) => s + p.amount, 0),
    [purchases, clock],
  );
  const prevMonthKey = format(new Date(clock.getFullYear(), clock.getMonth() - 1, 1), "yyyy-MM");
  const lastMonthSpend = useMemo(
    () => (purchases ?? []).filter((p) => p.status !== "refunded" && p.purchasedAt.slice(0, 7) === prevMonthKey).reduce((s, p) => s + p.amount, 0),
    [purchases, prevMonthKey],
  );
  const trend = lastMonthSpend ? (thisMonthSpend - lastMonthSpend) / lastMonthSpend : 0;
  const trendUp = trend >= 0;
  const lastMonthLabel = format(new Date(clock.getFullYear(), clock.getMonth() - 1, 1), "MMMM");

  // Percentile vs other users (based on this month spend in the leaderboard)
  const percentile = useMemo(() => {
    const me = leaderboard?.find((e) => e.isYou);
    const others = (leaderboard ?? []).filter((e) => !e.isYou);
    if (!me || others.length === 0) return 72;
    const below = others.filter((e) => e.monthlySpend < me.monthlySpend).length;
    return Math.round((below / others.length) * 100);
  }, [leaderboard]);

  // Refund windows from recent purchases
  const refundWindows = useMemo(() => {
    const eligible = (purchases ?? [])
      .filter((p) => p.status !== "refunded" && REFUND_WINDOW_HOURS[p.platform])
      .map((p) => {
        const hoursSince = (clock.getTime() - new Date(p.purchasedAt).getTime()) / 3600000;
        const hoursLeft = REFUND_WINDOW_HOURS[p.platform] - hoursSince;
        return { p, hoursLeft };
      })
      .filter((e) => e.hoursLeft > 0)
      .sort((a, b) => a.hoursLeft - b.hoursLeft)
      .slice(0, 2);
    return eligible;
  }, [purchases, clock]);

  const goalProgress = (g: Goal) => Math.min((g.current / g.target) * 100, 100);
  const goalValue = (g: Goal) =>
    g.unit === "money" ? formatCurrency(g.current) : `${g.current.toLocaleString()} ${g.unit === "days" ? "d" : "hrs"}`;

  return (
    <div className="space-y-6">
      {/* Page head */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-faint">Dashboard</p>
          <h2 className="mt-1 font-display text-xl font-bold text-ink">
            {now ? `${greeting}${profile?.displayName ? `, ${profile.displayName}` : ""}` : ""}
          </h2>
        </div>
        <Badge variant="outline">{year}</Badge>
      </div>

      {/* Hero card */}
      <Card className="relative overflow-hidden rounded-[20px] p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/[0.08] blur-3xl" aria-hidden />
        <p className="font-mono text-[12px] uppercase tracking-[0.06em] text-warning">Your {year} gaming spend, so far</p>
        <p className="mt-4 font-mono text-[46px] font-bold leading-none tracking-tight text-primary tabular">
          <AnimatedNumber value={yearSpend} format="currency" />
        </p>
        <p className="mt-3 text-[14px] text-ink-soft">
          You've spent <strong className="text-ink">{formatCurrency(yearSpend)}</strong> on gaming this year, across{" "}
          <strong className="text-ink">{yearPlatforms} platform{yearPlatforms === 1 ? "" : "s"}</strong>.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-3 py-1 text-[12.5px] font-semibold text-warning">
            {trendUp ? <ArrowUpRight className="size-3.5" aria-hidden /> : <ArrowDownRight className="size-3.5" aria-hidden />}
            {Math.abs(trend * 100).toFixed(0)}% vs last month
          </span>
          <span className="text-[13px] text-ink-muted">
            You spent <strong className="text-ink">{formatCurrency(lastMonthSpend)}</strong> in {lastMonthLabel}
          </span>
        </div>
        <div className="mt-5">
          <Link
            href="/app/wrapped"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Sparkles className="size-3.5" aria-hidden />
            Generate share card
          </Link>
        </div>
      </Card>

      {/* Tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Tile label="Avg. per month" value={<AnimatedNumber value={avgPerMonth} format="currency" />} sub={`across ${monthsWithData || "—"} months`} />
        <Tile label="Biggest purchase" value={formatCurrency(biggestPurchase)} sub="single purchase this year" />
        <Tile
          label="Most spent on"
          value={topPlatform ? PLATFORM_META[topPlatform].label : "—"}
          sub={topPlatform ? `${formatCurrency(perPlatformYear[0][1])} this year` : "No data yet"}
        />
      </div>

      {/* Spend by platform + budget */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Spend by platform</CardTitle>
              <CardDescription>Where it went this year</CardDescription>
            </div>
            <Badge variant="neutral">THIS YEAR</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {perPlatformYear.length ? (
              perPlatformYear.slice(0, 4).map(([platform, amount]) => {
                const pct = (amount / perPlatformYear[0][1]) * 100;
                return (
                  <div key={platform}>
                    <div className="mb-[5px] flex items-center justify-between text-[12.5px]">
                      <span className="flex items-center gap-2 text-ink-soft">
                        <PlatformIcon platform={platform} size="sm" />
                        {PLATFORM_META[platform].label}
                      </span>
                      <span className="font-mono text-ink-soft tabular">{formatCurrency(amount)}</span>
                    </div>
                    <ProgressBar pct={pct} color={PLATFORM_COLOR[platform]} />
                  </div>
                );
              })
            ) : (
              <p className="py-8 text-center text-[13px] text-ink-faint">No purchases this year yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Monthly budget</CardTitle>
              <CardDescription>{format(clock, "MMM")} limit</CardDescription>
            </div>
            <Badge variant="primary" icon={<CalendarClock className="size-3" />}>
              {budget?.streak ?? 0}-mo streak
            </Badge>
          </CardHeader>
          <CardContent>
            {budget ? (
              <>
                <div className="flex items-end gap-1.5">
                  <p className="font-mono text-[26px] font-semibold leading-none text-ink tabular">
                    <AnimatedNumber value={budget.currentSpend} format="currency" />
                  </p>
                  <p className="pb-0.5 text-[13px] text-ink-muted">
                    / <span className="font-mono tabular">{formatCurrency(budget.monthlyLimit)}</span> limit
                  </p>
                </div>
                <div className="mt-4 h-[14px] w-full overflow-hidden rounded-[4px]" style={{ backgroundColor: "#1B1B1B" }}>
                  <div
                    className="h-full rounded-[4px] transition-[width] duration-700"
                    style={{ width: `${Math.max(0, Math.min(budgetPct, 100))}%`, backgroundColor: "var(--color-warning)" }}
                  />
                </div>
                {overBudget > 0 ? (
                  <p className="mt-3 text-[13px] font-medium text-warning">
                    You're <strong>{formatCurrency(overBudget)}</strong> over budget this month.
                  </p>
                ) : (
                  <p className="mt-3 text-[13px] text-ink-muted">
                    You're <strong className="text-ink">{formatCurrency(Math.max(0, budget.monthlyLimit - budget.currentSpend))}</strong> under budget this month.
                  </p>
                )}
              </>
            ) : (
              <SkeletonCard />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chart + you vs others */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className={prefs.leaderboards ? undefined : "lg:col-span-2"}>
          <CardHeader>
            <div>
              <CardTitle>Spend over time</CardTitle>
              <CardDescription>Hover for total · click for breakdown</CardDescription>
            </div>
            <span className="hidden font-mono text-[11px] text-ink-faint sm:block">HOVER FOR TOTAL · CLICK FOR BREAKDOWN</span>
          </CardHeader>
          <CardContent>
            {monthlySeries.length ? (
              <MonthlySpendChart data={monthlySeries} />
            ) : (
              <Skeleton className="h-40 w-full" />
            )}
          </CardContent>
        </Card>

        {prefs.leaderboards && (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>You vs other Sunk users</CardTitle>
                <CardDescription>This month</CardDescription>
              </div>
              <Badge variant="neutral">{format(clock, "MMM")}</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-[14.5px] leading-relaxed text-ink-soft">
                You're spending more than <strong className="font-semibold text-warning">{percentile}%</strong> of users this month.
              </p>
              <div className="relative mt-5 h-[10px] w-full overflow-hidden rounded-[5px]" style={{ backgroundColor: "#1B1B1B" }}>
                <div
                  className="h-full rounded-[5px] transition-[width] duration-700"
                  style={{ width: `${percentile}%`, background: "linear-gradient(90deg, var(--color-primary) 0%, var(--color-warning) 100%)" }}
                />
                <span
                  className="absolute -top-1 h-[18px] w-[2px] -translate-x-1/2 rounded-full bg-ink"
                  style={{ left: `${percentile}%` }}
                  aria-hidden
                />
              </div>
              <p className="mt-4 text-[12px] text-ink-faint">Anonymous, aggregated — no friends needed to see this.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Refund windows */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Refund windows</CardTitle>
            <CardDescription>Purchases you can still claw back</CardDescription>
          </div>
          <Badge variant="primary">STILL ELIGIBLE</Badge>
        </CardHeader>
        <CardContent>
          {refundWindows.length ? (
            <div className="space-y-2.5">
              {refundWindows.map(({ p, hoursLeft }) => {
                const urgent = hoursLeft <= 6;
                return (
                  <div key={p.id} className="flex items-center gap-3 rounded-xl border border-edge bg-surface-raised/50 px-3.5 py-2.5">
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: PLATFORM_COLOR[p.platform] }}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <MarqueeText className="text-[13px] font-medium text-ink">{p.title}</MarqueeText>
                      <p className="text-[11.5px] text-ink-faint">
                        {PLATFORM_META[p.platform].label} · {formatCurrency(p.amount)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 font-mono text-[11.5px] font-semibold",
                        urgent ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary",
                      )}
                    >
                      {Math.max(1, Math.round(hoursLeft))}h left
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-6 text-center text-[13px] text-ink-faint">Nothing refundable right now.</p>
          )}
          <p className="mt-4 text-[12px] text-ink-faint">
            Based on each platform's actual refund policy — Steam gives 2 hours of playtime or 14 days, whichever's shorter.
          </p>
        </CardContent>
      </Card>

      {/* Recent activity + goals */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>Your latest additions to the Vault</CardDescription>
            </div>
            <Link href="/app/vault" className="flex items-center gap-1 text-[12px] font-medium text-primary hover:underline">
              View all <ChevronRight className="size-3.5" aria-hidden />
            </Link>
          </CardHeader>
          <CardContent className="space-y-1">
            {recentPurchases.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-white/[0.03]">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: PLATFORM_COLOR[p.platform] }}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <MarqueeText className="text-[13px] font-medium text-ink">{p.title}</MarqueeText>
                  <p className="text-[11.5px] text-ink-faint">
                    {timeAgo(p.purchasedAt)} · {CATEGORY_META[p.category].label}
                  </p>
                </div>
                <span className="font-mono text-[13px] font-semibold text-ink tabular">{formatCurrency(p.amount)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Savings goals</CardTitle>
              <CardDescription>Missions in progress</CardDescription>
            </div>
            <Badge variant="neutral">{activeGoals.length} active</Badge>
          </CardHeader>
          <CardContent>
            {activeGoals.length ? (
              <div className="space-y-3">
                {activeGoals.slice(0, 3).map((g) => {
                  const pct = goalProgress(g);
                  return (
                    <div key={g.id}>
                      <div className="mb-1.5 flex items-center justify-between text-[12.5px]">
                        <MarqueeText className="font-medium text-ink">{g.title}</MarqueeText>
                        <span className="ml-2 shrink-0 font-mono text-ink-faint tabular">
                          {goalValue(g)} / {g.unit === "money" ? formatCurrency(g.target) : g.target.toLocaleString()}
                        </span>
                      </div>
                      <ProgressBar pct={pct} color="var(--color-primary)" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="py-6 text-center text-[13px] text-ink-faint">No active goals.</p>
            )}
            <div className="mt-4">
              <Link
                href="/app/goals"
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-edge py-2 text-[12.5px] font-medium text-ink-soft transition-colors hover:border-edge-strong hover:text-ink"
              >
                <Plus className="size-3.5" aria-hidden />
                Add a goal
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Your stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : (
            <>
              <Tile label="Lifetime spend" value={<AnimatedNumber value={stats?.lifetimeSpend ?? 0} format="currency" />} sub={`${stats?.totalPurchases ?? 0} tracked purchases`} />
              <Tile label="This month" value={<AnimatedNumber value={stats?.monthlySpend ?? 0} format="currency" />} sub="vs. last month" />
              <Tile label="Monthly subscriptions" value={<AnimatedNumber value={stats?.monthlyRecurring ?? 0} format="currency" />} sub={`${stats?.activeSubscriptions ?? 0} active renewals`} />
              <Tile label="Hours played" value={<AnimatedNumber value={stats?.totalHours ?? 0} format="number" suffix="h" />} sub={`${stats?.totalGames ?? 0} games in library`} />
            </>
          )}
      </div>

      {/* Platform donut + renewals + friends */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <div>
              <CardTitle>Platform breakdown</CardTitle>
              <CardDescription>Where your money actually went</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {platformBreakdown.length ? (
              <DonutChart data={platformBreakdown.slice(0, 5)} size={160} centerLabel="Total" centerValue={formatCurrency(stats?.lifetimeSpend ?? 0)} />
            ) : (
              <Skeleton className="h-40 w-full" />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <div>
              <CardTitle>Upcoming renewals</CardTitle>
              <CardDescription>Charges on the horizon</CardDescription>
            </div>
            <Link href="/app/subscriptions" className="text-[12px] font-medium text-primary hover:underline">
              Manage
            </Link>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {upcomingRenewals.length ? (
              upcomingRenewals.map((s) => {
                const due = new Date(s.nextRenewal);
                const today = new Date();
                const isToday = isSameDay(due, today);
                return (
                  <div key={s.id} className="flex items-center gap-3 rounded-xl border border-edge bg-surface-raised/50 px-3.5 py-2.5 transition-colors hover:border-edge-strong">
                    {s.platform ? <PlatformIcon platform={s.platform} /> : <RefreshCw className="size-4 text-ink-faint" aria-hidden />}
                    <div className="min-w-0 flex-1">
                      <MarqueeText className="text-[13px] font-medium text-ink">{s.name}</MarqueeText>
                      <p className="text-[11.5px] text-ink-faint">
                        {isToday ? "Renews today" : formatRelative(s.nextRenewal)}
                      </p>
                    </div>
                    <span className="font-mono text-[12.5px] font-semibold text-ink tabular">{formatCurrency(s.price)}</span>
                  </div>
                );
              })
            ) : (
              <p className="py-6 text-center text-[13px] text-ink-faint">No active subscriptions.</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <div>
              <CardTitle>Friend activity</CardTitle>
              <CardDescription>{activeFriends} online now</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {friends?.slice(0, 5).map((f) => (
              <div key={f.id} className="flex items-center gap-3">
                <Avatar src={f.avatarUrl} name={f.displayName} size="sm" online={f.status === "online"} />
                <div className="min-w-0 flex-1">
                      <MarqueeText className="text-[13px] font-medium text-ink">{f.displayName}</MarqueeText>
                  <p className="text-[11.5px] text-ink-faint">
                    {f.status === "online" ? "Online" : timeAgo(f.lastActiveAt ?? new Date().toISOString())}
                  </p>
                </div>
                <span className="font-mono text-[12px] text-ink-soft tabular">
                  {formatCurrency(f.monthlySpend)}<span className="text-ink-faint">/mo</span>
                </span>
              </div>
            ))}
            <div className="pt-1">
              <Link
                href="/app/friends"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-edge py-2 text-[12.5px] font-medium text-ink-soft transition-colors hover:border-edge-strong hover:text-ink"
              >
                <Trophy className="size-3.5" aria-hidden />
                Friends & leaderboards
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function formatRelative(date: string) {
  const d = new Date(date);
  const days = Math.round((d.getTime() - Date.now()) / 86400000);
  if (days === 0) return "Renews today";
  if (days === 1) return "Renews tomorrow";
  if (days < 0) return "Renewed";
  return `In ${days} days`;
}
