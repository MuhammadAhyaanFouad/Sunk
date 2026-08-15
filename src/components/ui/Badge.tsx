import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "primary" | "warning" | "danger" | "neutral" | "outline" | "violet";

const styles: Record<BadgeVariant, string> = {
  default: "bg-white/[0.06] text-ink-soft border-white/[0.06]",
  primary: "bg-primary/10 text-primary border-primary/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  danger: "bg-danger/10 text-danger border-danger/20",
  neutral: "bg-ink-faint/10 text-ink-faint border-ink-faint/15",
  outline: "bg-transparent text-ink-soft border-edge",
  violet: "bg-violet/10 text-violet border-violet/20",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  icon?: ReactNode;
  dot?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", icon, dot, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles[variant],
        className,
      )}
      {...props}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      {icon}
      {children}
    </span>
  ),
);
Badge.displayName = "Badge";
