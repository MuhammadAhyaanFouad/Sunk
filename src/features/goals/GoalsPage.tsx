"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Target, PiggyBank, Clock, Ban, Sparkles, Plus, CheckCircle2, Flag } from "lucide-react";
import { format } from "date-fns";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Dialog } from "@/components/ui/Dialog";
import { Input, Label } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Stagger, FadeIn } from "@/components/motion/FadeIn";
import { useGoals, useAddGoal } from "@/hooks/use-data";
import type { Goal } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";

const GOAL_META: Record<
  string,
  { label: string; icon: typeof Target; accent: string }
> = {
  reduce_spend: { label: "Reduce spend", icon: PiggyBank, accent: "text-primary bg-primary/10" },
  save_up: { label: "Save up", icon: Target, accent: "text-cyan bg-cyan/10" },
  hours_played: { label: "Hours played", icon: Clock, accent: "text-violet bg-violet/10" },
  no_spend: { label: "No-spend challenge", icon: Ban, accent: "text-warning bg-warning/10" },
  custom: { label: "Custom", icon: Sparkles, accent: "text-ink-soft bg-white/[0.05]" },
};

const schema = z.object({
  title: z.string().min(1, "Give your goal a title"),
  type: z.enum(["reduce_spend", "save_up", "hours_played", "no_spend", "custom"]),
  target: z.coerce.number({ message: "Enter a target" }).positive("Target must be more than 0"),
  unit: z.enum(["money", "days", "hours"]),
  endDate: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function GoalsPage() {
  const { data: goals, isLoading } = useGoals();
  const addGoal = useAddGoal();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: { title: "", type: "reduce_spend", target: undefined, unit: "money", endDate: "" },
  });

  const submit = async (values: FormValues) => {
    await addGoal.mutateAsync({
      title: values.title,
      type: values.type,
      target: values.target,
      unit: values.unit,
      startDate: new Date().toISOString(),
      endDate: values.endDate ? new Date(values.endDate).toISOString() : null,
      current: 0,
    });
    setOpen(false);
    reset();
  };

  const formatTarget = (g: Goal) =>
    g.unit === "money" ? formatCurrency(g.target) : `${g.target.toLocaleString()} ${g.unit === "days" ? "days" : "hours"}`;

  const progressOf = (g: Goal) => Math.min((g.current / g.target) * 100, 100);

  return (
    <div className="space-y-6">
      <FadeIn direction="none" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">Goals</h2>
          <p className="mt-0.5 text-[13px] text-ink-muted">
            Spend less, save up, or play more deliberately. Pick a mission.
          </p>
        </div>
        <Button variant="primary" leftIcon={<Plus className="size-4" />} onClick={() => setOpen(true)}>
          New goal
        </Button>
      </FadeIn>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {goals?.map((g) => {
            const meta = GOAL_META[g.type];
            const pct = progressOf(g);
            return (
              <Card key={g.id} className={cn("p-5", g.status !== "active" && "opacity-70")}>
                <div className="flex items-start gap-4">
                  <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", meta.accent)}>
                    <meta.icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[14.5px] font-semibold text-ink">{g.title}</p>
                      {g.status === "completed" && <Badge variant="primary">Done</Badge>}
                      {g.status === "failed" && <Badge variant="danger">Missed</Badge>}
                    </div>
                    <p className="mt-0.5 text-[12px] text-ink-muted">
                      Target: {formatTarget(g)}
                      {g.endDate ? ` · due ${format(new Date(g.endDate), "MMM d")}` : ""}
                    </p>
                    {g.streak > 0 && g.type !== "hours_played" && (
                      <p className="mt-0.5 text-[12px] text-warning">🔥 {g.streak} day streak</p>
                    )}
                  </div>
                  {g.status === "active" && g.type === "no_spend" && (
                    <span className="flex size-8 items-center justify-center rounded-lg bg-warning/10 text-warning">
                      <CheckCircle2 className="size-4" />
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-[11.5px]">
                    <span className="text-ink-muted">
                      {g.unit === "money"
                        ? formatCurrency(g.current)
                        : `${g.current.toLocaleString()} ${g.unit === "days" ? "days" : "hrs"}`}
                    </span>
                    <span className="font-semibold text-ink-soft">{pct.toFixed(0)}%</span>
                  </div>
                  <Progress
                    value={pct}
                    status={g.status === "completed" ? "success" : pct >= 75 ? "warning" : "default"}
                  />
                </div>

                <div className="mt-3 flex items-center gap-2 text-[11px] text-ink-faint">
                  <Flag className="size-3" />
                  Started {format(new Date(g.startDate), "MMM d, yyyy")}
                </div>
              </Card>
            );
          })}
        </Stagger>
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Create a goal"
        description="Set a mission you can actually keep."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button form="goal-form" type="submit" variant="primary" loading={isSubmitting}>Create goal</Button>
          </>
        }
      >
        <form id="goal-form" onSubmit={handleSubmit(submit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="e.g. Stay under $150 in July" {...register("title")} />
            {errors.title && <p className="mt-1 text-[12px] text-danger">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                id="type"
                {...register("type")}
                options={Object.entries(GOAL_META).map(([value, m]) => ({ value, label: m.label }))}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Deadline</Label>
              <Input id="endDate" type="date" {...register("endDate")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="target">Target</Label>
              <Input id="target" type="number" min="1" step="any" placeholder="150" {...register("target")} />
              {errors.target && <p className="mt-1 text-[12px] text-danger">{errors.target.message}</p>}
            </div>
            <div>
              <Label htmlFor="unit">Unit</Label>
              <Select
                id="unit"
                {...register("unit")}
                options={[
                  { value: "money", label: "$ (money)" },
                  { value: "days", label: "Days" },
                  { value: "hours", label: "Hours" },
                ]}
              />
            </div>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
