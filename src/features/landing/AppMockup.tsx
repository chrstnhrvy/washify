import { Check, MessageSquareText } from "lucide-react";

const ORDERS = [
  { code: "WSH-0042", name: "Maria S.", status: "Ready", tone: "success" },
  { code: "WSH-0041", name: "Juan D.", status: "Washing", tone: "primary" },
  { code: "WSH-0040", name: "Ana R.", status: "Received", tone: "muted" },
] as const;

const TONE: Record<string, string> = {
  success: "bg-success/15 text-emerald-700",
  primary: "bg-primary/15 text-primary-dark",
  muted: "bg-slate-100 text-muted",
};

/** Decorative product mockup for the hero (not interactive). */
export default function AppMockup() {
  return (
    <div
      className="rounded-2xl border border-slate-200 bg-surface p-5 shadow-card"
      aria-hidden="true"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-muted">Today’s orders</p>
        <span className="rounded-lg bg-accent/20 px-2.5 py-1 text-xs font-bold text-amber-700">
          ₱4,180 · 19 loads
        </span>
      </div>
      <ul className="mt-4 space-y-2.5">
        {ORDERS.map((o) => (
          <li
            key={o.code}
            className="flex items-center justify-between rounded-xl bg-bg px-3 py-3"
          >
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink">{o.name}</p>
              <p className="text-sm tabular-nums text-muted">{o.code}</p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-lg px-2.5 py-1 text-xs font-bold ${TONE[o.tone]}`}
              >
                {o.status}
              </span>
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-white">
                {o.status === "Ready" ? (
                  <MessageSquareText size={18} />
                ) : (
                  <Check size={18} />
                )}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
