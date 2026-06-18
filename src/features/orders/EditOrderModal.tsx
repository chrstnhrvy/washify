import { useEffect, useId, useState } from "react";
import { X } from "lucide-react";
import type { Order } from "./types";
import type { NewOrder } from "./useOrders";
import type { PricingMode } from "../settings/useShop";
import { unitLabel, unitStep } from "../settings/pricing";

type EditOrderModalProps = {
  order: Order;
  mode: PricingMode;
  unitPrice: number;
  onClose: () => void;
  onSave: (id: string, fields: NewOrder) => void;
};

export default function EditOrderModal({
  order,
  mode,
  unitPrice,
  onClose,
  onSave,
}: EditOrderModalProps) {
  const [name, setName] = useState(order.customer_name);
  const [phone, setPhone] = useState(order.phone);
  const [qty, setQty] = useState(Number(order.num_loads));
  const [error, setError] = useState<string | null>(null);
  const titleId = useId();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const amount = Math.max(qty, 0) * unitPrice;

  function handleSave() {
    if (!name.trim() || !phone.trim() || qty <= 0) {
      setError("Fill in name, phone, and quantity.");
      return;
    }
    onSave(order.id, { customer_name: name.trim(), phone: phone.trim(), num_loads: qty });
    onClose();
  }

  const field = "mt-1 min-h-[44px] w-full rounded-xl bg-bg px-3 text-base text-ink ring-1 ring-slate-200";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-2xl bg-surface p-5 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 id={titleId} className="text-lg font-bold text-ink">
            Edit {order.order_code}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-slate-100"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor={`${titleId}-name`} className="text-sm font-semibold text-ink">
              Customer
            </label>
            <input id={`${titleId}-name`} value={name} onChange={(e) => setName(e.target.value)} className={field} />
          </div>
          <div>
            <label htmlFor={`${titleId}-phone`} className="text-sm font-semibold text-ink">
              Phone
            </label>
            <input id={`${titleId}-phone`} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={field} />
          </div>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label htmlFor={`${titleId}-qty`} className="text-sm font-semibold text-ink">
                {unitLabel(mode)}
              </label>
              <input
                id={`${titleId}-qty`}
                type="number"
                min={unitStep(mode)}
                step={unitStep(mode)}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className={field}
              />
            </div>
            <p className="min-h-[44px] flex items-center text-base font-bold tabular-nums text-primary-dark">
              ₱{amount.toLocaleString()}
            </p>
          </div>
        </div>

        {error && <p role="alert" className="mt-3 text-sm font-medium text-red-600">{error}</p>}

        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="min-h-[44px] rounded-xl px-4 text-base font-semibold text-muted hover:text-ink">
            Cancel
          </button>
          <button type="button" onClick={handleSave} className="min-h-[44px] rounded-xl bg-primary px-5 text-base font-semibold text-white hover:bg-primary-dark">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
