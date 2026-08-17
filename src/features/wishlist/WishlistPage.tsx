"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Plus, Trash2, Bell, BellOff } from "lucide-react";
import { format } from "date-fns";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { MarqueeText } from "@/components/ui/MarqueeText";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Stagger, FadeIn } from "@/components/motion/FadeIn";
import { useWishlist, useAddWishlistItem, useRemoveWishlistItem } from "@/hooks/use-data";
import { formatCurrency } from "@/lib/utils";

export function WishlistPage() {
  const { data: items, isLoading } = useWishlist();
  const add = useAddWishlistItem();
  const remove = useRemoveWishlistItem();
  const [title, setTitle] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await add.mutateAsync(title.trim());
    setTitle("");
  };

  return (
    <div className="space-y-6">
      <FadeIn direction="none" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">Wishlist</h2>
          <p className="mt-0.5 text-[13px] text-ink-muted">Games you're holding out for — or pretending to hold out for.</p>
        </div>
      </FadeIn>

      <FadeIn direction="none">
        <form onSubmit={submit} className="flex gap-2.5">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a game title… e.g. Hollow Knight: Silksong"
            className="flex-1"
          />
          <Button type="submit" variant="primary" leftIcon={<Plus className="size-4" />} loading={add.isPending}>
            Add
          </Button>
        </form>
      </FadeIn>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <Stagger className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items?.map((w) => {
            const current = w.price;
            const lowest = w.priceHistory.length ? Math.min(...w.priceHistory.map((p) => p.price)) : current;
            return (
              <motion.div key={w.id}>
                <Card className="group relative overflow-hidden p-0 transition-all duration-200 hover:-translate-y-0.5 hover:border-edge-strong">
                  <div className="relative aspect-[2/1.1] w-full overflow-hidden bg-surface-raised">
                    {w.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={w.coverUrl}
                        alt={`${w.title} cover art`}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/[0.05] to-transparent">
                        <Heart className="size-7 text-ink-faint/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-transparent" aria-hidden />
                    <button
                      onClick={() => remove.mutate(w.id)}
                      className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-lg bg-black/50 text-ink-faint opacity-0 backdrop-blur-sm transition-opacity hover:text-danger group-hover:opacity-100"
                      aria-label={`Remove ${w.title} from wishlist`}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                      <span className="flex items-center gap-1 rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-ink-soft backdrop-blur-sm">
                        {w.notified ? <Bell className="size-3" /> : <BellOff className="size-3" />}
                        {w.notified ? "Alert on" : "Alert off"}
                      </span>
                      {w.platform && <PlatformIcon platform={w.platform} size="sm" />}
                    </div>
                  </div>
                  <div className="p-3.5">
                    <MarqueeText className="text-[13.5px] font-semibold text-ink">{w.title}</MarqueeText>
                    <div className="mt-1 flex items-center justify-between">
                      <p className="font-mono text-[13px] font-semibold text-ink tabular">
                        {current != null ? formatCurrency(current) : "—"}
                      </p>
                      {lowest != null && current != null && lowest < current && (
                        <span className="text-[10.5px] text-primary">
                          {Math.round((1 - current / lowest) * 100)}% below highest
                        </span>
                      )}
                    </div>
                    {w.priceHistory.length > 1 && (
                      <div className="mt-2 flex h-8 items-end gap-[2px]">
                        {w.priceHistory.map((p, j) => {
                          const h = Math.min((p.price / (lowest || 1)) * 100, 100);
                          const isLast = j === w.priceHistory.length - 1;
                          return (
                            <div
                              key={p.date}
                              className={`flex-1 rounded-sm ${isLast ? "bg-primary/80" : "bg-white/[0.12]"}`}
                              style={{ height: `${Math.max(h * 0.55, 8)}%` }}
                              title={`${format(new Date(p.date), "MMM d")}: ${formatCurrency(p.price)}`}
                            />
                          );
                        })}
                      </div>
                    )}
                    <p className="mt-1.5 text-[10.5px] text-ink-faint">Added {format(new Date(w.addedAt), "MMM d")}</p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </Stagger>
      )}
    </div>
  );
}
