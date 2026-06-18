import { useEffect } from "react";
import { X, Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { Order } from "./types";
import type { PricingMode } from "../settings/useShop";
import { unitNoun } from "../settings/pricing";

type ReceiptModalProps = {
  order: Order;
  shopName: string;
  pageId: string | null;
  mode: PricingMode;
  onClose: () => void;
};

export default function ReceiptModal({
  order,
  shopName,
  pageId,
  mode,
  onClose,
}: ReceiptModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-sm rounded-2xl bg-surface p-5 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="no-print flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Claim stub</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-slate-100"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="print-area mt-3 rounded-xl border border-dashed border-slate-300 p-5 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted">{shopName}</p>
          <p className="mt-3 text-3xl font-extrabold tracking-wider text-ink">{order.order_code}</p>
          <p className="mt-1 text-sm text-muted">Keep this stub to claim your laundry.</p>

          <dl className="mx-auto mt-4 max-w-[16rem] space-y-1 text-left text-sm">
            <div className="flex justify-between"><dt className="text-muted">Customer</dt><dd className="font-semibold text-ink">{order.customer_name}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Qty</dt><dd className="font-semibold text-ink">{order.num_loads} {unitNoun(mode, order.num_loads)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Amount</dt><dd className="font-semibold tabular-nums text-ink">₱{Number(order.amount_due).toLocaleString()}{order.paid ? " (paid)" : ""}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Dropped off</dt><dd className="font-semibold text-ink">{order.dropoff_date}</dd></div>
          </dl>

          {pageId && (
            <div className="mt-4 flex flex-col items-center border-t border-slate-200 pt-4">
              <QRCodeSVG value={`https://m.me/${pageId}`} size={92} aria-label="Messenger QR" />
              <p className="mt-2 text-xs text-muted">
                Scan + send <span className="font-bold">{order.order_code}</span> on Messenger for pickup updates.
              </p>
            </div>
          )}
        </div>

        <div className="no-print mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="min-h-[44px] rounded-xl px-4 text-base font-semibold text-muted hover:text-ink">
            Close
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-primary px-5 text-base font-semibold text-white hover:bg-primary-dark"
          >
            <Printer size={18} aria-hidden="true" />
            Print
          </button>
        </div>
      </div>
    </div>
  );
}
