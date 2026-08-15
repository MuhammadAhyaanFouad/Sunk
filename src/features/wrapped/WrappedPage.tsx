"use client";

import { useMemo, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Gift, Share2, TrendingUp, Clock, Gamepad2, Crown, Repeat, Flame, Palette, Sparkles, Send, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { DonutChart } from "@/components/charts/DonutChart";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { useAskSunk, useWrapped } from "@/hooks/use-data";
import { PLATFORM_META } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { AskSunkReply } from "@/types";

const VERDICT_BADGE: Record<AskSunkReply["verdict"], "primary" | "warning" | "danger"> = {
  yes: "primary",
  maybe: "warning",
  no: "danger",
};

const VERDICT_LABEL: Record<AskSunkReply["verdict"], string> = {
  yes: "Go for it",
  maybe: "Tread carefully",
  no: "Not this month",
};

const SUGGESTIONS = ["Can I buy this for $60?", "How much budget do I have left?", "Should I get a $15/mo subscription?"];

export function WrappedPage() {
  const { data: wrapped, isLoading } = useWrapped();
  const ask = useAskSunk();
  const [query, setQuery] = useState("");
  const [asked, setAsked] = useState<string | null>(null);

  const donutData = useMemo(
    () =>
      wrapped?.platformBreakdown
        .slice()
        .sort((a, b) => b.amount - a.amount) ?? [],
    [wrapped],
  );

  const monthMax = useMemo(() => Math.max(...(wrapped?.purchasesByMonth.map((m) => m.amount) ?? []), 1), [wrapped]);

  const share = async () => {
    if (!wrapped) return;
    const text = `My Sunk ${wrapped.year} Wrapped: I spent ${formatCurrency(wrapped.totalSpend)} across ${wrapped.totalPurchases} purchases. Personality: ${wrapped.personalityTitle}. #SunkWrapped`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Share card copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  const submit = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || ask.isPending) return;
    setQuery("");
    setAsked(trimmed);
    ask.mutate(trimmed);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit(query);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonCard />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>
      </div>
    );
  }

  if (!wrapped) return null;

  const peakMonth = wrapped.peakMonth ? format(new Date(wrapped.peakMonth), "MMMM") : "—";

  const stats = [
    { label: "Total spent", value: formatCurrency(wrapped.totalSpend), icon: TrendingUp },
    { label: "Purchases", value: String(wrapped.totalPurchases), icon: Gift },
    { label: "Hours played", value: `${wrapped.hoursPlayed.toLocaleString()}h`, icon: Clock },
    { label: "Subscriptions active", value: String(wrapped.subscriptionsActive), icon: Repeat },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">Your {wrapped.year} Wrapped</h2>
          <p className="mt-0.5 text-[13px] text-ink-muted">Twelve months of games, distilled into one honest look at yourself.</p>
        </div>
        <Button variant="primary" leftIcon={<Share2 className="size-4" />} onClick={share}>
          Share
        </Button>
      </div>

      <Card className="p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="size-4.5" />
          </span>
          <div className="flex-1">
            <h3 className="font-display text-[15px] font-semibold text-ink">Ask Sunk</h3>
            <p className="mt-0.5 text-[13px] text-ink-muted">
              Ask if you can afford something this month. Sunk checks your budget and gives you a straight answer.
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-4">
          <div className="flex items-center gap-2 rounded-xl border border-edge bg-surface-raised px-3 py-2 transition-colors focus-within:border-edge-strong">
            <Send className="size-4 shrink-0 text-ink-faint" aria-hidden />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={asked ? asked : 'Ask something like "Can I buy this for $60?"'}
              className="w-full bg-transparent text-[14px] text-ink placeholder:text-ink-faint focus:outline-none"
              aria-label="Ask Sunk a question about your spending"
            />
            <Button type="submit" size="sm" variant="primary" loading={ask.isPending} disabled={!query.trim()}>
              Ask
            </Button>
          </div>
        </form>

        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => submit(s)}
              className="rounded-full border border-edge px-3 py-1 text-[12px] text-ink-faint transition-colors hover:border-edge-strong hover:text-ink-soft"
            >
              {s}
            </button>
          ))}
        </div>

        {ask.data && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-xl border border-primary/20 bg-primary/[0.05] p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={VERDICT_BADGE[ask.data.verdict]}>{VERDICT_LABEL[ask.data.verdict]}</Badge>
              <span className="text-[12px] text-ink-faint">Sunk's take on “{asked}”</span>
            </div>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{ask.data.answer}</p>
            <p className="mt-2 text-[12px] text-ink-faint">{ask.data.hint}</p>
          </motion.div>
        )}
      </Card>

      <Card className="relative overflow-hidden p-6 sm:p-10">
        <div className="flex flex-col items-center text-center">
          <motion.span
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"
          >
            <Gift className="size-7" />
          </motion.span>
          <p className="mt-4 font-mono text-[12px] uppercase tracking-[0.3em] text-ink-faint">Sunk Wrapped</p>
          <h2 className="mt-1 font-display text-4xl font-bold text-ink sm:text-5xl">{wrapped.year}</h2>
          <p className="mt-3 max-w-md text-[14px] leading-relaxed text-ink-soft">
            You spent <span className="font-semibold text-ink">{formatCurrency(wrapped.totalSpend)}</span> on gaming this year.
            That's a lot of <span className="text-primary">"treat yourself"</span> moments.
          </p>
          <div className="mt-6 flex items-center gap-2">
            <Badge variant="primary">{wrapped.personalityTitle}</Badge>
            <span className="flex items-center gap-1.5 text-[12px] text-ink-faint">
              <Flame className="size-3.5 text-warning" /> {wrapped.spendingPersonality}
            </span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="p-5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-white/[0.05] text-ink-faint">
                <s.icon className="size-4" />
              </span>
              <p className="mt-4 font-mono text-[22px] font-semibold text-ink tabular">
                <AnimatedNumber value={Number(s.value.replace(/[^0-9.]/g, "") || 0)} format={s.label === "Purchases" ? "number" : "currency"} />
              </p>
              <p className="mt-1 text-[12px] text-ink-muted">{s.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="flex items-center gap-2 font-display text-[15px] font-semibold text-ink">
            <Gamepad2 className="size-4 text-ink-faint" /> Your top games
          </h3>
          <div className="mt-4 space-y-2.5">
            {wrapped.topGames.length > 0 ? (
              wrapped.topGames.map((g, i) => {
                const max = wrapped.topGames[0]?.amount || 1;
                return (
                  <div key={g.title} className="flex items-center gap-3 rounded-xl border border-edge bg-surface-raised px-4 py-3">
                    <span className="w-6 shrink-0 text-center font-mono text-[13px] font-bold text-ink-faint">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-[14px] font-semibold text-ink">{g.title}</p>
                        <p className="shrink-0 font-mono text-[13px] font-semibold text-ink-soft tabular">{formatCurrency(g.amount)}</p>
                      </div>
                      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.05]">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max((g.amount / max) * 100, 4)}%` }} />
                      </div>
                      <p className="mt-1 text-[11px] text-ink-faint">
                        {g.count} purchase{g.count === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-[13px] text-ink-faint">No purchases tracked this year yet.</p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="flex items-center gap-2 font-display text-[15px] font-semibold text-ink">
            <CalendarDays className="size-4 text-ink-faint" /> Spend by month
          </h3>
          {wrapped.purchasesByMonth.length > 0 ? (
            <div className="mt-4">
              <div className="flex h-40 items-end gap-1.5">
                {wrapped.purchasesByMonth.map((m) => (
                  <div key={m.month} className="group relative flex h-full flex-1 flex-col justify-end" title={`${m.month}: ${formatCurrency(m.amount)}`}>
                    <div
                      className="w-full rounded-t-md bg-primary/80 transition-colors group-hover:bg-primary"
                      style={{ height: `${Math.max((m.amount / monthMax) * 100, 2)}%` }}
                    />
                    <span className="mt-1.5 text-center text-[10px] text-ink-faint">{m.month.split("/")[0]}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 border-t border-edge pt-3 text-[12px] text-ink-muted">
                Peaked in <span className="font-semibold text-ink">{peakMonth}</span> at{" "}
                <span className="font-semibold text-ink">{formatCurrency(Math.max(...wrapped.purchasesByMonth.map((x) => x.amount), 0))}</span>.
              </p>
            </div>
          ) : (
            <p className="mt-2 text-[13px] text-ink-faint">No monthly data yet.</p>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="flex items-center gap-2 font-display text-[15px] font-semibold text-ink">
            <Gamepad2 className="size-4 text-ink-faint" /> The big ones
          </h3>
          <div className="mt-5 space-y-4">
            {[
              { label: "Top game by spend", value: wrapped.topGame?.title ?? "—", sub: wrapped.topGame ? formatCurrency(wrapped.topGame.amount) : "" },
              { label: "Most expensive single buy", value: wrapped.mostExpensive?.title ?? "—", sub: wrapped.mostExpensive ? formatCurrency(wrapped.mostExpensive.amount) : "" },
              { label: "Most played", value: wrapped.mostPlayed?.title ?? "—", sub: wrapped.mostPlayed ? `${wrapped.mostPlayed.hours.toLocaleString()} hours` : "" },
            ].map((row, i) => (
              <motion.div
                key={row.label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                className="flex items-center justify-between gap-4 rounded-xl border border-edge bg-surface-raised px-4 py-3.5"
              >
                <div className="min-w-0">
                  <p className="text-[11px] text-ink-faint">{row.label}</p>
                  <p className="truncate text-[14px] font-semibold text-ink">{row.value}</p>
                </div>
                {row.sub && <p className="shrink-0 font-mono text-[13px] font-semibold text-ink-soft tabular">{row.sub}</p>}
              </motion.div>
            ))}
            <div className="flex items-center justify-between gap-4 rounded-xl border border-primary/30 bg-primary/[0.05] px-4 py-3.5">
              <div>
                <p className="text-[11px] text-ink-faint">Peak spending month</p>
                <p className="flex items-center gap-1.5 text-[14px] font-semibold text-ink">
                  <Crown className="size-3.5 text-warning" /> {peakMonth}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="flex items-center gap-2 font-display text-[15px] font-semibold text-ink">
            <Palette className="size-4 text-ink-faint" /> Where the money went
          </h3>
          <div className="mt-2">
            <DonutChart data={donutData} centerLabel="Total" centerValue={formatCurrency(wrapped.totalSpend)} size={200} />
          </div>
          <div className="mt-4 flex items-center gap-3 border-t border-edge pt-4">
            <PlatformIcon platform={wrapped.topPlatform ?? "steam"} size="md" />
            <p className="text-[13px] text-ink-soft">
              Top platform: <span className="font-semibold text-ink">{wrapped.topPlatform ? PLATFORM_META[wrapped.topPlatform].label : "—"}</span>
            </p>
          </div>
        </Card>
      </div>

      {wrapped.shareable && (
        <Card className="p-6 text-center">
          <p className="text-[13px] text-ink-soft">Prove your restraint to your friends.</p>
          <Button variant="outline" className="mt-3" leftIcon={<Share2 className="size-3.5" />} onClick={share}>
            Copy {wrapped.year} Wrapped
          </Button>
        </Card>
      )}
    </div>
  );
}
