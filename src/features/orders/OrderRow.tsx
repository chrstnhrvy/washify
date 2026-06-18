import { Check, Circle, MessageSquareText, Pencil, Printer, Trash2 } from "lucide-react";
import StatusControl from "./StatusControl";
import type { Order, OrderStatus } from "./types";
import type { PricingMode } from "../settings/useShop";
import { unitNoun } from "../settings/pricing";

type OrderRowProps = {
  order: Order;
  mode: PricingMode;
  onStatus: (id: string, status: OrderStatus) => void;
  onTogglePaid: (id: string, paid: boolean) => void;
  onText: (order: Order) => void;
  onEdit: (order: Order) => void;
  onReceipt: (order: Order) => void;
  onDelete: (id: string) => void;
};

const iconBtn =
  "grid h-11 w-11 place-items-center rounded-xl text-muted transition-colors hover:bg-slate-100 hover:text-ink";

export default function OrderRow({
  order,
  mode,
  onStatus,
  onTogglePaid,
  onText,
  onEdit,
  onReceipt,
  onDelete,
}: OrderRowProps) {
  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-surface p-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-bold text-ink">{order.customer_name}</p>
        <p className="text-sm tabular-nums text-muted">
          {order.order_code} · {order.phone}
        </p>
        <p className="mt-1 text-sm text-muted">
          {order.num_loads} {unitNoun(mode, order.num_loads)} ·{" "}
          <span className="font-semibold tabular-nums text-ink">
            ₱{Number(order.amount_due).toLocaleString()}
          </span>{" "}
          · {order.dropoff_date}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onTogglePaid(order.id, !order.paid)}
          aria-pressed={order.paid}
          className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-xl px-3 text-sm font-bold transition-colors ${
            order.paid
              ? "bg-success/20 text-emerald-700"
              : "bg-slate-100 text-muted hover:bg-slate-200"
          }`}
        >
          {order.paid ? (
            <Check size={16} aria-hidden="true" />
          ) : (
            <Circle size={16} aria-hidden="true" />
          )}
          {order.paid ? "Paid" : "Unpaid"}
        </button>

        <button
          type="button"
          onClick={() => onText(order)}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-primary/10 px-3 text-sm font-bold text-primary-dark transition-colors hover:bg-primary/20"
          title={order.texted_at ? "Texted — send again" : "Text customer"}
        >
          <MessageSquareText size={16} aria-hidden="true" />
          {order.texted_at ? "Texted" : "Text"}
        </button>

        <StatusControl
          id={`status-${order.id}`}
          value={order.status}
          onChange={(s) => onStatus(order.id, s)}
        />

        <button type="button" onClick={() => onEdit(order)} aria-label="Edit order" className={iconBtn}>
          <Pencil size={16} aria-hidden="true" />
        </button>
        <button type="button" onClick={() => onReceipt(order)} aria-label="Print claim stub" className={iconBtn}>
          <Printer size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(order.id)}
          aria-label="Delete order"
          className="grid h-11 w-11 place-items-center rounded-xl text-muted transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 size={16} aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}
