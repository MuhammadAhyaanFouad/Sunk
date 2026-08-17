"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Gamepad2, Clock, Wallet, Star } from "lucide-react";
import { formatCurrency, initials } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { MarqueeText } from "@/components/ui/MarqueeText";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { FadeIn } from "@/components/motion/FadeIn";
import { useGames } from "@/hooks/use-data";
import { cn } from "@/lib/utils";

type Sort = "playtime" | "spend" | "title" | "cph" | "recent";

export function LibraryPage() {
  const { data: games, isLoading } = useGames();
  const [sort, setSort] = useState<Sort>("playtime");
  const [platform, setPlatform] = useState("all");

  const sorted = useMemo(() => {
    let list = games ?? [];
    if (platform !== "all") list = list.filter((g) => g.platforms.includes(platform as never));
    const arr = [...list];
    switch (sort) {
      case "playtime":
        arr.sort((a, b) => b.playtimeHours - a.playtimeHours);
        break;
      case "spend":
        arr.sort((a, b) => b.totalSpend - a.totalSpend);
        break;
      case "cph": {
        arr.sort((a, b) => {
          const aCph = a.playtimeHours > 0 ? a.totalSpend / a.playtimeHours : Infinity;
          const bCph = b.playtimeHours > 0 ? b.totalSpend / b.playtimeHours : Infinity;
          return aCph - bCph;
        });
        break;
      }
      case "recent":
        arr.sort((a, b) => new Date(b.lastPlayedAt ?? 0).getTime() - new Date(a.lastPlayedAt ?? 0).getTime());
        break;
      default:
        arr.sort((a, b) => a.title.localeCompare(b.title));
    }
    return arr;
  }, [games, sort, platform]);

  const totalHours = sorted.reduce((s, g) => s + g.playtimeHours, 0);
  const totalSpend = sorted.reduce((s, g) => s + g.totalSpend, 0);

  return (
    <div className="space-y-6">
      <FadeIn direction="none" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">Library</h2>
          <p className="mt-0.5 text-[13px] text-ink-muted">The games you own, and the hours you put into them.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="w-40"
            aria-label="Sort library"
            options={[
              { value: "playtime", label: "Most played" },
              { value: "spend", label: "Most spent" },
              { value: "cph", label: "Best value" },
              { value: "recent", label: "Recently played" },
              { value: "title", label: "A–Z" },
            ]}
          />
          <Select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-40"
            aria-label="Filter by platform"
            options={[
              { value: "all", label: "All platforms" },
              { value: "steam", label: "Steam" },
              { value: "roblox", label: "Roblox" },
              { value: "xbox", label: "Xbox" },
              { value: "playstation", label: "PlayStation" },
              { value: "epic", label: "Epic Games" },
              { value: "battlenet", label: "Battle.net" },
            ]}
          />
        </div>
      </FadeIn>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="flex items-center gap-1.5 text-[12px] text-ink-muted"><Gamepad2 className="size-3.5" /> Games</p>
          <p className="mt-1.5 font-mono text-xl font-semibold text-ink tabular"><AnimatedNumber value={sorted.length} format="number" /></p>
        </Card>
        <Card className="p-4">
          <p className="flex items-center gap-1.5 text-[12px] text-ink-muted"><Clock className="size-3.5" /> Hours</p>
          <p className="mt-1.5 font-mono text-xl font-semibold text-ink tabular"><AnimatedNumber value={totalHours} format="hours" /></p>
        </Card>
        <Card className="p-4">
          <p className="flex items-center gap-1.5 text-[12px] text-ink-muted"><Wallet className="size-3.5" /> Spent</p>
          <p className="mt-1.5 font-mono text-xl font-semibold text-ink tabular"><AnimatedNumber value={totalSpend} /></p>
        </Card>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {sorted.map((g, i) => {
            const cph = g.playtimeHours > 0 ? g.totalSpend / g.playtimeHours : null;
            return (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.4 }}
              >
                <Card className="group overflow-hidden p-0 transition-all duration-200 hover:-translate-y-0.5 hover:border-edge-strong">
                  <div className="relative aspect-[2/1.1] w-full overflow-hidden bg-surface-raised">
                    {g.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={g.coverUrl}
                        alt={`${g.title} cover art`}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/[0.05] to-transparent">
                        <span className="font-display text-3xl font-bold text-ink-faint/40">{initials(g.title)}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-transparent" aria-hidden />
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                      <div className="flex gap-1">
                        {g.platforms.slice(0, 3).map((p) => <PlatformIcon key={p} platform={p} size="sm" />)}
                      </div>
                      {g.rating && (
                        <span className="flex items-center gap-0.5 rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] font-semibold text-warning backdrop-blur-sm">
                          <Star className="size-2.5 fill-current" /> {g.rating}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-3.5">
                    <MarqueeText className="text-[13.5px] font-semibold text-ink">{g.title}</MarqueeText>
                    <p className="mt-0.5 text-[11.5px] text-ink-faint">
                      {g.playtimeHours}h played · {formatCurrency(g.totalSpend)}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <Badge variant={cph !== null && cph < 1 ? "primary" : "neutral"}>
                        {cph !== null ? `${cph.toFixed(2)}/hr` : "no playtime"}
                      </Badge>
                      <span className={cn("text-[11px] text-ink-faint")}>
                        {g.lastPlayedAt ? "played recently" : "unplayed"}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
