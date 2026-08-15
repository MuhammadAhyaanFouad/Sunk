import { cn, initials } from "@/lib/utils";

export function Avatar({
  src,
  name,
  size = "md",
  className,
  online,
}: {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  online?: boolean;
}) {
  const sizes = {
    sm: "size-7 text-[10px]",
    md: "size-9 text-xs",
    lg: "size-12 text-sm",
    xl: "size-20 text-lg",
  };
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          className={cn("rounded-full object-cover ring-1 ring-white/10", sizes[size])}
        />
      ) : (
        <span
          aria-hidden
          className={cn(
            "flex items-center justify-center rounded-full bg-gradient-to-br from-primary/25 to-cyan-500/20 font-display font-semibold text-ink ring-1 ring-white/10",
            sizes[size],
          )}
        >
          {initials(name)}
        </span>
      )}
      {online !== undefined && (
        <span
          aria-hidden
          className={cn(
            "absolute bottom-0 right-0 size-2.5 rounded-full ring-2 ring-[#0A0A0A]",
            online ? "bg-primary" : "bg-ink-faint",
          )}
        />
      )}
    </span>
  );
}
