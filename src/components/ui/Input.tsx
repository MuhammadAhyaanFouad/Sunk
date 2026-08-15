import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, leftIcon, ...props }, ref) => (
    <div className={cn("relative", className)}>
      {leftIcon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint">
          {leftIcon}
        </span>
      )}
      <input
        ref={ref}
        className={cn(
          "h-10 w-full rounded-xl border border-edge bg-surface-raised px-3.5 text-sm text-ink placeholder:text-ink-faint",
          "transition-all duration-200 hover:border-edge-strong focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15",
          leftIcon && "pl-10",
          className,
        )}
        {...props}
      />
    </div>
  ),
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full min-h-[96px] rounded-xl border border-edge bg-surface-raised px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint",
        "transition-all duration-200 hover:border-edge-strong focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15 resize-none",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export const Label = ({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label
    className={cn("mb-1.5 block text-[13px] font-medium text-ink-soft", className)}
    {...props}
  />
);
