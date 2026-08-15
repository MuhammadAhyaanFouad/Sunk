import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, opts?: { compact?: boolean }) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...(opts?.compact ? { notation: "compact" as const, maximumFractionDigits: 1 } : {}),
  }).format(amount);
}

export function formatCompactCurrency(amount: number) {
  return formatCurrency(amount, { compact: true });
}

export function formatPercent(value: number, digits = 0) {
  return `${value.toFixed(digits)}%`;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function formatDuration(days: number): string {
  if (days < 1) return "today";
  if (days === 1) return "1 day";
  if (days < 30) return `${days} days`;
  const months = Math.floor(days / 30);
  if (months === 1) return "1 month";
  if (months < 12) return `${months} months`;
  const years = Math.floor(months / 12);
  return years === 1 ? "1 year" : `${years} years`;
}

export function formatDate(date: Date | string, style: "short" | "long" = "short") {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    ...(style === "short" ? { month: "short", day: "numeric", year: "numeric" } : { month: "long", day: "numeric", year: "numeric" }),
  }).format(d);
}

export function formatRelative(date: Date | string, now = new Date()) {
  const d = typeof date === "string" ? new Date(date) : date;
  const diffMs = d.getTime() - now.getTime();
  const absDays = Math.abs(Math.round(diffMs / (1000 * 60 * 60 * 24)));
  const past = diffMs < 0;

  if (absDays === 0) {
    const absHours = Math.abs(Math.round(diffMs / (1000 * 60 * 60)));
    if (absHours === 0) return "just now";
    return past ? `${absHours}h ago` : `in ${absHours}h`;
  }
  if (absDays === 1) return past ? "yesterday" : "tomorrow";
  if (absDays < 7) return past ? `${absDays}d ago` : `in ${absDays}d`;
  if (absDays < 30) return past ? `${Math.floor(absDays / 7)}w ago` : `in ${Math.floor(absDays / 7)}w`;
  return formatDate(d);
}

export function timeAgo(date: Date | string, now = new Date()) {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

export function debounce<T extends (...args: never[]) => void>(fn: T, ms: number) {
  let t: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
