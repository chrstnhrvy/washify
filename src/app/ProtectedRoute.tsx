import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import Spinner from "../components/ui/Spinner";

/** Gates /app routes: waits for the session check, then redirects out if signed out. */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) return <Spinner fullPage label="Checking your session…" />;
  if (!session) return <Navigate to="/" replace />;
  return <>{children}</>;
}
