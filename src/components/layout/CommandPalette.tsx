"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  CornerDownLeft,
  Archive,
  Gamepad2,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Wallet,
  Target,
  Trophy,
  Users,
  Gift,
  Heart,
} from "lucide-react";
import { useSearch } from "@/hooks/use-data";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

const QUICK_ACTIONS: { label: string; href: string; icon: typeof Archive }[] = [
  { label: "Go to Vault", href: "/app/vault", icon: Archive },
  { label: "Go to Subscriptions", href: "/app/subscriptions", icon: RefreshCw },
  { label: "Go to Library", href: "/app/library", icon: Gamepad2 },
  { label: "Go to Budget", href: "/app/budget", icon: Wallet },
  { label: "Go to Goals", href: "/app/goals", icon: Target },
  { label: "Go to Achievements", href: "/app/achievements", icon: Trophy },
  { label: "Go to Friends", href: "/app/friends", icon: Users },
  { label: "Go to Wrapped", href: "/app/wrapped", icon: Gift },
  { label: "Go to Wishlist", href: "/app/wishlist", icon: Heart },
];

const TYPE_ICONS: Record<string, typeof Archive> = {
  purchase: Archive,
  game: Gamepad2,
  subscription: RefreshCw,
  achievement: Trophy,
  friend: Users,
  action: Sparkles,
};

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { data: results, isFetching } = useSearch(query);
  const debouncedResults = useMemo(() => results ?? [], [results]);

  const combined = useMemo(() => {
    const actionItems = QUICK_ACTIONS.map((a) => ({ type: "action", id: a.label, title: a.label, subtitle: a.href, href: a.href, coverUrl: null, amount: undefined }));
    return query.trim() ? debouncedResults : actionItems;
  }, [debouncedResults, query]);

  useEffect(() => {
    if (!open) return;
    const t = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setIndex((i) => Math.min(i + 1, combined.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && combined[index]) {
        onClose();
        router.push(combined[index].href);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, combined, index, onClose, router]);

  useEffect(() => {
    listRef.current?.children[index]?.scrollIntoView({ block: "nearest" });
  }, [index]);

  const navigate = useCallback(
    (href: string) => {
      onClose();
      router.push(href);
    },
    [onClose, router],
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[70] flex items-start justify-center bg-black/70 px-4 pt-[12vh] backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -8 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-edge bg-[#141414] shadow-[0_32px_96px_-16px_rgba(0,0,0,0.9)]"
          >
            <div className="flex items-center gap-3 border-b border-white/[0.06] px-4">
              <Search className="size-4 text-ink-faint" aria-hidden />
              <input
                ref={inputRef}
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIndex(0);
                }}
                placeholder="Search purchases, games, subscriptions…"
                className="h-13 w-full flex-1 bg-transparent py-3.5 text-[15px] text-ink placeholder:text-ink-faint focus:outline-none"
                aria-label="Search"
              />
              {isFetching && query.trim() ? (
                <span className="size-4 animate-spin rounded-full border-2 border-edge border-t-primary" aria-label="Searching" />
              ) : (
                <kbd className="rounded border border-edge bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10px] text-ink-faint">esc</kbd>
              )}
            </div>

            <div ref={listRef} className="max-h-[360px] overflow-y-auto p-2">
              {combined.length === 0 ? (
                <p className="px-4 py-8 text-center text-[13px] text-ink-faint">
                  {query.trim() ? "No results found." : "Type to search your entire Sunk vault."}
                </p>
              ) : (
                combined.map((item, i) => {
                  const Icon = TYPE_ICONS[item.type] ?? Search;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(item.href)}
                      onMouseEnter={() => setIndex(i)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                        i === index ? "bg-white/[0.06]" : "hover:bg-white/[0.03]",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-lg",
                          i === index ? "bg-primary/15 text-primary" : "bg-white/[0.05] text-ink-faint",
                        )}
                      >
                        <Icon className="size-4" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-medium text-ink">{item.title}</span>
                        <span className="block truncate text-[12px] text-ink-faint">{item.subtitle}</span>
                      </span>
                      {item.amount !== undefined && (
                        <span className="font-mono text-[12.5px] font-semibold text-ink tabular">{formatCurrency(item.amount)}</span>
                      )}
                      {i === index && <ArrowRight className="size-3.5 text-primary" aria-hidden />}
                    </button>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-2 text-[11px] text-ink-faint">
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-edge px-1 font-mono">↑</kbd>
                  <kbd className="rounded border border-edge px-1 font-mono">↓</kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <CornerDownLeft className="size-3" aria-hidden />
                  select
                </span>
              </span>
              <span>Sunk · Know Your Number</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
