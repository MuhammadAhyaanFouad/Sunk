import { Logo } from "@/components/ui/Logo";
import { BRAND } from "@/lib/constants";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
      <div className="grid-bg grid-bg-fade pointer-events-none absolute inset-0 opacity-20" aria-hidden />

      <div className="relative mb-8 flex flex-col items-center gap-3">
        <Logo size="lg" />
        <p className="font-display text-sm font-semibold tracking-wide text-ink-soft">{BRAND.tagline}</p>
      </div>

      <div className="relative w-full max-w-[400px] rounded-3xl border border-edge bg-surface/80 p-7 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.7)] backdrop-blur-xl sm:p-8">
        {children}
      </div>

      <p className="relative mt-8 text-center text-[12px] text-ink-faint">
        {BRAND.tagline} · {BRAND.description}
      </p>
    </div>
  );
}
