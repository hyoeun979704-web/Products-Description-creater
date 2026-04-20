import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { serverEnv } from "@/lib/utils/env";

let cached: SupabaseClient | null = null;

/**
 * Service-role Supabase client. Server-only — never import from a Client
 * Component. Bypasses RLS, so all auth/authorization must be done in code
 * before calling it.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;
  if (!serverEnv.SUPABASE_URL || !serverEnv.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Supabase env vars are missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local."
    );
  }
  cached = createClient(
    serverEnv.SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
  return cached;
}
