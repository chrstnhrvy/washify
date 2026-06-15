import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
};

export default function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-surface p-5 shadow-card">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary-dark">
        <Icon size={20} aria-hidden="true" />
      </span>
      <p className="mt-3 text-sm font-semibold text-muted">{label}</p>
      <p className="text-2xl font-extrabold tabular-nums text-ink">{value}</p>
    </div>
  );
}
