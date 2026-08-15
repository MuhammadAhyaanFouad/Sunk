"use client";

import { useMemo } from "react";
import { Lightbulb, TrendingUp, TrendingDown, Sparkles, BellRing, Repeat, Gauge, Library, Trophy } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Stagger, FadeIn } from "@/components/motion/FadeIn";
import { useInsights } from "@/hooks/use-data";
import type { Insight } from "@/types";
import { cn } from "@/lib/utils";

const KIND_META: Record<
  string,
  { icon: typeof Lightbulb; label: string; tone: "positive" | "neutral" | "info" }
> = {
  spend_trend: { icon: TrendingUp, label: "Spend trend", tone: "neutral" },
  renewal_soon: { icon: Repeat, label: "Renewal due", tone: "info" },
  cost_per_hour: { icon: Gauge, label: "Cost per hour", tone: "neutral" },
  platform_trend: { icon: TrendingUp, label: "Platform trend", tone: "neutral" },
  unused_subscription: { icon: BellRing, label: "Unused subscription", tone: "info" },
  healthy_streak: { icon: Trophy, label: "Healthy streak", tone: "positive" },
  spend_down: { icon: TrendingDown, label: "Spend down", tone: "positive" },
  spend_up: { icon: TrendingUp, label: "Spend up", tone: "neutral" },
  new_best: { icon: Sparkles, label: "New best", tone: "positive" },
  library_growth: { icon: Library, label: "Library growth", tone: "neutral" },
};

export function InsightsPage() {
  const { data: insights, isLoading } = useInsights();

  const grouped = useMemo(() => {
    const sorted = [...(insights ?? [])].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return {
      positive: sorted.filter((i) => i.tone === "positive"),
      neutral: sorted.filter((i) => i.tone === "neutral"),
      info: sorted.filter((i) => i.tone === "info"),
    };
  }, [insights]);

  const renderInsight = (i: Insight) => {
    const meta = KIND_META[i.kind] ?? KIND_META.spend_trend;
    return (
      <Card
        key={i.id}
        className={cn(
          "flex items-start gap-4 p-5",
          i.tone === "positive" && "border-primary/25 bg-primary/[0.035]",
          i.tone === "info" && "border-warning/25 bg-warning/[0.035]"
        )}
      >
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            i.tone === "positive" ? "bg-primary/10 text-primary" : i.tone === "info" ? "bg-warning/10 text-warning" : "bg-white/[0.05] text-ink-faint"
          )}
        >
          <meta.icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[14.5px] font-semibold text-ink">{i.title}</p>
            <Badge variant={i.tone === "positive" ? "primary" : i.tone === "info" ? "warning" : "neutral"}>
              {meta.label}
            </Badge>
          </div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">{i.body}</p>
          <p className="mt-2 text-[11px] text-ink-faint">
            {formatDistanceToNow(new Date(i.createdAt), { addSuffix: true })}
          </p>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <FadeIn direction="none">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">Insights</h2>
          <p className="mt-0.5 text-[13px] text-ink-muted">
            Patterns detected from your data — no editorializing, just the math.
          </p>
        </div>
      </FadeIn>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <Stagger className="grid grid-cols-1 gap-4">
          {grouped.positive.map(renderInsight)}
          {grouped.info.map(renderInsight)}
          {grouped.neutral.map(renderInsight)}
          {insights && insights.length === 0 && (
            <Card className="p-10 text-center">
              <Lightbulb className="mx-auto mb-3 size-7 text-ink-faint" aria-hidden />
              <p className="font-display text-[15px] font-semibold text-ink">No insights yet</p>
              <p className="mt-1 text-[13px] text-ink-muted">Log a few purchases and patterns will start surfacing here.</p>
            </Card>
          )}
        </Stagger>
      )}
    </div>
  );
}
