"use client";

import { useEffect } from "react";

export function useHotkeys(
  bindings: { keys: string[]; handler: (e: KeyboardEvent) => void; when?: boolean }[],
  deps: unknown[] = [],
) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      for (const binding of bindings) {
        if (binding.when === false) continue;
        const mod = binding.keys.includes("ctrl") || binding.keys.includes("meta");
        const shift = binding.keys.includes("shift");
        const plain = binding.keys.filter((k) => !["ctrl", "meta", "shift"].includes(k));
        const modDown = e.ctrlKey || e.metaKey;
        if (mod !== modDown) continue;
        if (shift !== e.shiftKey) continue;
        if (!plain.some((k) => e.key.toLowerCase() === k.toLowerCase())) continue;
        e.preventDefault();
        binding.handler(e);
        break;
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export function useGlobalShortcuts(onSearch: () => void, onRoast: () => void) {
  useHotkeys(
    [
      { keys: ["ctrl", "k"], handler: onSearch },
      { keys: ["meta", "k"], handler: onSearch },
      { keys: ["ctrl", "shift", "r"], handler: onRoast },
      { keys: ["meta", "shift", "r"], handler: onRoast },
    ],
    [onSearch, onRoast],
  );
}

export function useEscape(handler: () => void, active = true) {
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handler();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [handler, active]);
}
