import { Users, Facebook } from "lucide-react";
import Spinner from "../../components/ui/Spinner";
import { useCustomers } from "./useCustomers";

export default function CustomersPage() {
  const { customers, loading } = useCustomers();

  if (loading) return <Spinner label="Loading customers…" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Customers</h1>
        <p className="text-muted">Everyone who's dropped off laundry with you.</p>
      </div>

      {customers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-surface p-10 text-center">
          <Users size={28} className="mx-auto text-muted" aria-hidden="true" />
          <p className="mt-3 font-semibold text-ink">No customers yet</p>
          <p className="mt-1 text-sm text-muted">
            They're added automatically when you create orders.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {customers.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-surface p-5 shadow-card"
            >
              <div className="min-w-0">
                <p className="font-bold text-ink">{c.name}</p>
                <p className="text-sm tabular-nums text-muted">{c.phone}</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {c.messenger_psid && (
                  <span
                    className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 font-semibold text-primary-dark"
                    title="Messenger linked"
                  >
                    <Facebook size={14} aria-hidden="true" />
                    Messenger
                  </span>
                )}
                <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-semibold text-muted tabular-nums">
                  {c.visit_count} {c.visit_count === 1 ? "visit" : "visits"}
                </span>
                <span className="hidden text-muted sm:inline">last {c.last_visit}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
