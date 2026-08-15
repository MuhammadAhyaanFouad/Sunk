"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Search, Archive, Filter, MoreVertical, Trash2, Pencil } from "lucide-react";
import { format, parseISO } from "date-fns";
import { formatCurrency, cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Tabs } from "@/components/ui/Tabs";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Dropdown } from "@/components/ui/Dropdown";
import { AddPurchaseDialog } from "@/features/vault/AddPurchaseDialog";
import { usePurchases, useDeletePurchase, usePlatforms } from "@/hooks/use-data";
import type { Purchase } from "@/types";
import { CATEGORY_META, PURCHASE_CATEGORIES, type PurchaseCategory } from "@/lib/constants";

type Filter = "all" | PurchaseCategory;

function groupByMonth(purchases: ReturnType<typeof usePurchases>["data"]) {
  const groups: { label: string; items: NonNullable<typeof purchases> }[] = [];
  for (const p of purchases ?? []) {
    const key = format(parseISO(p.purchasedAt), "MMMM yyyy");
    const last = groups[groups.length - 1];
    if (last && last.label === key) {
      last.items.push(p);
    } else {
      groups.push({ label: key, items: [p] });
    }
  }
  return groups;
}

export function VaultPage() {
  const { data: purchases, isLoading } = usePurchases();
  const { data: platforms } = usePlatforms();
  const deletePurchase = useDeletePurchase();

  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Purchase | null>(null);

  const filtered = useMemo(() => {
    let list = purchases ?? [];
    if (filter !== "all") list = list.filter((p) => p.category === filter);
    if (platform !== "all") list = list.filter((p) => p.platform === platform);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q));
    }
    return list;
  }, [purchases, filter, query, platform]);

  const totalFiltered = filtered.reduce((s, p) => s + p.amount, 0);
  const groups = useMemo(() => groupByMonth(filtered), [filtered]);

  const tabs = [
    { id: "all", label: "All", count: purchases?.length },
    ...PURCHASE_CATEGORIES.map((c) => ({ id: c, label: CATEGORY_META[c].label })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">Your Vault</h2>
          <p className="mt-0.5 text-[13px] text-ink-muted">
            Every purchase, DLC, skin and case opening — in one timeline.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} variant="primary" leftIcon={<Plus className="size-4" />}>
          Add purchase
        </Button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs tabs={tabs} active={filter} onChange={(id) => setFilter(id as Filter)} className="overflow-x-auto" />
        <div className="flex items-center gap-2.5">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search purchases…"
            leftIcon={<Search className="size-3.5" />}
            className="w-full lg:w-52"
            aria-label="Search purchases"
          />
          <Select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-40"
            aria-label="Filter by platform"
            options={[
              { value: "all", label: "All platforms" },
              ...(platforms ?? []).map((p) => ({ value: p.platform, label: p.platform })),
            ]}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 text-[13px] text-ink-faint">
        <Filter className="size-3.5" aria-hidden />
        <span>
          Showing <span className="font-medium text-ink-soft">{filtered.length}</span> purchases ·{" "}
          <span className="font-mono font-semibold text-ink tabular">{formatCurrency(totalFiltered)}</span>
        </span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          icon={<Archive className="size-6" />}
          title="Nothing in this view"
          description="Try a different filter, or add your first purchase to start the story."
          action={
            <Button onClick={() => setAddOpen(true)} variant="primary" leftIcon={<Plus className="size-4" />}>
              Add purchase
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          {groups.map((group) => {
            const monthTotal = group.items.reduce((s, p) => s + p.amount, 0);
            return (
              <div key={group.label}>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-ink-soft">
                    {group.label}
                  </h3>
                  <span className="font-mono text-[12px] text-ink-faint tabular">{formatCurrency(monthTotal)}</span>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <AnimatePresence mode="popLayout">
                    {group.items.map((p, i) => (
                      <motion.div
                        layout
                        key={p.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ delay: Math.min(i * 0.02, 0.15), duration: 0.3 }}
                      >
                        <Card className="group relative p-4 transition-all duration-200 hover:border-edge-strong">
                          <div className="flex items-start gap-3.5">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-edge bg-surface-raised">
                              {p.platform ? <PlatformIcon platform={p.platform} size="lg" /> : null}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className="truncate text-[14px] font-semibold text-ink">{p.title}</p>
                                <span
                                  className={cn(
                                    "shrink-0 font-mono text-[13px] font-semibold tabular",
                                    p.status === "refunded" ? "text-ink-faint line-through" : p.status === "pending" ? "text-warning" : "text-ink",
                                  )}
                                >
                                  {formatCurrency(p.amount)}
                                </span>
                              </div>
                              <p className="mt-0.5 text-[11.5px] text-ink-faint">
                                {p.platform} · {format(parseISO(p.purchasedAt), "MMM d")}
                              </p>
                              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                <Badge>{CATEGORY_META[p.category].label}</Badge>
                                {p.tags.slice(0, 2).map((t) => (
                                  <span key={t} className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[10.5px] text-ink-faint">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <Dropdown
                              trigger={(open) => (
                                <button
                                  onClick={open}
                                  aria-label={`Actions for ${p.title}`}
                                  className="rounded-lg p-1.5 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white/[0.06] hover:text-ink"
                                >
                                  <MoreVertical className="size-4" aria-hidden />
                                </button>
                              )}
                              items={[
                                {
                                  label: "Edit",
                                  icon: <Pencil className="size-3.5" />,
                                  onSelect: () => setEditing(p),
                                },
                                {
                                  label: "Delete",
                                  icon: <Trash2 className="size-3.5" />,
                                  danger: true,
                                  onSelect: () => deletePurchase.mutate(p.id),
                                },
                              ]}
                            />
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddPurchaseDialog open={addOpen} onClose={() => setAddOpen(false)} purchase={editing} onCloseEditing={() => setEditing(null)} />
    </div>
  );
}
