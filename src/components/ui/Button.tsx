import { forwardRef, cloneElement, isValidElement, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "subtle";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground font-semibold shadow-[0_0_0_1px_rgba(57,255,106,0.2),0_8px_24px_-8px_rgba(57,255,106,0.4)] hover:shadow-[0_0_0_1px_rgba(57,255,106,0.35),0_12px_32px_-8px_rgba(57,255,106,0.55)] hover:brightness-110",
  secondary:
    "bg-surface-raised text-ink font-medium border border-edge hover:bg-[#212121] hover:border-edge-strong",
  ghost: "text-ink-soft hover:text-ink hover:bg-white/[0.04]",
  outline:
    "border border-edge text-ink hover:bg-white/[0.04] hover:border-edge-strong",
  danger: "bg-danger/10 text-danger font-semibold border border-danger/30 hover:bg-danger/20",
  subtle: "bg-white/[0.03] text-ink-soft hover:text-ink hover:bg-white/[0.06]",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-6 text-[15px] gap-2 rounded-xl",
  icon: "h-9 w-9 rounded-lg",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "secondary", size = "md", loading, leftIcon, rightIcon, fullWidth, asChild, children, disabled, ...props },
    ref,
  ) => {
    const classes = cn(
      "inline-flex items-center justify-center whitespace-nowrap transition-all duration-200 select-none",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
      "disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
      variants[variant],
      sizes[size],
      fullWidth && "w-full",
      className,
    );

    if (asChild && isValidElement(children)) {
      return cloneElement(
        children as React.ReactElement<{ className?: string; disabled?: boolean }>,
        {
          className: cn(classes, (children.props as { className?: string }).className),
          disabled: disabled || loading,
        },
      );
    }

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : leftIcon}
        {children}
        {rightIcon}
      </button>
    );
  },
);

Button.displayName = "Button";
