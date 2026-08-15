"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import { formatCompactCurrency, formatCurrency } from "@/lib/utils";

export function AnimatedNumber({
  value,
  format = "currency",
  className,
  prefix,
  suffix,
}: {
  value: number;
  format?: "currency" | "number" | "hours";
  className?: string;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: 1.4, bounce: 0 });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    motionValue.set(value);
  }, [inView, value, motionValue]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (latest) => {
      if (format === "currency") {
        setDisplay(formatCurrency(latest));
      } else if (format === "number") {
        setDisplay(new Intl.NumberFormat("en-US").format(Math.round(latest)));
      } else {
        setDisplay(`${Math.round(latest).toLocaleString()}`);
      }
    });
    return unsubscribe;
  }, [spring, format]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

export function AnimatedCompactNumber({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: 1.4, bounce: 0 });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    motionValue.set(value);
  }, [inView, value, motionValue]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (latest) => {
      setDisplay(formatCompactCurrency(latest));
    });
    return unsubscribe;
  }, [spring]);

  return <span ref={ref} className={className}>{display}</span>;
}
