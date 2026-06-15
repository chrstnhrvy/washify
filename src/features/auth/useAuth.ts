import { useContext } from "react";
import { AuthContext } from "./auth-context";

/** Read the current auth session and loading state. */
export function useAuth() {
  return useContext(AuthContext);
}
