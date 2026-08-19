import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PolicySection {
  id: string;
  title: string;
  content: ReactNode;
}

interface PolicyPageProps {
  title: string;
  lastUpdated?: string;
  sections: PolicySection[];
  className?: string;
}

export function PolicyPage({ title, lastUpdated, sections, className }: PolicyPageProps) {
  return (
    <div className={cn("mx-auto max-w-[720px] px-6 py-24", className)}>
      <header className="mb-10 border-b border-edge pb-6">
        <h1 className="font-display text-[32px] font-bold text-ink sm:text-[38px]">{title}</h1>
        {lastUpdated && (
          <p className="mt-2 text-[12.5px] text-ink-faint">Last updated: {lastUpdated}</p>
        )}
      </header>
      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.id}>
            <h2
              id={section.id}
              className="font-display text-[20px] font-bold text-ink scroll-mt-24"
            >
              {section.title}
            </h2>
            {section.content}
          </section>
        ))}
      </div>
    </div>
  );
}

export function PolicyLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="underline decoration-transparent underline-offset-2 text-primary transition-colors hover:decoration-primary"
    >
      {children}
    </Link>
  );
}