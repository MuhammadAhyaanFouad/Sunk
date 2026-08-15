"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { PencilLine, Link2, Unplug, Wallet, CalendarDays, Gamepad2, Gauge, Medal, Crown } from "lucide-react";
import { format } from "date-fns";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Progress } from "@/components/ui/Progress";
import { Dialog } from "@/components/ui/Dialog";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { Stagger, FadeIn } from "@/components/motion/FadeIn";
import { useProfile, useStats, usePlatforms, useBadges, useUpdateProfile, useConnectPlatform, useDisconnectPlatform } from "@/hooks/use-data";
import { PLATFORMS, PLATFORM_META } from "@/lib/constants";
import { formatCurrency, cn } from "@/lib/utils";

const schema = z.object({
  displayName: z.string().min(1, "Required").max(40),
  username: z.string().min(2, "At least 2 characters").max(24).regex(/^[a-z0-9_]+$/i, "Letters, numbers, underscores only"),
  bio: z.string().max(140).optional(),
});

type FormValues = z.infer<typeof schema>;

export function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const { data: stats } = useStats();
  const { data: platforms } = usePlatforms();
  const { data: badges } = useBadges();
  const updateProfile = useUpdateProfile();
  const connect = useConnectPlatform();
  const disconnect = useDisconnectPlatform();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const openEdit = () => {
    if (!profile) return;
    reset({ displayName: profile.displayName, username: profile.username, bio: profile.bio ?? "" });
    setEditOpen(true);
  };

  const submit = async (values: FormValues) => {
    await updateProfile.mutateAsync({ displayName: values.displayName, username: values.username, bio: values.bio || null });
    setEditOpen(false);
  };

  const connectedPlatforms = platforms ?? [];
  const unconnected = PLATFORMS.filter((p) => !connectedPlatforms.some((c) => c.platform === p));

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <FadeIn direction="none">
        <Card className="relative overflow-hidden p-6">
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative">
              <Avatar name={profile.displayName} src={profile.avatarUrl} size="xl" />
              <span className="absolute -bottom-1 -right-1 rounded-full border-2 border-surface bg-primary px-1.5 text-[10px] font-bold text-black">
                {profile.level}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="font-display text-[22px] font-bold text-ink">{profile.displayName}</h2>
                <Badge variant={profile.plan === "premium" ? "primary" : "neutral"}>
                  {profile.plan === "premium" ? <><Crown className="size-3" /> Premium</> : "Free"}
                </Badge>
                <button
                  onClick={openEdit}
                  className="flex items-center gap-1.5 rounded-lg border border-edge px-2.5 py-1 text-[12px] font-medium text-ink-soft transition-colors hover:border-edge-strong hover:text-ink"
                >
                  <PencilLine className="size-3.5" /> Edit
                </button>
              </div>
              <p className="mt-0.5 text-[13px] text-ink-muted">@{profile.username}</p>
              {profile.bio && <p className="mt-2 max-w-md text-[13px] leading-relaxed text-ink-soft">{profile.bio}</p>}
              <p className="mt-2 text-[12px] text-ink-faint">
                Member since {format(new Date(profile.createdAt), "MMMM yyyy")}
              </p>
            </div>
            <div className="w-full sm:w-64">
              <div className="flex items-baseline justify-between">
                <p className="text-[12px] text-ink-muted">Level {profile.level}</p>
                <p className="text-[11px] text-ink-faint tabular">{profile.xp} / {profile.xpToNextLevel} XP</p>
              </div>
              <div className="mt-1.5">
                <Progress value={(profile.xp / profile.xpToNextLevel) * 100} status="success" />
              </div>
            </div>
          </div>
        </Card>
      </FadeIn>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-4">
          <p className="flex items-center gap-1.5 text-[12px] text-ink-muted"><Wallet className="size-3.5" /> Lifetime spend</p>
          <p className="mt-1.5 font-mono text-[20px] font-semibold text-ink tabular">
            <AnimatedNumber value={stats?.lifetimeSpend ?? 0} />
          </p>
        </Card>
        <Card className="p-4">
          <p className="flex items-center gap-1.5 text-[12px] text-ink-muted"><CalendarDays className="size-3.5" /> This month</p>
          <p className="mt-1.5 font-mono text-[20px] font-semibold text-ink tabular">
            <AnimatedNumber value={stats?.monthlySpend ?? 0} />
          </p>
        </Card>
        <Card className="p-4">
          <p className="flex items-center gap-1.5 text-[12px] text-ink-muted"><Gamepad2 className="size-3.5" /> Games owned</p>
          <p className="mt-1.5 font-mono text-[20px] font-semibold text-ink tabular">
            <AnimatedNumber value={stats?.totalGames ?? 0} format="number" />
          </p>
        </Card>
        <Card className="p-4">
          <p className="flex items-center gap-1.5 text-[12px] text-ink-muted"><Gauge className="size-3.5" /> Avg / hour</p>
          <p className="mt-1.5 font-mono text-[20px] font-semibold text-ink tabular">
            <AnimatedNumber value={stats?.averagePerHour ?? 0} />
          </p>
        </Card>
      </div>

      <FadeIn direction="none">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-[15px] font-semibold text-ink">Connected platforms</h3>
              <p className="mt-0.5 text-[12px] text-ink-muted">Link your stores to sync purchases automatically.</p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {connectedPlatforms.map((p) => (
              <div key={p.id} className="flex items-center gap-3.5 rounded-xl border border-edge bg-surface-raised p-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-edge bg-surface">
                  <PlatformIcon platform={p.platform} size="lg" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-semibold text-ink">{PLATFORM_META[p.platform].label}</p>
                  <p className="truncate text-[11.5px] text-ink-faint">
                    {p.totalGames} games · {formatCurrency(p.totalSpend)}
                  </p>
                </div>
                <button
                  onClick={() => setConfirmDisconnect(p.id)}
                  className="flex size-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-danger/10 hover:text-danger"
                  aria-label={`Disconnect ${PLATFORM_META[p.platform].label}`}
                >
                  <Unplug className="size-4" />
                </button>
              </div>
            ))}
            {unconnected.map((p) => (
              <button
                key={p}
                onClick={() => connect.mutate(p)}
                disabled={connect.isPending}
                className="flex items-center gap-3.5 rounded-xl border border-dashed border-edge px-4 py-4 text-left transition-colors hover:border-edge-strong hover:bg-surface-raised/40"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-edge bg-surface opacity-50">
                  <PlatformIcon platform={p} size="lg" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-semibold text-ink-soft">{PLATFORM_META[p].label}</p>
                  <p className="flex items-center gap-1 text-[11.5px] text-primary"><Link2 className="size-3" /> Connect</p>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </FadeIn>

      {badges && badges.length > 0 && (
        <Card className="p-6">
          <h3 className="flex items-center gap-2 font-display text-[15px] font-semibold text-ink">
            <Medal className="size-4 text-warning" /> Badges
          </h3>
          <p className="mt-0.5 text-[12px] text-ink-muted">Wear your financial discipline with pride.</p>
          <Stagger className="mt-5 flex flex-wrap gap-3">
            {badges.map((b) => (
              <motion.div
                key={b.id}
                title={b.earnedAt ? `${b.title} — ${b.description}` : b.description}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-[13px]",
                  b.earnedAt
                    ? "border-warning/30 bg-warning/[0.06] text-ink"
                    : "border-edge bg-surface text-ink-faint opacity-60 grayscale"
                )}
              >
                <span className="text-[16px]">{b.icon || "🎖"}</span>
                <span className="font-medium">{b.title}</span>
              </motion.div>
            ))}
          </Stagger>
        </Card>
      )}

      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit profile"
        description="How the squad sees you."
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button form="profile-form" type="submit" variant="primary" loading={isSubmitting}>Save</Button>
          </>
        }
      >
        <form id="profile-form" onSubmit={handleSubmit(submit)} className="space-y-4">
          <div>
            <Label htmlFor="displayName">Display name</Label>
            <Input id="displayName" {...register("displayName")} />
            {errors.displayName && <p className="mt-1 text-[12px] text-danger">{errors.displayName.message}</p>}
          </div>
          <div>
            <Label htmlFor="username">Username</Label>
            <Input id="username" {...register("username")} />
            {errors.username && <p className="mt-1 text-[12px] text-danger">{errors.username.message}</p>}
          </div>
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" rows={3} placeholder="A short confession about your Steam library…" {...register("bio")} />
            {errors.bio && <p className="mt-1 text-[12px] text-danger">{errors.bio.message}</p>}
          </div>
        </form>
      </Dialog>

      <Dialog
        open={confirmDisconnect !== null}
        onClose={() => setConfirmDisconnect(null)}
        title="Disconnect platform?"
        description="Synced history stays in your Vault. New purchases won't come in automatically."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDisconnect(null)}>Keep connected</Button>
            <Button
              variant="danger"
              onClick={() => {
                if (confirmDisconnect) disconnect.mutate(confirmDisconnect);
                setConfirmDisconnect(null);
              }}
              loading={disconnect.isPending}
            >
              Disconnect
            </Button>
          </>
        }
      />
    </div>
  );
}
