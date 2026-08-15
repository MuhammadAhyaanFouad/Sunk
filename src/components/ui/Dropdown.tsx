"use client";

import { useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClickOutside } from "@/hooks/use-click-outside";

export interface MenuItem {
  label: string;
  icon?: ReactNode;
  onSelect?: () => void;
  danger?: boolean;
  disabled?: boolean;
  key?: string;
}

export function Dropdown({
  trigger,
  items,
  align = "end",
  label,
}: {
  trigger: (open: () => void) => ReactNode;
  items: MenuItem[];
  align?: "start" | "end";
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);

  return (
    <div ref={ref} className="relative inline-flex">
      {trigger(() => setOpen((v) => !v))}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            role="menu"
            aria-label={label}
            className={cn(
              "absolute z-40 mt-2 min-w-[200px] overflow-hidden rounded-xl border border-edge bg-[#1a1a1a] p-1.5 shadow-[0_16px_48px_-8px_rgba(0,0,0,0.7)]",
              align === "end" ? "right-0" : "left-0",
            )}
          >
            {items.map((item) => (
              <button
                key={item.key ?? item.label}
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  setOpen(false);
                  item.onSelect?.();
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors",
                  item.danger
                    ? "text-danger hover:bg-danger/10"
                    : "text-ink-soft hover:bg-white/[0.05] hover:text-ink",
                  item.disabled && "pointer-events-none opacity-40",
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DropdownTrigger({
  children,
  onClick,
  className,
  ariaLabel,
}: {
  children: ReactNode;
  onClick: () => void;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      aria-haspopup="menu"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xl border border-edge bg-surface-raised px-3.5 py-2 text-sm font-medium text-ink-soft transition-all hover:border-edge-strong hover:text-ink",
        className,
      )}
    >
      {children}
      <ChevronDown className="size-3.5 opacity-60" aria-hidden />
    </button>
  );
}
