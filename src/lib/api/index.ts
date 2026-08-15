import type { SunkRepository } from "@/lib/api/types";
import { DemoRepository } from "@/lib/demo/store";
import { createClient } from "@/lib/supabase/client";
import { SupabaseRepository } from "@/lib/api/supabase-repository";

let repository: SunkRepository | null = null;

/**
 * Returns the active repository. Uses Supabase when configured,
 * otherwise falls back to the seeded demo repository so the product
 * is fully explorable without external services.
 */
export function getApi(): SunkRepository {
  if (repository) return repository;

  const client = createClient();
  if (client) {
    repository = new SupabaseRepository(client);
  } else {
    repository = new DemoRepository();
  }
  return repository;
}

export function resetApiForTest() {
  repository = null;
}

export function isDemoMode() {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export type { SunkRepository };
