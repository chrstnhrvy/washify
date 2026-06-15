import { useId, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import type { NewOrder } from "./useOrders";
import type { PricingMode } from "../settings/useShop";
import { unitLabel, unitStep } from "../settings/pricing";

type OrderFormProps = {
  mode: PricingMode;
  unitPrice: number;
  onAdd: (input: NewOrder) => Promise<void>;
};

export default function OrderForm({ mode, unitPrice, onAdd }: OrderFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [qty, setQty] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const baseId = useId();

  const amount = Math.max(qty, 0) * unitPrice;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || qty <= 0) {
      setError(`Enter a name, phone, and ${mode === "per_kg" ? "weight" : "loads"}.`);
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onAdd({ customer_name: name.trim(), phone: phone.trim(), num_loads: qty });
      setName("");
      setPhone("");
      setQty(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the order.");
    } finally {
      setSaving(false);
    }
  }

  const field = "min-h-[44px] w-full rounded-xl bg-bg px-3 text-base text-ink ring-1 ring-slate-200 placeholder:text-muted";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-surface p-5 shadow-card"
    >
      <h2 className="text-lg font-bold text-ink">New order</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <label htmlFor={`${baseId}-name`} className="text-sm font-semibold text-ink">
            Customer
          </label>
          <input
            id={`${baseId}-name`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Maria Santos"
            autoComplete="name"
            className={`mt-1 ${field}`}
          />
        </div>
        <div>
          <label htmlFor={`${baseId}-phone`} className="text-sm font-semibold text-ink">
            Phone
          </label>
          <input
            id={`${baseId}-phone`}
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0917 123 4567"
            autoComplete="tel"
            className={`mt-1 ${field}`}
          />
        </div>
        <div>
          <label htmlFor={`${baseId}-qty`} className="text-sm font-semibold text-ink">
            {unitLabel(mode)}
          </label>
          <input
            id={`${baseId}-qty`}
            type="number"
            min={unitStep(mode)}
            step={unitStep(mode)}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className={`mt-1 ${field}`}
          />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-ink">Amount due</span>
          <output className="mt-1 flex min-h-[44px] items-center rounded-xl bg-primary/5 px-3 text-base font-bold tabular-nums text-primary-dark">
            ₱{amount.toLocaleString()}
          </output>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-primary px-5 text-base font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
      >
        {saving ? (
          <Loader2 size={18} className="animate-spin" aria-hidden="true" />
        ) : (
          <Plus size={18} aria-hidden="true" />
        )}
        Add order
      </button>
    </form>
  );
}
