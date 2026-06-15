import { supabase, isSupabaseConfigured } from "../../lib/supabase";

/** Start the Google OAuth flow; redirects back to /app on success. */
export function signInWithGoogle() {
  if (!isSupabaseConfigured) {
    alert(
      "Supabase isn't set up yet. Add your keys to .env (see .env.example) " +
        "and restart the dev server.",
    );
    return Promise.resolve();
  }
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/app` },
  });
}

export function signOut() {
  return supabase.auth.signOut();
}
