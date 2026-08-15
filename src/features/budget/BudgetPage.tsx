"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Wallet, TrendingDown, Flame, Crown, PencilLine, Check, X } from "lucide-react";
import { format } from "date-fns";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Progress } from "@/components/ui/Progress";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { FadeIn } from "@/components/motion/FadeIn";
import { useBudget, useUpdateBudgetLimit } from "@/hooks/use-data";
import { formatCurrency } from "@/lib/utils";

export function BudgetPage() {
  const { data: budget, isLoading } = useBudget();
  const update = useUpdateBudgetLimit();
  const [editing, setEditing] = useState(false);
  const [limit, setLimit] = useState("");

  const pct = useMemo(() => {
    if (!budget) return 0;
    return Math.min((budget.currentSpend / budget.monthlyLimit) * 100, 100);
  }, [budget]);

  const remaining = budget ? Math.max(budget.monthlyLimit - budget.currentSpend, 0) : 0;
  const over = budget ? Math.max(budget.currentSpend - budget.monthlyLimit, 0) : 0;
  const daysLeft = budget ? new Date(budget.startDate).getDate() : 0;

  const startEditing = () => {
    setEditing(true);
    setLimit(String(budget?.monthlyLimit ?? ""));
  };

  const saveLimit = async () => {
    const v = Number(limit);
    if (Number.isFinite(v) && v > 0) {
      await update.mutateAsync(v);
      setEditing(false);
    }
  };

  return (
    <div className="space-y-6">
      <FadeIn direction="none">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">Budget</h2>
          <p className="mt-0.5 text-[13px] text-ink-muted">
            A monthly cap turns "just one more" into a decision.
          </p>
        </div>
      </FadeIn>

      {isLoading || !budget ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          <Card className="relative overflow-hidden p-6">
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Wallet className="size-4.5" />
                  </span>
                  <div>
                    <p className="text-[13px] text-ink-muted">
                      {format(new Date(budget.startDate), "MMMM yyyy")} spend
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="font-mono text-[30px] font-semibold leading-none text-ink tabular">
                        <AnimatedNumber value={budget.currentSpend} />
                      </p>
                      <p className="text-[14px] text-ink-faint">
                        of <span className="text-ink-soft">{formatCurrency(budget.monthlyLimit)}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 max-w-lg">
                  <Progress value={pct} status={over > 0 ? "danger" : pct > 85 ? "warning" : "success"} />
                  <div className="mt-2 flex items-center justify-between text-[12px]">
                    <span className="text-ink-muted">{pct.toFixed(0)}% used</span>
                    <span className="tabular text-ink-faint">
                      {over > 0 ? (
                        <span className="font-semibold text-danger">{formatCurrency(over)} over budget</span>
                      ) : (
                        `${formatCurrency(remaining)} left · ${daysLeft} days`
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start md:self-center">
                {editing ? (
                  <>
                    <Input
                      type="number"
                      value={limit}
                      onChange={(e) => setLimit(e.target.value)}
                      className="w-32"
                      min="1"
                      step="10"
                      autoFocus
                    />
                    <Button variant="primary" size="icon" onClick={saveLimit} aria-label="Save limit">
                      <Check className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setEditing(false)} aria-label="Cancel">
                      <X className="size-4" />
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" leftIcon={<PencilLine className="size-3.5" />} onClick={startEditing}>
                    Edit limit
                  </Button>
                )}
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="p-5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <TrendingDown className="size-4" />
              </span>
              <p className="mt-4 text-[13px] text-ink-muted">Months under budget</p>
              <p className="mt-1 font-mono text-[24px] font-semibold text-ink tabular"><AnimatedNumber value={budget.streak} format="number" /></p>
              <p className="mt-1 text-[12px] text-ink-faint">Best streak: {budget.bestStreak} mo</p>
            </Card>
            <Card className="p-5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-warning/10 text-warning">
                <Flame className="size-4" />
              </span>
              <p className="mt-4 text-[13px] text-ink-muted">Personal best month</p>
              <p className="mt-1 truncate text-[17px] font-semibold text-ink">
                {budget.personalBestMonth ? format(new Date(budget.personalBestMonth), "MMMM yyyy") : "—"}
              </p>
              <p className="mt-1 text-[12px] text-ink-faint tabular">
                {budget.personalBestSpend ? formatCurrency(budget.personalBestSpend) : "No data yet"}
              </p>
            </Card>
            <Card className="p-5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-white/[0.05] text-ink-faint">
                <Crown className="size-4" />
              </span>
              <p className="mt-4 text-[13px] text-ink-muted">Rolling 12-month average</p>
              <p className="mt-1 font-mono text-[24px] font-semibold text-ink tabular">
                <AnimatedNumber value={budget.history.reduce((s, h) => s + h.spent, 0) / Math.max(budget.history.length, 1)} />
              </p>
              <p className="mt-1 text-[12px] text-ink-faint">Per month</p>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="font-display text-[15px] font-semibold text-ink">12-month history</h3>
            <p className="mt-0.5 text-[12px] text-ink-muted">Monthly spend versus your limit.</p>
            <div className="mt-6 flex h-40 items-end gap-[6px]">
              {budget.history.map((h, i) => {
                const hPct = Math.min((h.spent / h.limit) * 100, 100);
                const isOver = h.spent > h.limit;
                const isCurrent = i === budget.history.length - 1;
                return (
                  <div key={h.month} className="group flex flex-1 flex-col items-center gap-1.5">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(hPct, 3)}%` }}
                      transition={{ delay: i * 0.03, duration: 0.5, ease: "easeOut" }}
                      className={`w-full rounded-t-md transition-colors ${
                        isOver
                          ? "bg-danger/70 group-hover:bg-danger"
                          : isCurrent
                            ? "bg-primary/80 group-hover:bg-primary"
                            : "bg-white/[0.09] group-hover:bg-white/[0.16]"
                      }`}
                    />
                    <span className="text-[9.5px] text-ink-faint tabular">{format(new Date(h.month), "MMM")}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center gap-4 text-[11px] text-ink-muted">
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-danger/70" /> Over budget</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary/80" /> Current month</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-white/[0.16]" /> Under budget</span>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
