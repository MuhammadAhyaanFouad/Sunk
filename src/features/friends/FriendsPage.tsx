"use client";

import { useState } from "react";
import { Users, UserPlus, Trophy, Check, Clock, Flame } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Stagger, FadeIn } from "@/components/motion/FadeIn";
import { useFriends, useGroups } from "@/hooks/use-data";
import { formatCurrency, cn } from "@/lib/utils";

const STATUS_META = {
  online: { label: "Online", dot: "bg-primary" },
  idle: { label: "Idle", dot: "bg-warning" },
  offline: { label: "Offline", dot: "bg-ink-faint" },
} as const;

export function FriendsPage() {
  const { data: friends, isLoading } = useFriends();
  const { data: groups } = useGroups();
  const [query, setQuery] = useState("");

  const sorted = [...(friends ?? [])].sort((a, b) => {
    if (a.isFriend && !b.isFriend) return -1;
    if (!a.isFriend && b.isFriend) return 1;
    if (a.pending && !b.pending) return -1;
    if (!a.pending && b.pending) return 1;
    return a.displayName.localeCompare(b.displayName);
  });

  const filtered = sorted.filter(
    (f) =>
      f.displayName.toLowerCase().includes(query.toLowerCase()) ||
      f.username.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <FadeIn direction="none" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">Friends</h2>
          <p className="mt-0.5 text-[13px] text-ink-muted">
            Keep tabs on who's grinding — and who's funding the grind.
          </p>
        </div>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search friends…"
          className="w-full sm:w-64"
        />
      </FadeIn>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-3">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <Stagger className="grid grid-cols-1 gap-3">
              {filtered.map((f) => {
                const status = STATUS_META[f.status];
                return (
                  <Card key={f.id} className="flex items-center gap-4 p-4">
                    <div className="relative shrink-0">
                      <Avatar name={f.displayName} src={f.avatarUrl} size="md" />
                      <span className={cn("absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-surface", status.dot)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-[14px] font-semibold text-ink">{f.displayName}</p>
                        <span className="text-[11px] text-ink-faint">@{f.username}</span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-3 text-[12px] text-ink-muted">
                        <span className="flex items-center gap-1"><Trophy className="size-3" /> Lv {f.level}</span>
                        <span>Spent {formatCurrency(f.lifetimeSpend)}</span>
                        <span>{f.monthlySpend > 0 ? `${formatCurrency(f.monthlySpend)} this month` : "no spend this month"}</span>
                      </div>
                      {f.lastActiveAt && f.status === "offline" && (
                        <p className="mt-0.5 text-[11px] text-ink-faint">
                          Last active {formatDistanceToNow(new Date(f.lastActiveAt), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                    {f.isFriend ? (
                      <Badge variant="neutral" className="shrink-0">
                        <span className="flex items-center gap-1"><Check className="size-3" /> Friends</span>
                      </Badge>
                    ) : f.pending ? (
                      <Badge variant="warning" className="shrink-0">
                        <span className="flex items-center gap-1"><Clock className="size-3" /> Pending</span>
                      </Badge>
                    ) : (
                      <Button variant="outline" size="sm" leftIcon={<UserPlus className="size-3.5" />} className="shrink-0">
                        Add
                      </Button>
                    )}
                  </Card>
                );
              })}
              {filtered.length === 0 && (
                <Card className="p-10 text-center">
                  <Users className="mx-auto mb-3 size-7 text-ink-faint" aria-hidden />
                  <p className="font-display text-[15px] font-semibold text-ink">No friends here</p>
                  <p className="mt-1 text-[13px] text-ink-muted">The leaderboard is lonely without rivals.</p>
                </Card>
              )}
            </Stagger>
          )}
        </div>

        <div>
          <h3 className="mb-3 flex items-center gap-2 font-display text-[14px] font-semibold text-ink">
            <Users className="size-4 text-ink-faint" /> Groups
          </h3>
          <Stagger className="grid grid-cols-1 gap-3">
            {groups?.map((g) => (
              <Card key={g.id} className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-[16px]">
                    {g.avatarUrl ? <PlatformIcon platform={g.avatarUrl as never} size="md" /> : "👥"}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-semibold text-ink">{g.name}</p>
                    <p className="text-[11.5px] text-ink-faint">{g.memberCount} members</p>
                  </div>
                </div>
                {g.monthlyChallenge && (
                  <div className="mt-3 rounded-lg border border-edge bg-surface-raised px-3 py-2.5">
                    <p className="flex items-center gap-1.5 text-[11.5px] font-medium text-ink-soft">
                      <Flame className="size-3.5 text-warning" /> {g.monthlyChallenge.title}
                    </p>
                    <p className="mt-1 text-[11px] text-ink-muted tabular">
                      {formatCurrency(g.monthlyChallenge.spend)} · {g.monthlyChallenge.progress}% of members in
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </Stagger>
        </div>
      </div>
    </div>
  );
}
