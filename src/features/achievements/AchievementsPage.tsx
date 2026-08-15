"use client";

import { useState } from "react";
import { Trophy, Lock, Star, Zap, Medal } from "lucide-react";
import { format } from "date-fns";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Stagger, FadeIn } from "@/components/motion/FadeIn";
import { useAchievements } from "@/hooks/use-data";
import { cn } from "@/lib/utils";

const RARITY_ORDER = ["common", "uncommon", "rare", "epic", "legendary"] as const;
const RARITY_META: Record<string, { label: string; ring: string; text: string; glow: string }> = {
  common: { label: "Common", ring: "border-edge-strong", text: "text-ink-soft", glow: "" },
  uncommon: { label: "Uncommon", ring: "border-[#4ade80]/40", text: "text-[#4ade80]", glow: "shadow-[0_0_24px_-6px_rgba(74,222,128,0.5)]" },
  rare: { label: "Rare", ring: "border-[#60a5fa]/40", text: "text-[#60a5fa]", glow: "shadow-[0_0_24px_-6px_rgba(96,165,250,0.5)]" },
  epic: { label: "Epic", ring: "border-[#c084fc]/40", text: "text-[#c084fc]", glow: "shadow-[0_0_24px_-6px_rgba(192,132,252,0.5)]" },
  legendary: { label: "Legendary", ring: "border-[#fbbf24]/40", text: "text-[#fbbf24]", glow: "shadow-[0_0_28px_-6px_rgba(251,191,36,0.55)]" },
};

export function AchievementsPage() {
  const { data: achievements, isLoading } = useAchievements();
  const [filter, setFilter] = useState<"all" | (typeof RARITY_ORDER)[number]>("all");

  const filtered = achievements?.filter((a) => filter === "all" || a.rarity === filter) ?? [];
  const unlocked = achievements?.filter((a) => a.unlocked).length ?? 0;
  const totalXp = achievements?.filter((a) => a.unlocked).reduce((s, a) => s + a.xpReward, 0) ?? 0;

  return (
    <div className="space-y-6">
      <FadeIn direction="none">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">Achievements</h2>
          <p className="mt-0.5 text-[13px] text-ink-muted">
            Earning the badge that says "I knew what I was doing."
          </p>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-warning/10 text-warning"><Trophy className="size-4" /></span>
          <p className="mt-4 text-[13px] text-ink-muted">Unlocked</p>
          <p className="mt-1 font-mono text-[24px] font-semibold text-ink tabular">
            {unlocked}<span className="text-[14px] text-ink-faint"> / {achievements?.length ?? 0}</span>
          </p>
        </Card>
        <Card className="p-5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><Zap className="size-4" /></span>
          <p className="mt-4 text-[13px] text-ink-muted">XP earned</p>
          <p className="mt-1 font-mono text-[24px] font-semibold text-ink tabular">{totalXp}<span className="text-[14px] text-ink-faint"> xp</span></p>
        </Card>
        <Card className="p-5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-white/[0.05] text-ink-faint"><Medal className="size-4" /></span>
          <p className="mt-4 text-[13px] text-ink-muted">Completion</p>
          <p className="mt-1 font-mono text-[24px] font-semibold text-ink tabular">
            {achievements?.length ? Math.round((unlocked / achievements.length) * 100) : 0}%
          </p>
        </Card>
      </div>

      <FadeIn direction="none" className="flex flex-wrap gap-2">
        {(["all", ...RARITY_ORDER] as const).map((r) => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-[12px] font-medium capitalize transition-colors",
              filter === r
                ? "border-primary/60 bg-primary/10 text-primary"
                : "border-edge bg-surface text-ink-soft hover:border-edge-strong hover:text-ink"
            )}
          >
            {r === "all" ? "All" : RARITY_META[r].label}
          </button>
        ))}
      </FadeIn>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => {
            const meta = RARITY_META[a.rarity];
            const pct = Math.min((a.progress / a.target) * 100, 100);
            return (
              <Card
                key={a.id}
                className={cn(
                  "relative overflow-hidden p-5 transition-colors",
                  a.unlocked ? cn("border", meta.ring, meta.glow) : "hover:border-edge-strong"
                )}
              >
                {!a.unlocked && (
                  <div className="pointer-events-none absolute inset-0" aria-hidden />
                )}
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={cn(
                      "flex size-11 items-center justify-center rounded-xl text-[22px]",
                      a.unlocked ? "bg-white/[0.06]" : "bg-white/[0.03] opacity-60 grayscale"
                    )}
                  >
                    {a.icon || <Lock className="size-5 text-ink-faint" />}
                  </span>
                  <Badge variant={a.unlocked ? "primary" : "neutral"} className={cn(!a.unlocked && "text-ink-faint")}>
                    {meta.label}
                  </Badge>
                </div>

                <p className={cn("mt-3.5 text-[14.5px] font-semibold", a.unlocked ? "text-ink" : "text-ink-soft")}>
                  {a.title}
                </p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">{a.description}</p>

                <div className="mt-4">
                  {a.unlocked ? (
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-medium text-primary">Unlocked {a.unlockedAt ? format(new Date(a.unlockedAt), "MMM d") : ""}</span>
                      <span className="flex items-center gap-1 text-[11px] text-ink-faint"><Star className="size-3" /> +{a.xpReward} XP</span>
                    </div>
                  ) : (
                    <>
                      <Progress value={pct} status={a.rarity === "legendary" ? "warning" : "default"} />
                      <div className="mt-1.5 flex items-center justify-between text-[11px] text-ink-faint">
                        <span>{a.progress} / {a.target}</span>
                        <span className="flex items-center gap-1"><Star className="size-3" /> {a.xpReward} XP</span>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </Stagger>
      )}
    </div>
  );
}
