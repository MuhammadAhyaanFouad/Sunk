"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { useApp } from "@/context/app-context";
import { useGlobalShortcuts } from "@/hooks/use-hotkeys";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { profile, loading, isDemo, prefs } = useApp();
  const router = useRouter();

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const openRoast = useCallback(() => {
    if (!prefs.roast) return;
    toast("Roast Mode", {
      description: "Press Ctrl+R to roast · Ctrl+Shift+R for Extra Crispy",
      duration: 4000,
    });
  }, [prefs.roast]);

  useGlobalShortcuts(openSearch, openRoast);

  // Onboarding redirect: if a real profile exists but hasn't onboarded.
  useEffect(() => {
    if (!loading && !isDemo && profile && !profile.onboarded) {
      router.replace("/onboarding");
    }
    if (!loading && !isDemo && !profile) {
      router.replace("/login");
    }
  }, [loading, isDemo, profile, router]);

  // Demo quick-enter: an unauthenticated demo user can explore directly.
  useEffect(() => {
    if (!loading && isDemo && !profile) {
      void import("@/lib/api").then(({ getApi }) => getApi().getProfile());
    }
  }, [loading, isDemo, profile]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} onSearch={openSearch} />
      <div className="lg:pl-[68px]">
        <Topbar onMenuOpen={() => setMenuOpen(true)} onSearchOpen={openSearch} />
        <main className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
      <CommandPalette key={searchOpen ? "open" : "closed"} open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
