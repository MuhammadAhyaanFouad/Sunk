"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import { PLATFORM_META, type PlatformId } from "@/lib/constants";

export function DonutChart({
  data,
  size = 180,
  centerLabel,
  centerValue,
}: {
  data: { platform: PlatformId; amount: number }[];
  size?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [hover, setHover] = useState<number | null>(null);

  const total = data.reduce((s, d) => s + d.amount, 0) || 1;
  const stroke = 22;
  const radius = (size - stroke) / 2;

  const segments = data.reduce<
    {
      platform: PlatformId;
      amount: number;
      i: number;
      fraction: number;
      start: number;
      path: string;
      color: string;
    }[]
  >((acc, d, i) => {
    const fraction = d.amount / total;
    const start = acc.length ? acc[acc.length - 1].start + acc[acc.length - 1].fraction : 0;
    const startAngle = start * 360;
    const angle = fraction * 360;
    const largeArc = angle > 180 ? 1 : 0;
    const a = (startAngle - 90) * (Math.PI / 180);
    const b = (startAngle + angle - 90) * (Math.PI / 180);
    const x1 = 50 + radius * Math.cos(a);
    const y1 = 50 + radius * Math.sin(a);
    const x2 = 50 + radius * Math.cos(b);
    const y2 = 50 + radius * Math.sin(b);
    acc.push({
      ...d,
      i,
      fraction,
      start,
      path: `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      color: PLATFORM_META[d.platform].accent,
    });
    return acc;
  }, []);

  const active = hover !== null ? segments[hover] : null;

  return (
    <div ref={ref} className="flex items-center gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label="Platform breakdown donut chart">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
          {segments.map((seg, i) => (
            <motion.path
              key={seg.platform}
              d={seg.path}
              fill="none"
              stroke={seg.color}
              strokeWidth={hover === i ? stroke + 3 : stroke}
              strokeLinecap="butt"
              className="cursor-pointer transition-all duration-200"
              style={{ opacity: hover === null || hover === i ? 1 : 0.3, filter: hover === i ? `drop-shadow(0 0 6px ${seg.color}80)` : undefined }}
              initial={{ opacity: 0 }}
              animate={{ opacity: hover === null || hover === i ? 1 : 0.3, pathLength: inView ? 1 : 0 }}
              transition={{ duration: 0.9, delay: 0.15 + i * 0.08 }}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-lg font-semibold text-ink tabular">
            {active ? formatCurrency(active.amount) : centerValue}
          </span>
          <span className="mt-0.5 text-[10px] uppercase tracking-wider text-ink-faint">
            {active ? PLATFORM_META[active.platform].label : centerLabel}
          </span>
        </div>
      </div>
      <ul className="flex-1 space-y-2.5">
        {segments.map((seg, i) => (
          <li
            key={seg.platform}
            className="flex cursor-default items-center gap-2.5 text-[13px]"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <span className="size-2.5 rounded-sm" style={{ backgroundColor: seg.color }} aria-hidden />
            <span className="flex-1 text-ink-soft">{PLATFORM_META[seg.platform].label}</span>
            <span className="font-mono tabular text-ink">{formatCurrency(seg.amount)}</span>
            <span className="w-10 text-right text-ink-faint tabular">{Math.round(seg.fraction * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
