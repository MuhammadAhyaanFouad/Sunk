import { cn } from "@/lib/utils";

export function Logo({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "text-lg", md: "text-xl", lg: "text-4xl" };
  return (
    <span className={cn("inline-flex font-display font-bold tracking-tight text-ink", sizes[size], className)}>
      Sunk<span className="text-primary">.</span>
    </span>
  );
}
