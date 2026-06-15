import { createContext } from "react";
import type { Session } from "@supabase/supabase-js";

export type AuthState = {
  session: Session | null;
  /** True until the initial session check resolves. */
  loading: boolean;
};

export const AuthContext = createContext<AuthState>({
  session: null,
  loading: true,
});
