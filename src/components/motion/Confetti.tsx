"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { mulberry32 } from "@/lib/demo/seed";

const COLORS = ["#39FF6A", "#22D3EE", "#A78BFA", "#F5B03C", "#60A5FA", "#F472B6"];

export function Confetti({ active, count = 120 }: { active: boolean; count?: number }) {
  const rand = useMemo(() => mulberry32(42), []);
  const pieces = useMemo(() => (active ? Array.from({ length: count }, (_, i) => i) : []), [active, count]);

  return (
    <AnimatePresence>
      {pieces.length > 0 && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-[80] overflow-hidden"
          aria-hidden
        >
          {pieces.map((p) => {
            const x = rand() * 100;
            const delay = rand() * 0.4;
            const duration = 2.2 + rand() * 1.6;
            const size = 6 + rand() * 7;
            const color = COLORS[Math.floor(rand() * COLORS.length)];
            const drift = (rand() - 0.5) * 160;
            const rounded = rand() > 0.5;
            const rotate = rand() > 0.5 ? 540 : -540;
            const heightScale = rand() > 0.5 ? 0.4 : 1;
            return (
              <motion.span
                key={p}
                initial={{ opacity: 1, x: `${x}vw`, y: "-6vh", rotate: 0 }}
                animate={{ opacity: [1, 1, 0], x: `calc(${x}vw + ${drift}px)`, y: "110vh", rotate }}
                exit={{ opacity: 0 }}
                transition={{ duration, delay, ease: [0.2, 0.6, 0.4, 1] }}
                style={{
                  position: "absolute",
                  top: 0,
                  width: size,
                  height: size * heightScale,
                  backgroundColor: color,
                  borderRadius: rounded ? "50%" : 2,
                }}
              />
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
