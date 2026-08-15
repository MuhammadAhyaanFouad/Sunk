import type { JSX } from "react";
import { cn } from "@/lib/utils";
import { PLATFORM_META, type PlatformId } from "@/lib/constants";

const glyphs: Record<PlatformId, (c: string) => JSX.Element> = {
  steam: (c) => (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden>
      <circle cx="9.8" cy="10.2" r="6.2" fill={c} opacity="0.16" />
      <path d="M9.8 4.4a5.8 5.8 0 0 0-5.5 7.6l3.4-1.4a2.35 2.35 0 0 1 .6-.14A2.5 2.5 0 0 1 11 13.4c0 .2 0 .42-.1.6L9.6 17.4A5.8 5.8 0 1 0 9.8 4.4Z" fill={c} />
      <circle cx="12.9" cy="12.4" r="2.1" fill="#0A0A0A" />
      <circle cx="7.6" cy="12.4" r="1.05" fill={c} />
    </svg>
  ),
  roblox: (c) => (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden>
      <rect x="4.5" y="4.5" width="15" height="15" rx="4" fill={c} opacity="0.18" />
      <path d="M9 6.8 6.9 17.2 15 19.4l2.1-10.4L9 6.8Zm1.9 2.1 4.2 1.1-.7 4-4.2-1 .7-4.1Z" fill={c} />
    </svg>
  ),
  xbox: (c) => (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden>
      <circle cx="12" cy="12" r="8.6" fill={c} opacity="0.16" />
      <path d="M6.6 7.1c3.1 3.4 4.2 7.4 1.6 10.5-1.3-1.4-2.2-3.3-2.2-5.5 0-1.8.6-3.7 1.5-5ZM17.4 7.1c.9 1.8 1.5 3.7 1.5 5.5 0 2.2-.9 4.1-2.2 5.5-2.6-3.1-1.5-7.1 1.6-10.5" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M12 8.6c1.8-2.3 2.6-2.9 4-3.4-1.2-.8-2.6-1.2-4-1.2s-2.8.4-4 1.2c1.4.5 2.2 1.1 4 3.4Z" fill={c} />
      <path d="M12 8.6c-.9 1.4-2.3 4-3.1 5.8l-.5 1.4c1 .9 2.2 1.4 3.6 1.4s2.6-.5 3.6-1.4l-.5-1.4c-.8-1.8-2.2-4.4-3.1-5.8Z" fill={c} />
    </svg>
  ),
  playstation: (c) => (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden>
      <path d="M15.9 3.7 8.4 5.6v13.6l2.7-.9V7.2l4.8-1.3v13.6l3.6-1.1V5.2c0-.9-.9-1.8-1.8-1.5h-1.8Z" fill={c} opacity="0.9" />
      <path d="M5.2 17.6c1.2-.5 2.7-.6 4.1-.1l1.6.5-.9-.7c-1.8-1.5-5-1-6.3 1-.9 1.4 1.2 2.2 3 1.5" stroke={c} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  ),
  epic: (c) => (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden>
      <path d="M12 4.2c1.6.9 2.5 2.4 2.8 4.1 0 .3-.3.5-.6.5H9.8c-.3 0-.6-.2-.6-.5.3-1.7 1.2-3.2 2.8-4.1Z" fill={c} />
      <path d="M15.2 13.2 12 18.9l-3.2-5.7h6.4Z" fill={c} />
      <circle cx="12" cy="10" r="3.2" fill={c} />
      <path d="M8.8 9.6c-.5 1.1-.5 2.5.2 3.7l-2.6 4.6a8.1 8.1 0 0 1-2.3-7.6c.2-.7 1-1 1.7-.8 2 .6 4 1.3 6 1.6 2-.3 4-1 6-1.6.7-.2 1.5.1 1.7.8a8.1 8.1 0 0 1-2.3 7.6l-2.6-4.6c.7-1.2.7-2.6.2-3.7" stroke={c} strokeWidth="0.8" />
    </svg>
  ),
  nintendo: (c) => (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden>
      <path d="M8.6 4h.2c2.6.4 4.3 2.5 4.3 5.2v3.6c0 2.7-1.7 4.8-4.3 5.2h-.2A4.2 4.2 0 0 1 4 13.8V10.2A4.2 4.2 0 0 1 8.6 4Zm.4 2.8v10.4c1.4 0 2.4-1.2 2.4-2.8V9.6c0-1.6-1-2.8-2.4-2.8Z" fill={c} />
      <rect x="15.3" y="4.8" width="1.6" height="6.1" rx="0.8" fill={c} />
      <rect x="18" y="4.8" width="1.6" height="4.7" rx="0.8" fill={c} />
    </svg>
  ),
  battlenet: (c) => (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden>
      <circle cx="12" cy="12" r="8.2" fill={c} opacity="0.14" />
      <path d="M12 5.2 7.6 12 12 18.8 16.4 12 12 5.2Z" fill={c} />
      <path d="m8 3.4 1.2 2M16 3.4 14.8 5.4M8 20.6l1.2-2M16 20.6l-1.2-2M3.4 8l2 1.2M3.4 16l2-1.2M20.6 8l-2 1.2M20.6 16l-2-1.2" stroke={c} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
  gog: (c) => (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden>
      <path d="M7 4.5h7.5c2.9 0 5.5 2.6 5.5 5.7 0 3.1-2.6 5.8-5.5 5.8H7V4.5Z" stroke={c} strokeWidth="1.6" />
      <path d="M9.5 4.5v16" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9.5 12h8.5" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
};

export function PlatformIcon({
  platform,
  className,
  size = "md",
}: {
  platform: PlatformId;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const meta = PLATFORM_META[platform];
  const sizes = { sm: "size-3.5", md: "size-4", lg: "size-5" };
  return (
    <span
      title={meta.label}
      aria-label={meta.label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        sizes[size],
        className,
      )}
    >
      {glyphs[platform](meta.accent)}
    </span>
  );
}

export function PlatformPill({ platform }: { platform: PlatformId }) {
  const meta = PLATFORM_META[platform];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-surface-raised px-2.5 py-1 text-[11px] font-medium text-ink-soft"
      style={{ borderColor: `${meta.accent}33` }}
    >
      <PlatformIcon platform={platform} size="sm" />
      {meta.label}
    </span>
  );
}
