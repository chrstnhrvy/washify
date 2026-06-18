import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  /** Optional secondary line (e.g. a comparison). */
  sub?: string;
  subTone?: "up" | "down" | "muted";
};

const TONE = {
  up: "text-emerald-600",
  down: "text-red-600",
  muted: "text-muted",
};

export default function StatCard({ icon: Icon, label, value, sub, subTone = "muted" }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-surface p-5 shadow-card">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary-dark">
        <Icon size={20} aria-hidden="true" />
      </span>
      <p className="mt-3 text-sm font-semibold text-muted">{label}</p>
      <p className="text-2xl font-extrabold tabular-nums text-ink">{value}</p>
      {sub && <p className={`text-xs font-semibold ${TONE[subTone]}`}>{sub}</p>}
    </div>
  );
}
