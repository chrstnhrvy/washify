import { Check } from "lucide-react";

/**
 * Hero visual: the SMS a customer receives when their laundry is done.
 * Public-facing (no shop dashboard data), and it shows off the core feature.
 */
export default function AppMockup() {
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-sm">
      <div className="rounded-[2rem] border border-slate-200 bg-surface p-3 shadow-card">
        <div className="rounded-[1.5rem] bg-bg p-5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Messages
            </span>
            <span className="text-xs text-muted">now</span>
          </div>

          <div className="mt-4 flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-bold text-white">
              HW
            </span>
            <div>
              <p className="text-sm font-bold text-ink">Happy Wash</p>
              <p className="text-xs text-muted">SMS</p>
            </div>
          </div>

          <div className="mt-4 max-w-[88%] rounded-2xl rounded-tl-sm bg-surface px-4 py-3 shadow-sm ring-1 ring-slate-100">
            <p className="text-base leading-relaxed text-ink">
              Hi Maria! Your laundry at Happy Wash is washed, folded, and ready
              for pickup. Salamat!
            </p>
          </div>

          <p className="mt-2 inline-flex items-center gap-1 px-1 text-xs font-semibold text-success">
            <Check size={13} aria-hidden="true" />
            Sent automatically by Washify
          </p>
        </div>
      </div>

      <span className="absolute -right-3 -top-3 rounded-full bg-accent px-3 py-1 text-xs font-bold text-amber-900 shadow-card">
        No app needed
      </span>
    </div>
  );
}
