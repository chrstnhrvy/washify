import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL ?? "";
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

/** True once both Supabase env vars are present (see .env.example). */
export const isSupabaseConfigured = Boolean(url && anonKey);

if (!isSupabaseConfigured) {
  console.warn(
    "[Washify] Supabase is not configured. Add VITE_SUPABASE_URL and " +
      "VITE_SUPABASE_ANON_KEY to your .env to enable sign-in.",
  );
}

// Placeholder values keep createClient from throwing so the public site still
// renders before Supabase is set up; auth calls simply won't work until then.
export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  anonKey || "placeholder-anon-key",
);
