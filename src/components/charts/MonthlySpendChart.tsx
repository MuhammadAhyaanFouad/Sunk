"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import type { PlatformId } from "@/types";
import { PLATFORM_META } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

export interface MonthlySpendPoint {
  month: string;
  total: number;
  platforms: { platform: PlatformId; amount: number }[];
}

const PLATFORM_COLORS: Record<PlatformId, string> = {
  roblox: "#FF5C7A",
  steam: "#5CC8FF",
  epic: "#8B5CF6",
  playstation: "#2DD4BF",
  xbox: "#9BF00B",
  nintendo: "#FF5C5C",
  battlenet: "#00AEFF",
  gog: "#FFD63E",
};

const MAX_BAR_HEIGHT = 120;

export function MonthlySpendChart({ data }: { data: MonthlySpendPoint[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [grown, setGrown] = useState(false);

  const maxTotal = useMemo(() => Math.max(...data.map((d) => d.total), 1), [data]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const selectedPoint = selected ? data.find((d) => d.month === selected) ?? null : null;

  return (
    <div>
      <div className="flex items-end gap-[10px]" style={{ height: 130, paddingTop: 10 }}>
        {data.map((d) => {
          const heightPx = Math.round((d.total / maxTotal) * MAX_BAR_HEIGHT);
          return (
            <button
              key={d.month}
              onClick={() => setSelected(selected === d.month ? null : d.month)}
              className="group relative min-w-0 cursor-pointer focus:outline-none"
              style={{ flex: 1 }}
              aria-label={`${format(new Date(d.month + "-01"), "MMMM yyyy")} — ${formatCurrency(d.total)} total. Click for breakdown.`}
              aria-pressed={selected === d.month}
            >
              <div
                className="w-full overflow-hidden rounded-[4px] group-hover:[outline:1px_solid_#8A8A8A]"
                style={{
                  backgroundColor: "#1B1B1B",
                  height: grown ? `${heightPx}px` : 0,
                  display: "flex",
                  flexDirection: "column-reverse",
                  transition: "height .7s cubic-bezier(.2,.8,.2,1)",
                }}
              >
                <div className="w-full" style={{ flexGrow: 1, backgroundColor: "var(--color-primary)" }} />
              </div>
              <div
                className="pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-[6px] border border-edge px-[9px] py-[5px] font-mono text-[11.5px] text-ink opacity-0 shadow-lg transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100"
                style={{ bottom: "calc(100% + 4px)", backgroundColor: "#1B1B1B" }}
              >
                {formatCurrency(d.total)} · click for breakdown
              </div>
              <div className="mt-2 text-center font-mono text-[10.5px] text-ink-faint">
                {format(new Date(d.month + "-01"), "MMM").toUpperCase()}
              </div>
            </button>
          );
        })}
      </div>

      {selectedPoint && (
        <div
          className="mt-5"
          style={{ borderTop: "1px solid #2A2A2A", paddingTop: 18 }}
        >
          <div className="mb-3 flex items-center justify-between text-[13px] font-semibold text-ink">
            <span>
              {format(new Date(selectedPoint.month + "-01"), "MMM").toUpperCase()} — {formatCurrency(selectedPoint.total)} total
            </span>
            <button
              onClick={() => setSelected(null)}
              className="font-mono text-[11px] font-normal text-ink-faint hover:text-ink"
            >
              close
            </button>
          </div>
          <div>
            {selectedPoint.platforms
              .filter((s) => s.amount > 0)
              .sort((a, b) => b.amount - a.amount)
              .map((s) => {
                const pct = Math.round((s.amount / selectedPoint.total) * 100);
                return (
                  <div key={s.platform} style={{ marginBottom: 10 }}>
                    <div className="mb-[5px] flex items-center justify-between text-[12.5px]">
                      <span className="flex items-center gap-2 text-ink-soft">
                        <span
                          className="inline-block size-[7px] rounded-full"
                          style={{ backgroundColor: PLATFORM_COLORS[s.platform] }}
                          aria-hidden
                        />
                        {PLATFORM_META[s.platform].label}
                      </span>
                      <span className="font-mono text-ink-faint">{formatCurrency(s.amount)}</span>
                    </div>
                    <div className="h-[6px] overflow-hidden rounded-[3px]" style={{ backgroundColor: "#1B1B1B" }}>
                      <div
                        className="h-full rounded-[3px]"
                        style={{ width: `${pct}%`, backgroundColor: PLATFORM_COLORS[s.platform] }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
