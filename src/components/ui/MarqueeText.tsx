"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function MarqueeText({
  children,
  className,
  speed = 30,
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;

    const check = () => {
      setOverflow(text.scrollWidth > container.clientWidth + 2);
    };

    check();

    const ro = new ResizeObserver(check);
    ro.observe(container);
    ro.observe(text);

    return () => ro.disconnect();
  }, [children]);

  const duration = overflow ? Math.max(4, (textRef.current?.scrollWidth ?? 100) / speed) : 0;

  return (
    <div ref={containerRef} className={cn("relative min-w-0 overflow-hidden", className)}>
      <span
        ref={textRef}
        className={cn(
          "block whitespace-nowrap",
          overflow && "animate-marquee",
        )}
        style={overflow ? { animationDuration: `${duration}s` } : undefined}
      >
        {children}
        {overflow && (
          <>
            {"\u00A0\u2003"}
            {children}
          </>
        )}
      </span>
    </div>
  );
}
