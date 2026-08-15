"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  Archive,
  RefreshCw,
  Gamepad2,
  Target,
  Wallet,
  Sparkles,
  Trophy,
  Heart,
  Users,
  BarChart3,
  Gift,
  Settings,
  X,
  Command,
  ChevronRight,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";
import { Avatar } from "@/components/ui/Avatar";
import { Progress } from "@/components/ui/Progress";
import { useApp } from "@/context/app-context";
import { Skeleton } from "@/components/ui/Skeleton";
import { SearchKeycap } from "@/components/ui/Keycap";

const NAV_SECTIONS: { label: string; items: { label: string; href: string; icon: typeof LayoutDashboard }[] }[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/app", icon: LayoutDashboard }],
  },
  {
    label: "Track",
    items: [
      { label: "Vault", href: "/app/vault", icon: Archive },
      { label: "Subscriptions", href: "/app/subscriptions", icon: RefreshCw },
      { label: "Library", href: "/app/library", icon: Gamepad2 },
    ],
  },
  {
    label: "Plan",
    items: [
      { label: "Goals", href: "/app/goals", icon: Target },
      { label: "Budget", href: "/app/budget", icon: Wallet },
    ],
  },
  {
    label: "Discover",
    items: [
      { label: "Insights", href: "/app/insights", icon: Sparkles },
      { label: "Achievements", href: "/app/achievements", icon: Trophy },
      { label: "Wishlist", href: "/app/wishlist", icon: Heart },
    ],
  },
  {
    label: "Social",
    items: [
      { label: "Friends", href: "/app/friends", icon: Users },
      { label: "Leaderboards", href: "/app/leaderboards", icon: BarChart3 },
    ],
  },
];

function NavItem({
  item,
  active,
  onNavigate,
}: {
  item: { label: string; href: string; icon: typeof LayoutDashboard };
  active: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={item.label}
      aria-current={active ? "page" : undefined}
      style={active ? { borderColor: "#2A5A3B" } : undefined}
      className={cn(
        "group relative flex items-center gap-2 rounded-[9px] border border-transparent px-3 py-2 text-[13.5px] font-medium transition-all duration-200 ease-out lg:justify-center lg:gap-0 lg:group-hover/side:justify-start lg:group-hover/side:gap-[11px]",
        active ? "bg-primary-soft text-ink" : "text-ink-faint hover:bg-surface-raised hover:text-ink-soft",
      )}
    >
      <Icon
        className={cn("size-4.5 shrink-0 transition-colors", active ? "text-primary" : "text-ink-faint group-hover:text-ink-soft")}
        aria-hidden
      />
      <span className="whitespace-nowrap lg:max-w-0 lg:overflow-hidden lg:opacity-0 lg:transition-[max-width,opacity] lg:duration-200 lg:ease-out lg:group-hover/side:max-w-[160px] lg:group-hover/side:opacity-100">
        {item.label}
      </span>
      {active && (
        <span
          className="ml-auto size-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_8px_rgba(57,255,106,0.8)] lg:absolute lg:right-3 lg:top-1/2 lg:ml-0 lg:-translate-y-1/2 lg:opacity-0 lg:transition-opacity lg:duration-200 lg:ease-out lg:group-hover/side:opacity-100"
          aria-hidden
        />
      )}
    </Link>
  );
}

export function Sidebar({
  open,
  onClose,
  onSearch,
}: {
  open: boolean;
  onClose: () => void;
  onSearch?: () => void;
}) {
  const pathname = usePathname();
  const { profile, loading, isDemo, prefs } = useApp();

  const body = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 pb-2 pt-6 lg:hidden">
        <Link href="/" className="flex items-center gap-2.5" onClick={onClose} aria-label="Sunk home">
          <Logo />
        </Link>
        <button
          onClick={onClose}
          aria-label="Close navigation"
          className="rounded-lg p-1.5 text-ink-faint hover:bg-white/[0.06] hover:text-ink lg:hidden"
        >
          <X className="size-4" />
        </button>
      </div>

      <button
        onClick={() => {
          onClose();
          onSearch?.();
        }}
        title="Quick search"
        aria-label="Quick search"
        className="mx-4 mt-4 mb-2 relative flex items-center gap-2 rounded-xl border border-edge bg-surface-raised px-3.5 py-2.5 text-[13px] font-medium text-ink-faint transition-all hover:border-edge-strong hover:text-ink-soft lg:mx-2 lg:mb-1 lg:justify-center lg:gap-0 lg:px-3.5 lg:group-hover/side:mx-4 lg:group-hover/side:mb-2 lg:group-hover/side:justify-start lg:group-hover/side:gap-2"
      >
        <Command className="size-3.5 shrink-0" aria-hidden />
        <span className="whitespace-nowrap lg:max-w-0 lg:overflow-hidden lg:opacity-0 lg:transition-[max-width,opacity] lg:duration-200 lg:ease-out lg:group-hover/side:max-w-[160px] lg:group-hover/side:opacity-100">
          Quick search
        </span>
        <kbd className="ml-auto shrink-0 rounded-md border border-edge bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-ink-faint lg:absolute lg:right-3 lg:top-1/2 lg:ml-0 lg:-translate-y-1/2 lg:opacity-0 lg:transition-opacity lg:duration-200 lg:ease-out lg:group-hover/side:opacity-100">
          <SearchKeycap />
        </kbd>
      </button>

      <nav className="flex-1 space-y-5 overflow-y-auto px-4 pb-6 pt-2 lg:px-0 lg:group-hover/side:px-3" aria-label="Primary">
        {NAV_SECTIONS.map((section) => {
          const items = section.items.filter((item) => !(item.href === "/app/leaderboards" && !prefs.leaderboards));
          if (items.length === 0) return null;
          return (
            <div key={section.label}>
              <p className="mb-1.5 px-3 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-faint/70 lg:mb-0 lg:max-h-0 lg:overflow-hidden lg:opacity-0 lg:transition-all lg:duration-200 lg:ease-out lg:group-hover/side:mb-1.5 lg:group-hover/side:max-h-4 lg:group-hover/side:opacity-100">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {items.map((item) => (
                  <NavItem key={item.href} item={item} active={pathname === item.href} onNavigate={onClose} />
                ))}
              </div>
            </div>
          );
        })}

        <div className="space-y-0.5">
          <Link
            href="/app/wrapped"
            onClick={onClose}
            title="Wrapped"
            style={pathname === "/app/wrapped" ? { borderColor: "#2A5A3B" } : undefined}
            className={cn(
              "group relative flex items-center gap-2 rounded-[9px] border border-transparent px-3 py-2 text-[13.5px] font-medium transition-all duration-200 ease-out lg:justify-center lg:gap-0 lg:group-hover/side:justify-start lg:group-hover/side:gap-2",
              pathname === "/app/wrapped" ? "bg-primary-soft text-ink" : "text-ink-faint hover:bg-white/[0.04] hover:text-ink-soft",
            )}
          >
            <span className="relative shrink-0">
              <Gift className={cn("size-4.5", pathname === "/app/wrapped" ? "text-primary" : "text-ink-faint")} aria-hidden />
              <motion.span
                className="absolute -right-1 -top-1 size-2 rounded-full bg-violet shadow-[0_0_8px_rgba(167,139,250,0.9)]"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2.4 }}
                aria-hidden
              />
            </span>
            <span className="whitespace-nowrap lg:max-w-0 lg:overflow-hidden lg:opacity-0 lg:transition-[max-width,opacity] lg:duration-200 lg:ease-out lg:group-hover/side:max-w-[160px] lg:group-hover/side:opacity-100">
              Wrapped
            </span>
            <span className="ml-auto shrink-0 rounded-full bg-violet/15 px-2 py-0.5 text-[10px] font-semibold text-violet lg:absolute lg:right-3 lg:top-1/2 lg:ml-0 lg:-translate-y-1/2 lg:opacity-0 lg:transition-opacity lg:duration-200 lg:ease-out lg:group-hover/side:opacity-100">
              2025
            </span>
          </Link>
        </div>

        <Link
          href="/app/settings"
          onClick={onClose}
          title="Settings"
          style={pathname.startsWith("/app/settings") ? { borderColor: "#2A5A3B" } : undefined}
          className={cn(
            "flex items-center gap-2 rounded-[9px] border border-transparent px-3 py-2 text-[13.5px] font-medium transition-all duration-200 ease-out lg:justify-center lg:gap-0 lg:group-hover/side:justify-start lg:group-hover/side:gap-2",
            pathname.startsWith("/app/settings") ? "bg-primary-soft text-ink" : "text-ink-faint hover:bg-white/[0.04] hover:text-ink-soft",
          )}
        >
          <Settings className={cn("size-4.5 shrink-0", pathname.startsWith("/app/settings") ? "text-primary" : "text-ink-faint")} aria-hidden />
          <span className="whitespace-nowrap lg:max-w-0 lg:overflow-hidden lg:opacity-0 lg:transition-[max-width,opacity] lg:duration-200 lg:ease-out lg:group-hover/side:max-w-[160px] lg:group-hover/side:opacity-100">
            Settings
          </span>
        </Link>
      </nav>

      <div className="border-t border-white/[0.06] p-4">
        {isDemo && (
          <div className="mb-3 flex items-center justify-between rounded-lg border border-dashed border-edge px-3 py-2 text-[11px] text-ink-faint lg:hidden lg:group-hover/side:flex">
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-warning animate-pulse" aria-hidden />
              Demo mode
            </span>
            <span>Seeded data</span>
          </div>
        )}
        <Link href="/app/profile" onClick={onClose} title="Profile" className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-white/[0.04] lg:justify-center lg:px-0 lg:group-hover/side:justify-start lg:group-hover/side:px-2">
          {loading || !profile ? (
            <Skeleton className="size-9 rounded-full" />
          ) : (
            <Avatar src={profile.avatarUrl} name={profile.displayName} size="md" />
          )}
          <div className="min-w-0 flex-1 lg:hidden lg:group-hover/side:block">
            <p className="truncate text-[13px] font-semibold text-ink">{profile?.displayName ?? "…"}</p>
            <p className="flex items-center gap-1 text-[11px] text-ink-faint">
              Lv {profile?.level ?? "…"}
              <span aria-hidden>·</span>
              {profile?.xp?.toLocaleString() ?? ""} XP
            </p>
          </div>
          {profile?.plan === "premium" ? (
            <Crown className="size-4 text-warning lg:hidden lg:group-hover/side:block" aria-label="Premium" />
          ) : (
            <ChevronRight className="size-4 text-ink-faint lg:hidden lg:group-hover/side:block" aria-hidden />
          )}
        </Link>
        {profile && (
          <div className="mt-1 px-2 lg:hidden lg:group-hover/side:block">
            <Progress value={profile.xp % profile.xpToNextLevel} max={profile.xpToNextLevel} className="h-1" />
            <p className="mt-1 text-[10px] text-ink-faint tabular">
              {profile.xpToNextLevel - (profile.xp % profile.xpToNextLevel)} XP to level {profile.level + 1}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed bottom-0 left-0 top-16 z-30 hidden w-[68px] border-r border-white/[0.06] bg-sidebar transition-[width] duration-200 ease-out group/side lg:block lg:hover:w-[264px]">
        {body}
      </aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={onClose}
              aria-hidden
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] border-r border-white/[0.06] bg-sidebar lg:hidden"
            >
              {body}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
