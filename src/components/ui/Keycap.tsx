"use client";

function getModifier(): "mac" | "ctrl" {
  if (typeof navigator === "undefined") return "ctrl";
  if (/Mac|iPhone|iPad/.test(navigator.userAgent)) return "mac";
  return "ctrl";
}

export function SearchKeycap() {
  const mod = getModifier();
  if (mod === "mac") {
    return <span className="inline-flex items-center gap-1">⌘K</span>;
  }
  return <span className="inline-flex items-center gap-1">Ctrl K</span>;
}
