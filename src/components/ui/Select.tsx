import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options?: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, children, ...props }, ref) => (
    <div className={cn("relative", className)}>
      <select
        ref={ref}
        className={cn(
          "h-10 w-full cursor-pointer appearance-none rounded-xl border border-edge bg-surface-raised px-3.5 pr-9 text-sm text-ink transition-colors hover:border-edge-strong focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15",
        )}
        {...props}
      >
        {options ? options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>) : children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-faint" aria-hidden />
    </div>
  ),
);
Select.displayName = "Select";
