"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Bell, BellRing, Trophy, Users, Lightbulb, Repeat, Target, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Stagger, FadeIn } from "@/components/motion/FadeIn";
import { useNotifications, useMarkNotificationsRead } from "@/hooks/use-data";
import { cn } from "@/lib/utils";

const KIND_ICON = {
  renewal: { icon: Repeat, cls: "bg-warning/10 text-warning" },
  achievement: { icon: Trophy, cls: "bg-primary/10 text-primary" },
  friend: { icon: Users, cls: "bg-violet/10 text-violet" },
  insight: { icon: Lightbulb, cls: "bg-cyan/10 text-cyan" },
  goal: { icon: Target, cls: "bg-white/[0.05] text-ink-faint" },
  system: { icon: Bell, cls: "bg-white/[0.05] text-ink-faint" },
} as const;

export function NotificationsPage() {
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationsRead();

  const unread = useMemo(() => notifications?.filter((n) => !n.read).length ?? 0, [notifications]);
  const sorted = useMemo(
    () => [...(notifications ?? [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [notifications]
  );

  return (
    <div className="space-y-6">
      <FadeIn direction="none" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">Notifications</h2>
          <p className="mt-0.5 text-[13px] text-ink-muted">
            {unread > 0 ? `${unread} unread — something's waiting.` : "All caught up."}
          </p>
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" leftIcon={<CheckCheck className="size-3.5" />} onClick={() => markRead.mutate(undefined)}>
            Mark all read
          </Button>
        )}
      </FadeIn>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <Stagger className="space-y-2.5">
          {sorted.map((n) => {
            const meta = KIND_ICON[n.kind] ?? KIND_ICON.system;
            return (
              <motion.div key={n.id}>
                <Card
                  className={cn(
                    "flex items-start gap-4 p-4 transition-colors hover:border-edge-strong",
                    !n.read && "border-primary/30 bg-primary/[0.03]"
                  )}
                >
                  <span className={cn("mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl", meta.cls)}>
                    <meta.icon className="size-4.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[14px] font-semibold text-ink">{n.title}</p>
                      {!n.read && <span className="size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
                    </div>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-ink-soft">{n.body}</p>
                    <p className="mt-1.5 text-[11px] text-ink-faint">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {n.actionHref && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0"
                      onClick={() => {
                        markRead.mutate([n.id]);
                        window.location.href = n.actionHref!;
                      }}
                    >
                      View
                    </Button>
                  )}
                </Card>
              </motion.div>
            );
          })}
          {sorted.length === 0 && (
            <Card className="p-10 text-center">
              <BellRing className="mx-auto mb-3 size-7 text-ink-faint" aria-hidden />
              <p className="font-display text-[15px] font-semibold text-ink">Nothing here</p>
              <p className="mt-1 text-[13px] text-ink-muted">Renewals, achievements, and friend activity will land here.</p>
            </Card>
          )}
        </Stagger>
      )}
    </div>
  );
}
