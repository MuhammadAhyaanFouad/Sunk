"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  ArrowRight, Check, ChevronDown, Flame, Gauge, Target, Users, Trophy, Sparkles,
  Wallet, RefreshCw, Lock, Gift, LineChart, Zap, Crown,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { BRAND } from "@/lib/constants";
import { formatCurrency, cn } from "@/lib/utils";

const FEATURES = [
  { icon: Wallet, title: "Vault", body: "Every game, skin, and battle pass in one place. Searchable, taggable, and brutally honest." },
  { icon: LineChart, title: "Insights", body: "Cost-per-hour, spend trends, and subscription creep — surfaced automatically from your history." },
  { icon: Target, title: "Budget & goals", body: "Set a monthly cap, run no-spend challenges, and build streaks that actually mean something." },
  { icon: Users, title: "Squad battles", body: "Leaderboards with your friends. Mild shame is the best motivator." },
  { icon: RefreshCw, title: "Subscriptions", body: "Every recurring charge, sorted by how soon it's about to hurt." },
  { icon: Gift, title: "Sunk Wrapped", body: "Your year, distilled into one shareable card of financial self-discovery." },
];

const STEPS = [
  { n: "01", title: "Connect", body: "Link Steam, Xbox, PlayStation, Roblox, Epic, and more. Reads your purchase history automatically." },
  { n: "02", title: "Scan", body: "We index games, subscriptions, DLC, and battle passes into one unified timeline." },
  { n: "03", title: "Know", body: "Get your number, your budget, and a roast sharp enough to change your habits." },
];

const FAQ = [
  { q: "Does Sunk charge for the free plan?", a: "No. Free is free forever — unlimited Vault, one connected platform, and core insights. Premium unlocks everything else." },
  { q: "How does Sunk read my purchases?", a: "You authorize read-only access to your store accounts. We import your purchase history and library metadata — we never get your credentials or card details." },
  { q: "Can I use it without connecting anything?", a: "Yes. You can log purchases manually, and demo mode lets you explore the whole product before you even make an account." },
  { q: "What happens to my data?", a: "Your data is encrypted in transit and at rest, covered by RLS policies per account, and exportable at any time. Delete your account and it's gone." },
];

const PLATFORMS_MARQUEE = ["Steam", "Xbox", "PlayStation", "Roblox", "Epic Games", "Battle.net", "Nintendo", "GOG"];

function SectionTitle({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
      <h2 className="font-display text-[30px] font-bold leading-tight text-ink sm:text-[38px]">{title}</h2>
      {sub && <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">{sub}</p>}
    </div>
  );
}

export function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroInView = useInView(heroRef, { once: true });
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-background">
      {/* Nav */}
      <header className="relative z-20 mx-auto flex max-w-[1200px] items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-7 text-[13.5px] text-ink-muted md:flex">
          <a href="#features" className="transition-colors hover:text-ink">Features</a>
          <a href="#how" className="transition-colors hover:text-ink">How it works</a>
          <a href="#pricing" className="transition-colors hover:text-ink">Pricing</a>
          <a href="#faq" className="transition-colors hover:text-ink">FAQ</a>
        </nav>
        <div className="flex items-center gap-2.5">
          <Link href="/login" className="hidden rounded-lg px-3 py-2 text-[13.5px] font-medium text-ink-soft transition-colors hover:text-ink sm:block">
            Sign in
          </Link>
          <Button variant="primary" size="sm" asChild>
            <Link href="/app">Open app</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section ref={heroRef} className="relative z-10 mx-auto flex max-w-[1200px] flex-col items-center px-6 pb-24 pt-16 text-center sm:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={heroInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="primary" className="mb-5">
            <Sparkles className="size-3" /> Know your number
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={heroInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="max-w-3xl font-display text-[42px] font-bold leading-[1.05] tracking-tight text-ink sm:text-[68px]"
        >
          The gaming spend tracker that <span className="text-primary">keeps it real</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={heroInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="mt-6 max-w-xl text-[16px] leading-relaxed text-ink-muted sm:text-[17px]"
        >
          Sunk imports your Steam, Xbox, PlayStation, and Roblox history — then shows you exactly what your library really cost. Budgets, goals, Wrapped, and a roast you didn't ask for.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={heroInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Button variant="primary" size="lg" asChild>
            <Link href="/app">Try the demo <ArrowRight className="size-4" /></Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/signup">Create an account</Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={heroInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6, delay: 0.28 }}
          className="mt-14 w-full max-w-[880px]"
        >
          <HeroMock />
        </motion.div>

        <div className="relative mt-16 w-full overflow-hidden">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.25em] text-ink-faint/70">
            Supported stores
          </p>
          <div className="mt-5 overflow-hidden">
            <div className="animate-marquee flex w-max" style={{ animationDuration: "28s" }}>
              {[...PLATFORMS_MARQUEE, ...PLATFORMS_MARQUEE].map((p, i) => (
                <span
                  key={`${p}-${i}`}
                  className="mr-12 whitespace-nowrap text-[13px] font-medium text-ink-faint transition-colors hover:text-ink-soft"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 mx-auto max-w-[1200px] px-6 py-24">
        <SectionTitle
          eyebrow="Features"
          title="Everything your number deserves"
          sub="A full command center for your spending, designed like a game you can actually beat."
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: (i % 3) * 0.07 }}
            >
              <div className="group h-full rounded-3xl border border-edge bg-surface p-6 transition-all hover:-translate-y-0.5 hover:border-edge-strong hover:bg-surface-raised">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
                  <f.icon className="size-5" />
                </span>
                <h3 className="mt-4 font-display text-[16px] font-bold text-ink">{f.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">{f.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative z-10 mx-auto max-w-[1200px] px-6 py-24">
        <SectionTitle eyebrow="How it works" title="Three steps to the truth" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.1 }}
              className="relative rounded-3xl border border-edge bg-surface p-7"
            >
              <span className="font-mono text-[13px] font-bold text-primary">{s.n}</span>
              <h3 className="mt-3 font-display text-[18px] font-bold text-ink">{s.title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Roast showcase */}
      <section className="relative z-10 mx-auto max-w-[1200px] px-6 py-24">
        <div className="relative overflow-hidden rounded-[32px] border border-danger/20 bg-surface p-8 sm:p-14">
          <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-danger">
                <Flame className="size-4" /> Roast Mode
              </p>
              <h2 className="mt-3 font-display text-[30px] font-bold leading-tight text-ink sm:text-[38px]">
                We read your history out loud. To your face.
              </h2>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-muted">
                Mild, Medium, or Extra Crispy — pick your heat. Then get roasted based on your actual spending, in your actual numbers.
              </p>
              <ul className="mt-6 space-y-2.5">
                {["Roasts generated from your real data", "Levels from gentle nudge to full cremation", "Copy it and send it to the group chat"].map((li) => (
                  <li key={li} className="flex items-center gap-2.5 text-[13.5px] text-ink-soft">
                    <span className="flex size-5 items-center justify-center rounded-full bg-danger/15 text-danger"><Check className="size-3" /></span>
                    {li}
                  </li>
                ))}
              </ul>
              <Button variant="danger" className="mt-7" asChild>
                <Link href="/app/roast">Get roasted <Flame className="size-4" /></Link>
              </Button>
            </div>
            <div className="rounded-3xl border border-edge bg-[#0d0d0d] p-6 sm:p-8">
              <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-ink-faint">
                <Flame className="size-3.5 text-danger" /> Extra Crispy · Lifetime spend {formatCurrency(2984.13)}
              </p>
              <div className="mt-6 space-y-4">
                {[
                  "You own 156 games and have finished exactly 4 of them. Your library is a museum of intentions.",
                  "You've spent enough on battle passes to fund a small country's esports scene. They don't know your name.",
                  "There's a sale right now and you're reading this instead of buying. Growth.",
                ].map((line, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12 }}
                    className="font-display text-[15px] font-semibold leading-relaxed text-ink"
                  >
                    "{line}"
                  </motion.p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 mx-auto max-w-[1200px] px-6 py-24">
        <SectionTitle eyebrow="Pricing" title="Free to face the truth" sub="Start free. Upgrade when the shame gets good." />
        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-edge bg-surface p-7">
            <h3 className="font-display text-[18px] font-bold text-ink">Free</h3>
            <p className="mt-1 text-[13px] text-ink-muted">For getting started</p>
            <p className="mt-4 font-mono text-[40px] font-semibold text-ink">$0</p>
            <p className="text-[12px] text-ink-faint">forever</p>
            <ul className="mt-6 space-y-2.5">
              {["Unlimited Vault entries", "One connected platform", "Core insights & budget", "Roast Mode (Mild only)"].map((li) => (
                <li key={li} className="flex items-center gap-2.5 text-[13.5px] text-ink-soft">
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary/15 text-primary"><Check className="size-3" /></span>
                  {li}
                </li>
              ))}
            </ul>
            <Button variant="outline" className="mt-7 w-full" asChild>
              <Link href="/signup">Start free</Link>
            </Button>
          </div>

          <div className="relative rounded-3xl border border-primary/40 bg-surface p-7 shadow-[0_0_60px_-20px_rgba(57,255,106,0.35)]">
            <Badge variant="primary" className="absolute -top-3 left-1/2 -translate-x-1/2">Popular</Badge>
            <h3 className="flex items-center gap-2 font-display text-[18px] font-bold text-ink">
              <Crown className="size-4 text-primary" /> Premium
            </h3>
            <p className="mt-1 text-[13px] text-ink-muted">For the deeply curious</p>
            <p className="mt-4 font-mono text-[40px] font-semibold text-ink">
              $4<span className="text-[16px] text-ink-faint">/mo</span>
            </p>
            <p className="text-[12px] text-ink-faint">billed securely</p>
            <ul className="mt-6 space-y-2.5">
              {["Unlimited connected platforms", "Full Insights engine & Wrapped", "No-spend challenges & streaks", "All Roast levels, all the time", "Priority support & early features"].map((li) => (
                <li key={li} className="flex items-center gap-2.5 text-[13.5px] text-ink-soft">
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary/15 text-primary"><Check className="size-3" /></span>
                  {li}
                </li>
              ))}
            </ul>
            <Button variant="primary" className="mt-7 w-full" asChild>
              <Link href="/signup">Go Premium</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative z-10 mx-auto max-w-[820px] px-6 py-24">
        <SectionTitle eyebrow="FAQ" title="Questions, answered" />
        <div className="space-y-3">
          {FAQ.map((f, i) => (
            <div key={f.q} className="overflow-hidden rounded-2xl border border-edge bg-surface">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="text-[14.5px] font-semibold text-ink">{f.q}</span>
                <ChevronDown className={cn("size-4 shrink-0 text-ink-faint transition-transform", openFaq === i && "rotate-180")} />
              </button>
              <motion.div
                initial={false}
                animate={{ height: openFaq === i ? "auto" : 0, opacity: openFaq === i ? 1 : 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <p className="px-5 pb-5 text-[13.5px] leading-relaxed text-ink-muted">{f.a}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-[1200px] px-6 pb-24">
        <div className="relative overflow-hidden rounded-[32px] border border-primary/25 bg-surface p-10 text-center sm:p-16">
          <h2 className="mx-auto max-w-2xl font-display text-[32px] font-bold leading-tight text-ink sm:text-[44px]">
            Your number is waiting. It's <span className="text-primary">brave</span> to look.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[15px] text-ink-muted">
            {BRAND.tagline} No credit card. No platforms required to explore.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button variant="primary" size="lg" asChild>
              <Link href="/app">Open the demo <ArrowRight className="size-4" /></Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/signup">Create an account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-edge py-12">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-6 px-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <Logo />
          </div>
          <div className="flex items-center gap-6 text-[12.5px] text-ink-faint">
            <span className="flex items-center gap-1.5"><Lock className="size-3.5" /> Payments secured</span>
            <a href="#" className="transition-colors hover:text-ink-soft">Privacy</a>
            <a href="#" className="transition-colors hover:text-ink-soft">Terms</a>
          </div>
          <p className="text-[12px] text-ink-faint">© {new Date().getFullYear()}. All numbers shamefully preserved.</p>
        </div>
      </footer>
    </div>
  );
}

function HeroMock() {
  const bars = [42, 58, 50, 74, 66, 88, 79, 96, 90, 100, 84, 71];
  return (
    <div className="relative overflow-hidden rounded-3xl border border-edge bg-surface/90 p-3 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:p-4">
      <div className="flex items-center gap-2 px-3 py-2">
        <span className="size-2.5 rounded-full bg-danger/70" />
        <span className="size-2.5 rounded-full bg-warning/70" />
        <span className="size-2.5 rounded-full bg-primary/70" />
        <span className="ml-3 rounded-lg bg-white/[0.05] px-3 py-1 text-[11px] text-ink-faint">sunk.app/app</span>
      </div>
      <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <div className="flex items-center justify-between rounded-2xl border border-edge bg-surface-raised px-4 py-3.5">
            <div>
              <p className="text-[11px] text-ink-faint">Lifetime spend</p>
              <p className="font-mono text-[22px] font-semibold text-ink tabular">{formatCurrency(2984.13)}</p>
            </div>
            <Badge variant="primary" className="flex items-center gap-1">
              <Zap className="size-3" /> -12% this month
            </Badge>
          </div>
          <div className="mt-3 rounded-2xl border border-edge bg-surface-raised p-4">
            <div className="flex items-end gap-1.5">
              {bars.map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${h}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04, duration: 0.5 }}
                  className="flex-1 rounded-t-sm bg-primary/70"
                  style={{ height: 0 }}
                />
              ))}
            </div>
            <p className="mt-2 text-[10.5px] text-ink-faint">Monthly spend · last 12 months</p>
          </div>
        </div>
        <div className="rounded-2xl border border-edge bg-surface-raised p-4">
          <p className="text-[11px] text-ink-faint">Budget</p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-mono text-[22px] font-semibold text-ink tabular">$268</span>
            <span className="text-[12px] text-ink-faint">/ $300</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "89%" }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="h-full rounded-full bg-primary shadow-[0_0_12px_rgba(57,255,106,0.5)]"
            />
          </div>
          <div className="mt-4 space-y-2">
            {[
              { icon: Trophy, label: "6-month budget streak", tone: "text-warning" },
              { icon: Users, label: "3 friends beating you", tone: "text-ink-faint" },
              { icon: Gauge, label: "$1.13 per hour", tone: "text-primary" },
            ].map((r) => (
              <div key={r.label} className="flex items-center gap-2 text-[11.5px]">
                <r.icon className={cn("size-3.5", r.tone)} />
                <span className="text-ink-soft">{r.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
