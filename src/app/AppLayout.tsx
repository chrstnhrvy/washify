import { LogOut } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import Logo from "../components/ui/Logo";
import Spinner from "../components/ui/Spinner";
import { useAuth } from "../features/auth/useAuth";
import { signOut } from "../features/auth/actions";
import { useShop } from "../features/settings/useShop";
import Onboarding from "../features/settings/Onboarding";
import type { AppOutletContext } from "./app-context";

const NAV = [
  { to: "/app", label: "Orders", end: true },
  { to: "/app/dashboard", label: "Sales", end: false },
  { to: "/app/settings", label: "Settings", end: false },
];

function navClass({ isActive }: { isActive: boolean }) {
  return `inline-flex min-h-[44px] items-center border-b-2 px-1 text-base font-semibold transition-colors ${
    isActive
      ? "border-primary text-ink"
      : "border-transparent text-muted hover:text-ink"
  }`;
}

/** Shell for the authenticated workspace: header + nav + the active /app page. */
export default function AppLayout() {
  const { session } = useAuth();
  const user = session?.user;
  const { shop, loading, refetch } = useShop(user?.id);

  return (
    <div className="min-h-dvh bg-bg">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo />
            {shop && (
              <span className="hidden text-sm font-semibold text-muted sm:inline">
                / {shop.shop_name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden max-w-[12rem] truncate text-sm text-muted sm:inline">
              {user?.email}
            </span>
            <button
              type="button"
              onClick={() => signOut()}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl px-3 text-base font-semibold text-muted transition-colors hover:text-ink"
            >
              <LogOut size={18} aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
        {shop?.onboarded && (
          <nav
            aria-label="Workspace"
            className="mx-auto flex max-w-5xl gap-6 px-4 sm:px-6"
          >
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {loading ? (
          <Spinner label="Loading your shop…" />
        ) : !shop ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-base text-amber-900">
            No shop profile found yet. Run{" "}
            <code className="font-mono">supabase/provision_shop.sql</code> in the
            Supabase SQL editor, then sign out and back in.
          </div>
        ) : !shop.onboarded ? (
          <Onboarding shop={shop} onDone={refetch} />
        ) : (
          <Outlet
            context={{ shop, refetchShop: refetch } satisfies AppOutletContext}
          />
        )}
      </main>
    </div>
  );
}
