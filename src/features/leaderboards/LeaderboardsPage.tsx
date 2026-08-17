"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Trophy, TrendingUp, TrendingDown, Minus, Crown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { MarqueeText } from "@/components/ui/MarqueeText";
import { Stagger, FadeIn } from "@/components/motion/FadeIn";
import { useLeaderboard, useProfile } from "@/hooks/use-data";
import { useApp } from "@/context/app-context";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, cn } from "@/lib/utils";

const PODIUM_COLORS = ["bg-[#fbbf24]/15 text-[#fbbf24] border-[#fbbf24]/30", "bg-[#cbd5e1]/10 text-[#cbd5e1] border-[#cbd5e1]/25", "bg-[#d97706]/10 text-[#d97706] border-[#d97706]/30"];

export function LeaderboardsPage() {
  const { data: entries, isLoading } = useLeaderboard();
  const { data: profile } = useProfile();
  const { prefs } = useApp();

  const podium = useMemo(() => entries?.filter((e) => e.rank <= 3) ?? [], [entries]);
  const rest = useMemo(() => entries?.filter((e) => e.rank > 3) ?? [], [entries]);

  if (!prefs.leaderboards) {
    return (
      <div className="space-y-6">
        <FadeIn direction="none">
          <div>
            <h2 className="font-display text-xl font-bold text-ink">Leaderboards</h2>
            <p className="mt-0.5 text-[13px] text-ink-muted">Lifetime spend, ranked. There's no shame in the game — well, there's a little.</p>
          </div>
        </FadeIn>
        <EmptyState
          icon={<Trophy className="size-6" aria-hidden />}
          title="Leaderboards are turned off"
          description="No one's comparing numbers right now. You can switch them back on any time in Settings → Privacy."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FadeIn direction="none">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">Leaderboards</h2>
          <p className="mt-0.5 text-[13px] text-ink-muted">
            Lifetime spend, ranked. There's no shame in the game — well, there's a little.
          </p>
        </div>
      </FadeIn>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 items-end gap-3">
            {[1, 0, 2].map((idx) => {
              const e = podium[idx];
              if (!e) return <div key={idx} />;
              const height = idx === 0 ? "h-28" : idx === 1 ? "h-24" : "h-20";
              return (
                <motion.div
                  key={e.rank}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-soft">
                    {e.rank === 1 && <Crown className="size-3.5 text-warning" />}
                    {e.displayName}
                  </div>
                  <div className={cn("flex w-full max-w-[140px] flex-col items-center justify-start rounded-t-2xl border border-b-0 p-3", height, PODIUM_COLORS[idx])}>
                    <span className="font-mono text-[13px] font-bold tabular">{formatCurrency(e.lifetimeSpend)}</span>
                    <span className="mt-0.5 text-[10px] opacity-70">#{e.rank}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <Stagger className="space-y-2">
            {rest.map((e) => {
              const delta = e.weeklyChange;
              const isYou = e.userId === profile?.id;
              return (
                <Card
                  key={e.userId}
                  className={cn(
                    "flex items-center gap-4 p-3.5 transition-colors hover:border-edge-strong",
                    isYou && "border-primary/40 bg-primary/[0.045]"
                  )}
                >
                  <span className="w-8 text-center font-mono text-[14px] font-bold text-ink-faint tabular">#{e.rank}</span>
                  <Avatar name={e.displayName} src={e.avatarUrl} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <MarqueeText className={cn("text-[14px] font-semibold", isYou ? "text-primary" : "text-ink")}>
                        {e.displayName}
                      </MarqueeText>
                      {isYou && <Badge variant="primary">You</Badge>}
                    </div>
                    <p className="text-[11.5px] text-ink-faint">@{e.username} · Lv {e.level}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[14px] font-semibold text-ink tabular">{formatCurrency(e.lifetimeSpend)}</p>
                    <p className="text-[11px] text-ink-faint tabular">{formatCurrency(e.monthlySpend)} this month</p>
                  </div>
                  <span
                    className={cn(
                      "flex w-16 items-center justify-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-medium tabular",
                      delta > 0
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : delta < 0
                          ? "border-danger/30 bg-danger/10 text-danger"
                          : "border-edge bg-surface text-ink-faint"
                    )}
                  >
                    {delta > 0 ? <TrendingUp className="size-3" /> : delta < 0 ? <TrendingDown className="size-3" /> : <Minus className="size-3" />}
                    {delta > 0 ? "+" : ""}{delta}
                  </span>
                </Card>
              );
            })}
            {entries && entries.length === 0 && (
              <Card className="p-10 text-center">
                <Trophy className="mx-auto mb-3 size-7 text-ink-faint" aria-hidden />
                <p className="font-display text-[15px] font-semibold text-ink">Nobody's on the board yet</p>
                <p className="mt-1 text-[13px] text-ink-muted">Connect a platform and claim the top spot.</p>
              </Card>
            )}
          </Stagger>
        </>
      )}
    </div>
  );
}
