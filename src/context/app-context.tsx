"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import type { Profile } from "@/types";
import { getApi, isDemoMode } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";

export interface Prefs {
  leaderboards: boolean;
  roast: boolean;
}

const DEFAULT_PREFS: Prefs = { leaderboards: true, roast: true };
const PREFS_KEY = "sunk:prefs";

interface AppContextValue {
  profile: Profile | null;
  loading: boolean;
  isDemo: boolean;
  isAuthenticated: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  prefs: Prefs;
  setPref: (key: keyof Prefs, value: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function loadPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<Prefs>;
    return {
      leaderboards: typeof parsed.leaderboards === "boolean" ? parsed.leaderboards : DEFAULT_PREFS.leaderboards,
      roast: typeof parsed.roast === "boolean" ? parsed.roast : DEFAULT_PREFS.roast,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

let prefsSnapshot: Prefs = DEFAULT_PREFS;
const prefsListeners = new Set<() => void>();

function getPrefsSnapshot(): Prefs {
  if (prefsSnapshot === DEFAULT_PREFS) prefsSnapshot = loadPrefs();
  return prefsSnapshot;
}

function subscribePrefs(listener: () => void) {
  prefsListeners.add(listener);
  return () => prefsListeners.delete(listener);
}

function setStoredPref(key: keyof Prefs, value: boolean) {
  prefsSnapshot = { ...getPrefsSnapshot(), [key]: value };
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefsSnapshot));
  } catch {
    // storage unavailable — keep in-memory only
  }
  prefsListeners.forEach((listener) => listener());
}

export function AppProvider({ children }: { children: ReactNode }) {
  const isDemo = isDemoMode();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const prefs = useSyncExternalStore(subscribePrefs, getPrefsSnapshot, () => DEFAULT_PREFS);

  const setPref = useCallback((key: keyof Prefs, value: boolean) => {
    setStoredPref(key, value);
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const p = await getApi().getProfile();
      setProfile(p);
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function boot() {
      const supabase = createClient();
      if (isDemo || !supabase) {
        // Demo session: load the seeded profile immediately.
        try {
          const p = await getApi().getProfile();
          if (mounted) setProfile(p);
        } finally {
          if (mounted) setLoading(false);
        }
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        if (mounted) setLoading(false);
        return;
      }
      await refreshProfile();
      if (mounted) setLoading(false);

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_OUT") {
          setProfile(null);
        } else if (session) {
          await refreshProfile();
        }
        setLoading(false);
      });
      return () => {
        subscription.unsubscribe();
        mounted = false;
      };
    }

    void boot();
  }, [isDemo, refreshProfile]);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      profile,
      loading,
      isDemo,
      isAuthenticated: Boolean(profile),
      refreshProfile,
      signOut,
      prefs,
      setPref,
    }),
    [profile, loading, isDemo, refreshProfile, signOut, prefs, setPref],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
