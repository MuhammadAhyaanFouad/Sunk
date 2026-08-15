"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Status = "default" | "success" | "warning" | "danger";

const STATUS_BAR: Record<Status, string> = {
  default: "bg-primary",
  success: "bg-primary",
  warning: "bg-warning",
  danger: "bg-danger",
};

const STATUS_GLOW: Record<Status, string> = {
  default: "shadow-[0_0_12px_rgba(57,255,106,0.5)]",
  success: "shadow-[0_0_12px_rgba(57,255,106,0.5)]",
  warning: "shadow-[0_0_12px_rgba(245,176,60,0.5)]",
  danger: "shadow-[0_0_12px_rgba(255,107,107,0.5)]",
};

export function Progress({
  value,
  max = 100,
  status = "default",
  className,
  barClassName,
  glow = false,
}: {
  value: number;
  max?: number;
  status?: Status;
  className?: string;
  barClassName?: string;
  glow?: boolean;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]", className)}
    >
      <motion.div
        className={cn(
          "h-full rounded-full",
          STATUS_BAR[status],
          glow && STATUS_GLOW[status],
          barClassName,
        )}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}
