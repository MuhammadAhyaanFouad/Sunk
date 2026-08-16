"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  UserRound, Bell, CreditCard, Shield, TriangleAlert, Crown, Download, RefreshCw, Check, X,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Switch } from "@/components/ui/Switch";
import { Input, Label } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Dialog } from "@/components/ui/Dialog";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { FadeIn } from "@/components/motion/FadeIn";
import { useProfile, useBilling, usePayments, useUpdateProfile, useUpgradeToPremium, useResetDemoData } from "@/hooks/use-data";
import { useApp } from "@/context/app-context";
import { ROAST_META, ROAST_LEVELS } from "@/lib/constants";
import { COUNTRIES, timezoneGroups } from "@/lib/geo";
import { formatCurrency, cn } from "@/lib/utils";

const schema = z.object({
  displayName: z.string().min(1, "Required").max(40),
  username: z.string().min(2).max(24).regex(/^[a-z0-9_]+$/i, "Letters, numbers, underscores"),
  email: z.string().email("Invalid email"),
  timezone: z.string().optional(),
  country: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const TABS = [
  { id: "account", label: "Account", icon: UserRound },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "privacy", label: "Privacy", icon: Shield },
  { id: "danger", label: "Danger zone", icon: TriangleAlert },
] as const;

export function SettingsPage() {
  const { data: profile, isLoading } = useProfile();
  const { data: billing } = useBilling();
  const { data: payments } = usePayments();
  const updateProfile = useUpdateProfile();
  const upgrade = useUpgradeToPremium();
  const resetDemo = useResetDemoData();
  const { isDemo, prefs, setPref } = useApp();

  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("account");
  const [roastLevel, setRoastLevel] = useState<"off" | "mild" | "medium" | "extra_crispy">("medium");
  const [notifPrefs, setNotifPrefs] = useState({ renewals: true, achievements: true, friends: true, insights: true, marketing: false });
  const [confirmDanger, setConfirmDanger] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    values: profile
      ? {
          displayName: profile.displayName,
          username: profile.username,
          email: profile.email,
          timezone: profile.timezone ?? "",
          country: profile.country ?? "",
        }
      : undefined,
  });

  const submit = async (values: FormValues) => {
    await updateProfile.mutateAsync({
      displayName: values.displayName,
      username: values.username,
      country: values.country || null,
      timezone: values.timezone || null,
    });
    toast("Profile updated", { description: "Saved." });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <FadeIn direction="none">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">Settings</h2>
          <p className="mt-0.5 text-[13px] text-ink-muted">Tune how Sunk works — and what it's allowed to tell you.</p>
        </div>
      </FadeIn>

      <div className="flex flex-col gap-6 lg:flex-row">
        <nav className="lg:w-52 lg:shrink-0" aria-label="Settings sections">
          <div className="flex gap-1 overflow-x-auto lg:flex-col lg:gap-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium transition-colors",
                  tab === t.id ? "bg-white/[0.06] text-ink" : "text-ink-muted hover:bg-white/[0.03] hover:text-ink-soft"
                )}
              >
                <t.icon className={cn("size-4", t.id === "danger" && tab === "danger" && "text-danger")} />
                {t.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="min-w-0 flex-1 space-y-4">
          {tab === "account" && (
            <Card className="p-6">
              <h3 className="font-display text-[15px] font-semibold text-ink">Account details</h3>
              <p className="mt-0.5 text-[12px] text-ink-muted">
                These appear across the app, the leaderboard, and your share cards.
              </p>
              <form id="settings-account" onSubmit={handleSubmit(submit)} className="mt-5 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="settings-displayName">Display name</Label>
                    <Input id="settings-displayName" {...register("displayName")} />
                    {errors.displayName && <p className="mt-1 text-[12px] text-danger">{errors.displayName.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="settings-username">Username</Label>
                    <Input id="settings-username" {...register("username")} />
                    {errors.username && <p className="mt-1 text-[12px] text-danger">{errors.username.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="settings-email">Email</Label>
                    <Input id="settings-email" type="email" disabled {...register("email")} />
                    <p className="mt-1 text-[11px] text-ink-faint">Managed by your sign-in provider.</p>
                  </div>
                  <div>
                    <Label htmlFor="settings-country">Country</Label>
                    <Select id="settings-country" {...register("country")}>
                      <option value="">Select a country</option>
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="settings-timezone">Timezone</Label>
                    <Select id="settings-timezone" {...register("timezone")}>
                      <option value="">Select a timezone</option>
                      {timezoneGroups().map((g) => (
                        <optgroup key={g.region} label={g.region}>
                          {g.zones.map((z) => (
                            <option key={z} value={z}>{z}</option>
                          ))}
                        </optgroup>
                      ))}
                    </Select>
                  </div>
                </div>
                <Button form="settings-account" type="submit" variant="primary" loading={isSubmitting}>Save changes</Button>
              </form>
            </Card>
          )}

          {tab === "notifications" && (
            <Card className="p-6">
              <h3 className="font-display text-[15px] font-semibold text-ink">Notification preferences</h3>
              <p className="mt-0.5 text-[12px] text-ink-muted">Choose what shows up in your inbox.</p>
              <div className="mt-5 space-y-4">
                {(Object.keys(notifPrefs) as (keyof typeof notifPrefs)[]).map((k) => (
                  <div key={k} className="flex items-center justify-between gap-4 rounded-xl border border-edge bg-surface-raised px-4 py-3.5">
                    <div>
                      <p className="text-[13.5px] font-medium capitalize text-ink-soft">
                        {k === "renewals" ? "Subscription renewals" : k === "marketing" ? "Product updates" : `${k} activity`}
                      </p>
                      <p className="text-[11.5px] text-ink-faint">
                        {k === "renewals" ? "Remind me before charges" : k === "marketing" ? "Occasional roadmap news" : "Keep me posted"}
                      </p>
                    </div>
                    <Switch checked={notifPrefs[k]} onChange={(v) => setNotifPrefs((p) => ({ ...p, [k]: v }))} label={`Toggle ${k}`} />
                  </div>
                ))}
              </div>
              {prefs.roast && (
                <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-edge bg-surface-raised px-4 py-3.5">
                  <div>
                    <p className="text-[13.5px] font-medium text-ink-soft">Roast intensity</p>
                    <p className="text-[11.5px] text-ink-faint">How spicy your Roast Mode gets.</p>
                  </div>
                  <Select
                    value={roastLevel}
                    onChange={(e) => setRoastLevel(e.target.value as typeof roastLevel)}
                    className="w-40"
                    options={ROAST_LEVELS.map((l) => ({ value: l, label: ROAST_META[l].label }))}
                  />
                </div>
              )}
            </Card>
          )}

          {tab === "billing" && (
            <>
              <Card className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <span className={cn("flex size-11 items-center justify-center rounded-xl", profile.plan === "premium" ? "bg-primary/10 text-primary" : "bg-white/[0.05] text-ink-faint")}>
                      <Crown className="size-5" />
                    </span>
                    <div>
                      <p className="flex items-center gap-2 text-[15px] font-semibold text-ink">
                        {profile.plan === "premium" ? "Premium" : "Free"} plan
                        <Badge variant={billing?.status === "active" ? "primary" : "neutral"}>{billing?.status ?? "none"}</Badge>
                      </p>
                      <p className="mt-0.5 text-[12.5px] text-ink-muted">
                        {billing?.nextBillingAt
                          ? `Next charge ${format(new Date(billing.nextBillingAt), "MMM d, yyyy")} · ${formatCurrency(billing.price ?? 0)}/${billing.currency ?? "USD"}`
                          : profile.plan === "free"
                            ? "Unlimited Vault, 1 platform, basic insights."
                            : "Billing is handled securely."}
                      </p>
                    </div>
                  </div>
                  {profile.plan === "free" ? (
                    <Button variant="primary" leftIcon={<Crown className="size-4" />} onClick={() => upgrade.mutate()} loading={upgrade.isPending}>
                      Upgrade to Premium
                    </Button>
                  ) : (
                    <Button variant="outline">Manage billing</Button>
                  )}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-display text-[15px] font-semibold text-ink">Payment history</h3>
                <div className="mt-4 divide-y divide-edge">
                  {(payments ?? []).map((p) => (
                    <div key={p.id} className="flex items-center justify-between gap-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-[13.5px] font-medium text-ink">{p.description}</p>
                        <p className="text-[11.5px] text-ink-faint">
                          {format(new Date(p.paidAt), "MMM d, yyyy")} · {p.method} {p.last4 ? `•••• ${p.last4}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={p.status === "paid" ? "primary" : p.status === "failed" ? "danger" : "warning"}>{p.status}</Badge>
                        <span className="font-mono text-[13.5px] font-semibold text-ink tabular">{formatCurrency(p.amount)}</span>
                      </div>
                    </div>
                  ))}
                  {payments && payments.length === 0 && (
                    <p className="py-4 text-center text-[13px] text-ink-muted">No payments yet.</p>
                  )}
                </div>
              </Card>
            </>
          )}

          {tab === "privacy" && (
            <Card className="p-6">
              <h3 className="font-display text-[15px] font-semibold text-ink">Your data</h3>
              <p className="mt-0.5 text-[12px] text-ink-muted">
                {isDemo ? "You're exploring demo data stored locally in this browser." : "Your data lives in your Supabase project."}
              </p>
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between gap-4 rounded-xl border border-edge bg-surface-raised px-4 py-3.5">
                  <div>
                    <p className="text-[13.5px] font-medium text-ink-soft">Export my data</p>
                    <p className="text-[11.5px] text-ink-faint">Download everything as JSON.</p>
                  </div>
                  <Button variant="outline" size="sm" leftIcon={<Download className="size-3.5" />}>Export</Button>
                </div>
                <div className="flex items-center justify-between gap-4 rounded-xl border border-edge bg-surface-raised px-4 py-3.5">
                  <div>
                    <p className="text-[13.5px] font-medium text-ink-soft">Delete my account</p>
                    <p className="text-[11.5px] text-ink-faint">Permanently remove your profile and all data.</p>
                  </div>
                  <Button variant="danger" size="sm" onClick={() => setConfirmDanger("delete")}>Delete account</Button>
                </div>
              </div>

              <h3 className="mt-8 font-display text-[15px] font-semibold text-ink">Features</h3>
              <p className="mt-0.5 text-[12px] text-ink-muted">
                What shows up around the app. Turn something off and it disappears everywhere.
              </p>
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between gap-4 rounded-xl border border-edge bg-surface-raised px-4 py-3.5">
                  <div>
                    <p className="text-[13.5px] font-medium text-ink-soft">Leaderboards</p>
                    <p className="text-[11.5px] text-ink-faint">Compare against other Sunk users. Off hides leaderboards app-wide.</p>
                  </div>
                  <Switch checked={prefs.leaderboards} onChange={(v) => setPref("leaderboards", v)} label="Toggle leaderboards" />
                </div>
                <div className="flex items-center justify-between gap-4 rounded-xl border border-edge bg-surface-raised px-4 py-3.5">
                  <div>
                    <p className="text-[13.5px] font-medium text-ink-soft">Roast Mode</p>
                    <p className="text-[11.5px] text-ink-faint">The unsolicited verdicts. Off silences them everywhere.</p>
                  </div>
                  <Switch checked={prefs.roast} onChange={(v) => setPref("roast", v)} label="Toggle roast mode" />
                </div>
              </div>
            </Card>
          )}

          {tab === "danger" && (
            <Card className="border-danger/30 p-6">
              <h3 className="flex items-center gap-2 font-display text-[15px] font-semibold text-danger">
                <TriangleAlert className="size-4" /> Danger zone
              </h3>
              <p className="mt-0.5 text-[12px] text-ink-muted">Irreversible actions. Take a breath.</p>
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between gap-4 rounded-xl border border-danger/20 bg-danger/[0.04] px-4 py-3.5">
                  <div>
                    <p className="text-[13.5px] font-medium text-ink-soft">Reset demo data</p>
                    <p className="text-[11.5px] text-ink-faint">Restore the sample dataset to its original state.</p>
                  </div>
                  <Button variant="outline" size="sm" leftIcon={<RefreshCw className="size-3.5" />} onClick={() => setConfirmDanger("reset")} loading={resetDemo.isPending}>
                    Reset
                  </Button>
                </div>
                <div className="flex items-center justify-between gap-4 rounded-xl border border-danger/20 bg-danger/[0.04] px-4 py-3.5">
                  <div>
                    <p className="text-[13.5px] font-medium text-ink-soft">Delete everything</p>
                    <p className="text-[11.5px] text-ink-faint">Wipe all purchases, goals, and platforms.</p>
                  </div>
                  <Button variant="danger" size="sm" onClick={() => setConfirmDanger("delete")}>Delete all data</Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      <Dialog
        open={confirmDanger !== null}
        onClose={() => setConfirmDanger(null)}
        title="Are you absolutely sure?"
        description="This cannot be undone. There's no refund on deleted numbers — not even from us."
        footer={
          <>
            <Button variant="ghost" leftIcon={<X className="size-4" />} onClick={() => setConfirmDanger(null)}>Keep it</Button>
            <Button
              variant="danger"
              leftIcon={<Check className="size-4" />}
              onClick={() => {
                if (confirmDanger === "reset") resetDemo.mutate();
                setConfirmDanger(null);
              }}
            >
              Confirm
            </Button>
          </>
        }
      />
    </div>
  );
}
