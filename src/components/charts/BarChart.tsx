"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

export interface BarDatum {
  label: string;
  value: number;
  limit?: number;
  highlight?: boolean;
}

export function BarChart({
  data,
  height = 160,
  formatValue,
}: {
  data: BarDatum[];
  height?: number;
  formatValue?: (v: number) => string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const max = Math.max(...data.map((d) => Math.max(d.value, d.limit ?? 0)), 1) * 1.15;

  return (
    <div ref={ref} className="flex w-full items-end gap-2" style={{ height }}>
      {data.map((d, i) => {
        const pct = (d.value / max) * 100;
        const over = d.limit !== undefined && d.value > d.limit;
        return (
          <div key={i} className="group relative flex h-full flex-1 flex-col justify-end">
            {d.limit !== undefined && (
              <div
                className="absolute inset-x-0 z-0 border-t border-dashed border-warning/40"
                style={{ bottom: `${(d.limit / max) * 100}%` }}
                aria-hidden
              />
            )}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: inView ? `${pct}%` : 0 }}
              transition={{ duration: 0.7, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "relative w-full rounded-t-md transition-all duration-200",
                d.highlight
                  ? "bg-gradient-to-t from-primary/30 to-primary"
                  : over
                    ? "bg-gradient-to-t from-danger/40 to-danger/70"
                    : "bg-gradient-to-t from-white/[0.07] to-white/[0.16]",
              )}
            />
            <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-edge bg-[#1c1c1c] px-2 py-0.5 font-mono text-[11px] text-ink opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              {formatValue ? formatValue(d.value) : d.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
