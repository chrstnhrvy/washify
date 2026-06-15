import type { PricingMode } from "./useShop";

type PricingModeToggleProps = {
  value: PricingMode;
  onChange: (mode: PricingMode) => void;
};

const OPTIONS: { value: PricingMode; label: string }[] = [
  { value: "per_load", label: "Per load" },
  { value: "per_kg", label: "Per kilo" },
];

export default function PricingModeToggle({ value, onChange }: PricingModeToggleProps) {
  return (
    <div className="inline-flex rounded-xl bg-slate-100 p-1" role="group" aria-label="Pricing mode">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`min-h-[40px] rounded-lg px-4 text-sm font-semibold transition-colors ${
            value === o.value ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
