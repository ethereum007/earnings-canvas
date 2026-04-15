import { createClient } from "@supabase/supabase-js";

// Server-only admin client. NEVER import this from a Client Component.
// Uses the service role key — bypasses RLS.
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
