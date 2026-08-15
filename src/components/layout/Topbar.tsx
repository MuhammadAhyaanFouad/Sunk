"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Bell, Menu, Plus, Search, Upload, MessageSquare, Zap, Flame } from "lucide-react";
import { useNotifications, useMarkNotificationsRead, useBudget } from "@/hooks/use-data";
import { timeAgo } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { SearchKeycap } from "@/components/ui/Keycap";
import { Logo } from "@/components/ui/Logo";
import { AddPurchaseDialog } from "@/features/vault/AddPurchaseDialog";
import { useClickOutside } from "@/hooks/use-click-outside";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/app-context";

const ICONS: Record<string, typeof Bell> = {
  renewal: Bell,
  achievement: Bell,
  friend: Bell,
  insight: Bell,
  goal: Bell,
  system: Bell,
};

function NotificationsMenu() {
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationsRead();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);

  const unread = notifications?.filter((n) => !n.read).length ?? 0;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => {
          setOpen((v) => !v);
          if (!open && notifications?.some((n) => !n.read)) markRead.mutate(undefined);
        }}
        aria-label={`Notifications (${unread} unread)`}
        className="relative flex h-9 w-9 items-center justify-center rounded-[9px] border border-edge bg-surface text-ink-soft transition-all hover:border-edge-strong hover:text-ink"
      >
        <Bell className="size-4" aria-hidden />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 size-[7px] rounded-full bg-danger border-[1.5px] border-surface" aria-hidden />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 z-40 mt-2 w-[340px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-edge bg-[#141414] shadow-[0_24px_64px_-12px_rgba(0,0,0,0.75)]"
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
              <p className="text-[13px] font-semibold text-ink">Notifications</p>
              <Link href="/app/notifications" onClick={() => setOpen(false)} className="text-[12px] font-medium text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="max-h-[380px] overflow-y-auto">
              {isLoading ? (
                <div className="space-y-3 p-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-14" />
                  ))}
                </div>
              ) : notifications && notifications.length > 0 ? (
                notifications.slice(0, 6).map((n) => {
                  const Icon = ICONS[n.kind] ?? Bell;
                  return (
                    <button
                      key={n.id}
                      onClick={() => {
                        if (!n.read) markRead.mutate([n.id]);
                        if (n.actionHref) window.location.href = n.actionHref;
                        setOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.03]",
                        !n.read && "bg-primary/[0.03]",
                      )}
                    >
                      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-ink-faint">
                        <Icon className="size-3.5" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-medium leading-snug text-ink">{n.title}</span>
                        <span className="mt-0.5 line-clamp-2 block text-[12px] leading-snug text-ink-muted">{n.body}</span>
                        <span className="mt-1 block text-[11px] text-ink-faint">{timeAgo(n.createdAt)}</span>
                      </span>
                      {!n.read && <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />}
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-10 text-center">
                  <Bell className="mx-auto mb-2 size-6 text-ink-faint" aria-hidden />
                  <p className="text-[13px] text-ink-muted">You're all caught up.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TopbarButton({
  label,
  onClick,
  primary,
  icon,
}: {
  label: string;
  onClick: () => void;
  primary?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex h-9 items-center gap-1.5 rounded-[9px] border px-3 text-[13px] font-semibold transition-all",
        primary
          ? "border-transparent bg-primary text-primary-foreground hover:opacity-90"
          : "border-edge bg-surface text-ink hover:border-edge-strong",
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export function Topbar({ onMenuOpen, onSearchOpen }: { onMenuOpen: () => void; onSearchOpen: () => void }) {
  const pathname = usePathname();
  const { data: budget } = useBudget();
  const { profile, loading, prefs } = useApp();
  const [logOpen, setLogOpen] = useState(false);

  const title = useMemo(() => {
    const map: Record<string, string> = {
      "/app": "Dashboard",
      "/app/vault": "Vault",
      "/app/subscriptions": "Subscriptions",
      "/app/library": "Library",
      "/app/goals": "Goals",
      "/app/budget": "Budget",
      "/app/insights": "Insights",
      "/app/achievements": "Achievements",
      "/app/profile": "Profile",
      "/app/friends": "Friends",
      "/app/leaderboards": "Leaderboards",
      "/app/wishlist": "Wishlist",
      "/app/wrapped": "Wrapped",
      "/app/notifications": "Notifications",
      "/app/settings": "Settings",
      "/app/roast": "Roast Mode",
    };
    return map[pathname] ?? "Dashboard";
  }, [pathname]);

  const streak = budget?.streak ?? 0;

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-edge bg-background/85 px-4 backdrop-blur-xl sm:px-6">
      <Link href="/" className="hidden shrink-0 items-center lg:flex" aria-label="Sunk home">
        <Logo size="sm" />
      </Link>
      <button
        onClick={onMenuOpen}
        aria-label="Open navigation"
        className="flex size-9 items-center justify-center rounded-xl border border-edge bg-surface text-ink-soft lg:hidden"
      >
        <Menu className="size-4" aria-hidden />
      </button>

      <span className="truncate text-[15px] font-semibold text-ink md:hidden">{title}</span>

      <button
        onClick={onSearchOpen}
        className="hidden h-9 min-w-0 flex-1 items-center gap-2 rounded-[9px] border border-edge bg-surface px-3.5 text-[13px] text-ink-faint transition-all hover:border-edge-strong hover:text-ink-soft md:flex md:max-w-[320px]"
      >
        <Search className="size-3.5 shrink-0" aria-hidden />
        <span className="truncate">Search purchases, games, platforms...</span>
        <kbd className="ml-auto rounded border border-edge bg-[#1B1B1B] px-1.5 py-0.5 font-mono text-[10px] text-ink-faint"><SearchKeycap /></kbd>
      </button>
      <button
        onClick={onSearchOpen}
        aria-label="Open search"
        className="flex size-9 items-center justify-center rounded-xl border border-edge bg-surface text-ink-faint md:hidden"
      >
        <Search className="size-4" aria-hidden />
      </button>

      <div className="ml-auto flex items-center gap-2.5">
        <TopbarButton label="Log Purchase" primary onClick={() => setLogOpen(true)} icon={<Plus className="size-3.5" aria-hidden />} />
        <TopbarButton label="Import" onClick={() => toast("Import", { description: "Go to Vault to import your purchases." })} icon={<Upload className="size-3.5" aria-hidden />} />
        <Link href="/app/insights" className="hidden xl:flex">
          <TopbarButton label="Ask Sunk" onClick={() => {}} icon={<MessageSquare className="size-3.5" aria-hidden />} />
        </Link>
        <div
          title="Budget streak"
          className="flex h-9 items-center gap-1.5 rounded-full border border-edge bg-surface px-3 font-mono text-[12.5px] font-semibold text-ink"
        >
          <Flame className="size-3.5 text-warning" aria-hidden />
          {loading ? <Skeleton className="h-3.5 w-6" /> : <span>{streak}d</span>}
        </div>
        {prefs.roast && (
          <Link href="/app/roast">
            <TopbarButton label="Roast" onClick={() => {}} icon={<Zap className="size-3.5" aria-hidden />} />
          </Link>
        )}
        <NotificationsMenu />
        <Link href="/app/profile" className="flex items-center gap-2.5 rounded-lg p-1 transition-colors hover:bg-white/[0.04]">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary text-[12px] font-bold text-primary-foreground">
            {profile?.displayName?.charAt(0)?.toUpperCase() ?? "Y"}
          </span>
          <span className="hidden lg:block">
            <span className="block text-[12.5px] font-semibold leading-tight text-ink">{profile?.displayName ?? "You"}</span>
            <span className="block font-mono text-[10px] leading-tight text-ink-faint">Lvl {profile?.level ?? 1}</span>
          </span>
        </Link>
      </div>

      <AddPurchaseDialog open={logOpen} onClose={() => setLogOpen(false)} purchase={null} onCloseEditing={() => {}} />
    </header>
  );
}
