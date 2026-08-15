"use client";

import { useId, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

export interface AreaDatum {
  label: string;
  value: number;
  secondary?: number;
}

export function AreaChart({
  data,
  height = 180,
  gradientFrom = "#39FF6A",
  gradientTo = "#22D3EE",
  showDots = true,
}: {
  data: AreaDatum[];
  height?: number;
  gradientFrom?: string;
  gradientTo?: string;
  showDots?: boolean;
}) {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [hover, setHover] = useState<number | null>(null);

  const width = 600;
  const padX = 8;
  const padTop = 16;
  const padBottom = 28;
  const max = Math.max(...data.map((d) => d.value), 1) * 1.15;
  const innerW = width - padX * 2;
  const innerH = height - padTop - padBottom;

  const x = (i: number) => padX + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const y = (v: number) => padTop + innerH - (v / max) * innerH;

  const points = data.map((d, i) => ({ x: x(i), y: y(d.value), d }));
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x},${padTop + innerH} L${points[0].x},${padTop + innerH} Z`;

  const stepIndex = hover ?? Math.min(Math.round(points.length * 0.85), points.length - 1);
  const step = points[stepIndex];

  return (
    <div ref={ref} className="relative w-full select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ height }}
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const relX = ((e.clientX - rect.left) / rect.width) * width;
          const idx = Math.round(((relX - padX) / innerW) * (data.length - 1));
          setHover(Math.max(0, Math.min(data.length - 1, idx)));
        }}
        role="img"
        aria-label="Spending trend chart"
      >
        <defs>
          <linearGradient id={`area-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gradientFrom} stopOpacity="0.28" />
            <stop offset="100%" stopColor={gradientTo} stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`line-${id}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={gradientFrom} />
            <stop offset="100%" stopColor={gradientTo} />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={padX}
            x2={width - padX}
            y1={padTop + innerH * f}
            y2={padTop + innerH * f}
            stroke="rgba(255,255,255,0.04)"
            strokeDasharray="3 4"
          />
        ))}

        <motion.path
          d={areaPath}
          fill={`url(#area-${id})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: inView ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
        <motion.path
          d={linePath}
          fill="none"
          stroke={`url(#line-${id})`}
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: inView ? 1 : 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />

        {showDots &&
          points.map((p, i) => (
            <motion.circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={hover === i ? 5 : 3}
              fill="#0A0A0A"
              stroke={hover === i ? gradientFrom : "rgba(255,255,255,0.25)"}
              strokeWidth="2"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: inView ? 1 : 0, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.03 }}
            />
          ))}

        {step && hover !== null && (
          <>
            <line x1={step.x} x2={step.x} y1={padTop} y2={padTop + innerH} stroke={gradientFrom} strokeOpacity="0.35" strokeDasharray="3 3" />
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pointer-events-none"
            >
              <rect
                x={Math.max(padX, Math.min(width - padX - 96, step.x - 48))}
                y={Math.max(0, step.y - 44)}
                width="96"
                height="34"
                rx="8"
                fill="#1c1c1c"
                stroke="rgba(255,255,255,0.1)"
              />
              <text x={Math.max(padX, Math.min(width - padX - 96, step.x - 48)) + 48} y={step.y - 23} textAnchor="middle" fill="#F2F2F2" fontSize="12" fontWeight="600" fontFamily="var(--font-mono)">
                {formatCurrency(step.d.value)}
              </text>
            </motion.g>
          </>
        )}

        {data.map((d, i) => (
          <text
            key={i}
            x={x(i)}
            y={height - 8}
            textAnchor="middle"
            fontSize="10"
            fill="#5a5a5a"
            fontFamily="var(--font-inter)"
          >
            {d.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
