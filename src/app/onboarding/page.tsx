"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { Progress } from "@/components/ui/Progress";
import { useProfile, useUpdateProfile } from "@/hooks/use-data";
import { PLATFORMS, PLATFORM_META } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Step = "welcome" | "scan" | "reveal";

const SCAN_LINES = [
  "Contacting Steam community servers…",
  "Pulling purchase history (last 5 years)…",
  "Cross-referencing your library with wishlist…",
  "Counting the hours you told yourself were 'research'…",
  "Scanning for subscriptions you forgot to cancel…",
  "Loading your budget horizon…",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();

  const [step, setStep] = useState<Step>("welcome");
  const [selected, setSelected] = useState<string[]>(["steam"]);
  const [scanProgress, setScanProgress] = useState(0);
  const [logIndex, setLogIndex] = useState(0);
  const [budget, setBudget] = useState("300");
  const [finishing, setFinishing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startScan = () => {
    setStep("scan");
    setScanProgress(0);
    setLogIndex(0);
    timerRef.current = setInterval(() => {
      setScanProgress((p) => {
        const next = p + Math.random() * 7 + 2;
        if (next >= 100) {
          if (timerRef.current) clearInterval(timerRef.current);
          setTimeout(() => setStep("reveal"), 400);
          return 100;
        }
        return next;
      });
      setLogIndex((i) => (i + 1) % SCAN_LINES.length);
    }, 420);
  };

  const finish = async () => {
    setFinishing(true);
    const limit = Number(budget);
    await updateProfile.mutateAsync({ onboarded: true });
    if (Number.isFinite(limit) && limit > 0) {
      const api = (await import("@/lib/api")).getApi();
      await api.updateBudgetLimit(limit).catch(() => null);
    }
    router.replace("/app");
  };

  const togglePlatform = (p: string) => {
    setSelected((s) => (s.includes(p) ? s.filter((x) => x !== p) : [...s, p]));
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-40 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-primary/[0.08] blur-[120px]" />
      </div>

      <div className="relative mb-10 flex flex-col items-center gap-3">
        <Logo size="lg" />
        <p className="font-display text-sm font-semibold tracking-wide text-ink-soft">Welcome{profile ? `, ${profile.displayName}` : ""}</p>
      </div>

      <div className="relative w-full max-w-[520px]">
        <Progress value={step === "welcome" ? 20 : step === "scan" ? 60 : 100} status="success" glow className="mb-10" />

        <AnimatePresence mode="wait">
          {step === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="font-display text-[26px] font-bold text-ink">Connect your platforms</h1>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
                Sunk reads your purchase history so you don't have to log anything by hand. Pick where you play:
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {PLATFORMS.map((p) => {
                  const on = selected.includes(p);
                  return (
                    <button
                      key={p}
                      onClick={() => togglePlatform(p)}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-colors",
                        on ? "border-primary/50 bg-primary/[0.06]" : "border-edge bg-surface hover:border-edge-strong"
                      )}
                    >
                      <PlatformIcon platform={p} size="lg" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-semibold text-ink">{PLATFORM_META[p].label}</span>
                        <span className={cn("block text-[11px]", on ? "text-primary" : "text-ink-faint")}>
                          {on ? "Connected" : "Tap to add"}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <Button variant="primary" className="mt-6 w-full" onClick={startScan}>
                Start the scan
              </Button>
              <p className="mt-2 text-center text-[11.5px] text-ink-faint">
                {selected.length} platform{selected.length === 1 ? "" : "s"} selected
              </p>
            </motion.div>
          )}

          {step === "scan" && (
            <motion.div
              key="scan"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="relative mx-auto flex size-24 items-center justify-center">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary"
                />
                <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <svg viewBox="0 0 24 24" fill="none" className="size-7"><path d="M3 12h4l2-6 4 12 2-6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
              </div>
              <h1 className="mt-5 font-display text-[22px] font-bold text-ink">Crunching your number…</h1>
              <p className="mt-2 font-mono text-[12.5px] text-ink-muted tabular">{Math.round(scanProgress)}%</p>

              <div className="mx-auto mt-6 h-24 w-full max-w-sm overflow-hidden rounded-xl border border-edge bg-surface-raised px-4 py-3 text-left">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={logIndex}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="truncate font-mono text-[11.5px] text-primary/80"
                  >
                    {SCAN_LINES[logIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {step === "reveal" && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
            >
              <div className="flex flex-col items-center text-center">
                <motion.span
                  initial={{ scale: 0.6 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 16 }}
                  className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="size-7"><path d="m4 12.5 5 5L20 6.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </motion.span>
                <h1 className="mt-4 font-display text-[24px] font-bold text-ink">You're all set</h1>
                <p className="mt-2 max-w-md text-[13.5px] leading-relaxed text-ink-muted">
                  We found <span className="font-semibold text-ink">156 games</span>,{" "}
                  <span className="font-semibold text-ink">9 subscriptions</span>, and a lifetime spend north of{" "}
                  <span className="font-semibold text-ink">$2,900</span>. No judgment. Well… maybe a little.
                </p>

                <div className="mt-6 w-full max-w-xs text-left">
                  <Label htmlFor="onboarding-budget">Monthly budget (USD)</Label>
                  <Input id="onboarding-budget" type="number" min="1" step="10" value={budget} onChange={(e) => setBudget(e.target.value)} />
                  <p className="mt-1.5 text-[11.5px] text-ink-faint">You can change this anytime in Budget.</p>
                </div>

                <Button variant="primary" className="mt-6 w-full max-w-xs" onClick={finish} loading={finishing}>
                  Take me to the dashboard
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
