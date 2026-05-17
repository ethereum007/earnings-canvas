import { createClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl } from "./env";

// Server-only admin client. NEVER import this from a Client Component.
// Uses the service role key — bypasses RLS.
export function createSupabaseAdminClient() {
  return createClient(
    getSupabaseUrl(),
    getSupabaseServiceRoleKey() || getSupabaseAnonKey(),
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
