"use client";

import { useMemo } from "react";
import { RefreshCw, CalendarClock, ShieldCheck, Scissors, Play, Pause } from "lucide-react";
import { differenceInDays, isSameDay } from "date-fns";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { Stagger, FadeIn } from "@/components/motion/FadeIn";
import { useSubscriptions, useUpdateSubscription } from "@/hooks/use-data";
import { formatCurrency } from "@/lib/utils";

const RARITY = [
  { min: 30, label: "No rush", color: "text-ink-faint" },
  { min: 14, label: "Coming up", color: "text-ink-soft" },
  { min: 7, label: "Getting close", color: "text-warning" },
  { min: 3, label: "Very soon", color: "text-danger" },
  { min: 0, label: "Today", color: "text-primary" },
];

export function SubscriptionsPage() {
  const { data: subscriptions, isLoading } = useSubscriptions();
  const update = useUpdateSubscription();
  const busy = update.isPending && update.variables ? update.variables.id : null;

  const active = useMemo(() => subscriptions?.filter((s) => s.status === "active") ?? [], [subscriptions]);
  const monthlyTotal = active.reduce((s, sub) => s + sub.price, 0);
  const nextRenewal = useMemo(() => {
    const upcoming = active
      .map((s) => ({ ...s, days: differenceInDays(new Date(s.nextRenewal), new Date()) }))
      .sort((a, b) => a.days - b.days);
    return upcoming[0];
  }, [active]);

  return (
    <div className="space-y-6">
      <FadeIn direction="none">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">Subscriptions</h2>
          <p className="mt-0.5 text-[13px] text-ink-muted">
            Recurring charges are the quiet part of the gaming budget. Here they're loud.
          </p>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <Card className="p-5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-white/[0.05] text-ink-faint"><RefreshCw className="size-4" /></span>
              <p className="mt-4 text-[13px] text-ink-muted">Monthly recurring</p>
              <p className="mt-1 font-mono text-[24px] font-semibold text-ink tabular"><AnimatedNumber value={monthlyTotal} /></p>
              <p className="mt-1 text-[12px] text-ink-faint">{active.length} active subscriptions</p>
            </Card>
            <Card className="p-5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-white/[0.05] text-ink-faint"><CalendarClock className="size-4" /></span>
              <p className="mt-4 text-[13px] text-ink-muted">Next renewal</p>
              {nextRenewal ? (
                <>
                  <p className="mt-1 truncate text-[17px] font-semibold text-ink">{nextRenewal.name}</p>
                  <p className="mt-1 text-[12px] text-ink-faint">
                    {isSameDay(new Date(nextRenewal.nextRenewal), new Date())
                      ? "Charging today"
                      : `${differenceInDays(new Date(nextRenewal.nextRenewal), new Date())} days away`}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-[15px] text-ink-faint">None active</p>
              )}
            </Card>
            <Card className="p-5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-white/[0.05] text-ink-faint"><ShieldCheck className="size-4" /></span>
              <p className="mt-4 text-[13px] text-ink-muted">Per year</p>
              <p className="mt-1 font-mono text-[24px] font-semibold text-ink tabular"><AnimatedNumber value={monthlyTotal * 12} /></p>
              <p className="mt-1 text-[12px] text-ink-faint">If nothing changes</p>
            </Card>
          </>
        )}
      </div>

      <Stagger className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {subscriptions?.map((s) => {
          const days = differenceInDays(new Date(s.nextRenewal), new Date());
          const status = RARITY.find((r) => days >= r.min) ?? RARITY[RARITY.length - 1];
          const intervalFactor = s.interval === "yearly" ? 12 : 1;
          return (
            <Card key={s.id} className="p-5 transition-colors hover:border-edge-strong">
              <div className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-edge bg-surface-raised">
                  {s.platform ? <PlatformIcon platform={s.platform} size="lg" /> : <RefreshCw className="size-5 text-ink-faint" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[14.5px] font-semibold text-ink">{s.name}</p>
                    {s.status !== "active" && (
                      <Badge variant={s.status === "cancelled" ? "neutral" : "warning"}>{s.status}</Badge>
                    )}
                  </div>
                  <p className={`mt-0.5 text-[12px] ${status.color}`}>
                    {s.status !== "active"
                      ? s.status === "cancelled"
                        ? "Not renewing — charges stopped"
                        : s.status === "paused"
                          ? "Paused"
                          : "In trial"
                      : isSameDay(new Date(s.nextRenewal), new Date())
                        ? "Renews today"
                        : `Renews ${days <= 0 ? "soon" : `in ${days} days`}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[16px] font-semibold text-ink tabular">{formatCurrency(s.price)}</p>
                  <p className="text-[11px] text-ink-faint">/{s.interval === "yearly" ? "yr" : "mo"}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl border border-edge bg-surface-raised/50 px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-white/[0.05] text-ink-faint">
                    {s.autoRenew ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
                  </span>
                  <div>
                    <p className="text-[12px] font-medium text-ink-soft">
                      {s.autoRenew ? "Auto-renew on" : "Auto-renew off"}
                    </p>
                    <p className="text-[11px] text-ink-faint tabular">
                      {formatCurrency(s.price * intervalFactor)} / {s.interval}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={s.autoRenew}
                  onChange={(v) => update.mutate({ id: s.id, patch: { autoRenew: v } })}
                  disabled={busy !== null}
                  label={`Toggle auto-renew for ${s.name}`}
                />
              </div>

              {s.status === "active" && (
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Pause className="size-3.5" />}
                    loading={busy === s.id}
                    disabled={busy !== null}
                    onClick={() => update.mutate({ id: s.id, patch: { status: "paused" } })}
                  >
                    Pause
                  </Button>
                  <Button
                    variant="subtle"
                    size="sm"
                    leftIcon={<Scissors className="size-3.5" />}
                    loading={busy === s.id}
                    disabled={busy !== null}
                    onClick={() => update.mutate({ id: s.id, patch: { status: "cancelled" } })}
                  >
                    Cancel
                  </Button>
                </div>
              )}
              {s.status === "paused" && (
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Play className="size-3.5" />}
                    loading={busy === s.id}
                    disabled={busy !== null}
                    onClick={() => update.mutate({ id: s.id, patch: { status: "active", autoRenew: true } })}
                  >
                    Resume
                  </Button>
                  <Button
                    variant="subtle"
                    size="sm"
                    leftIcon={<Scissors className="size-3.5" />}
                    loading={busy === s.id}
                    disabled={busy !== null}
                    onClick={() => update.mutate({ id: s.id, patch: { status: "cancelled" } })}
                  >
                    Cancel
                  </Button>
                </div>
              )}
              {s.status === "cancelled" && (
                <div className="mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    loading={busy === s.id}
                    disabled={busy !== null}
                    onClick={() => update.mutate({ id: s.id, patch: { status: "active", autoRenew: true } })}
                  >
                    Resubscribe
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </Stagger>

      {!isLoading && subscriptions && subscriptions.length === 0 && (
        <Card className="p-10 text-center">
          <RefreshCw className="mx-auto mb-3 size-7 text-ink-faint" aria-hidden />
          <p className="font-display text-[15px] font-semibold text-ink">No subscriptions yet</p>
          <p className="mt-1 text-[13px] text-ink-muted">Connected platforms will surface your recurring charges automatically.</p>
        </Card>
      )}
    </div>
  );
}
