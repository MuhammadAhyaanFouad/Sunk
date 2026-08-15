"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flame, Share2, Quote, Sparkles, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useRoast, useStats } from "@/hooks/use-data";
import { useApp } from "@/context/app-context";
import { EmptyState } from "@/components/ui/EmptyState";
import type { RoastLevel } from "@/lib/constants";
import { ROAST_META } from "@/lib/constants";
import { formatCurrency, cn } from "@/lib/utils";

const LEVELS: { value: Exclude<RoastLevel, "off">; flame: string; desc: string }[] = [
  { value: "mild", flame: "text-warning", desc: "A gentle nudge" },
  { value: "medium", flame: "text-orange", desc: "Slight burn" },
  { value: "extra_crispy", flame: "text-danger", desc: "Fully cremated" },
];

const LEVEL_INTENSITY: Record<Exclude<RoastLevel, "off">, string> = {
  mild: "from-[#f5b03c]/20 via-transparent to-transparent",
  medium: "from-[#ff8a3c]/25 via-transparent to-transparent",
  extra_crispy: "from-[#ff4d4d]/30 via-transparent to-transparent",
};

export function RoastPage() {
  const [level, setLevel] = useState<Exclude<RoastLevel, "off">>("medium");
  const { data: roast, isLoading, isFetching } = useRoast(level);
  const { data: stats } = useStats();
  const { prefs } = useApp();

  useEffect(() => {
    if (roast && !isFetching) {
      toast("Roast incoming", { description: `Level: ${ROAST_META[level].label}`, duration: 2500 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  const share = async () => {
    if (!roast) return;
    const text = `I let ${ROAST_META[level].label} ${roast.lines[0]}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Could not copy");
    }
  };

  if (!prefs.roast) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-ink">Roast Mode</h2>
            <p className="mt-0.5 text-[13px] text-ink-muted">We read your purchase history out loud, to your face.</p>
          </div>
        </div>
        <EmptyState
          icon={<Flame className="size-6" aria-hidden />}
          title="Roast Mode is turned off"
          description="The mic is off. You can turn it back on any time in Settings → Privacy."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">Roast Mode</h2>
          <p className="mt-0.5 text-[13px] text-ink-muted">We read your purchase history out loud, to your face.</p>
        </div>
        <div className="flex items-center gap-2">
          {LEVELS.map((l) => (
            <button
              key={l.value}
              onClick={() => setLevel(l.value)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-colors",
                level === l.value
                  ? "border-danger/40 bg-danger/10 text-danger"
                  : "border-edge bg-surface text-ink-soft hover:border-edge-strong hover:text-ink"
              )}
            >
              <Flame className={cn("size-3.5", level === l.value ? l.flame : "text-ink-faint")} />
              {ROAST_META[l.value].label}
            </button>
          ))}
        </div>
      </div>

      <Card className="relative overflow-hidden p-8 sm:p-12">
        <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br", LEVEL_INTENSITY[level])} aria-hidden />
        <div className="relative flex flex-col items-center text-center">
          <motion.span
            key={level}
            initial={{ scale: 0.8, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff8a3c]/20 to-[#ff4d4d]/20 text-danger"
          >
            <Flame className="size-8" />
          </motion.span>

          <div className="mt-5 flex items-center gap-2">
            <Badge variant="danger">{ROAST_META[level].label}</Badge>
            <span className="text-[12px] text-ink-faint">
              Based on your {formatCurrency(stats?.lifetimeSpend ?? 0)} lifetime spend
            </span>
          </div>

          <div className="mt-8 min-h-[180px] w-full max-w-2xl">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="mx-auto h-4 w-full max-w-xl animate-pulse rounded bg-white/[0.06]" />
                ))}
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.blockquote
                  key={`${level}-${roast?.lines.join("")}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-4"
                >
                  <Quote className="mx-auto size-6 -scale-x-100 text-danger/50" aria-hidden />
                  {roast?.lines.map((line, i) => (
                    <motion.p
                      key={line}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.15 + i * 0.18 }}
                      className="font-display text-[17px] font-semibold leading-relaxed text-ink sm:text-[20px]"
                    >
                      {line}
                    </motion.p>
                  ))}
                </motion.blockquote>
              </AnimatePresence>
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button variant="outline" leftIcon={<RefreshCw className="size-3.5" />} onClick={() => setLevel((l) => (l === "extra_crispy" ? "mild" : l === "mild" ? "medium" : "extra_crispy"))}>
              Cycle levels
            </Button>
            <Button variant="primary" leftIcon={<Share2 className="size-3.5" />} onClick={share}>
              Copy roast
            </Button>
            {stats && (
              <span className="flex items-center gap-1.5 text-[11.5px] text-ink-faint">
                <Sparkles className="size-3 text-warning" />
                Roasts get funnier as your number goes up
              </span>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
