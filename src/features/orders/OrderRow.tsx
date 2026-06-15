import { Check, Circle, MessageSquareText } from "lucide-react";
import StatusControl from "./StatusControl";
import type { Order, OrderStatus } from "./types";

type OrderRowProps = {
  order: Order;
  onStatus: (id: string, status: OrderStatus) => void;
  onTogglePaid: (id: string, paid: boolean) => void;
  onText: (order: Order) => void;
};

export default function OrderRow({ order, onStatus, onTogglePaid, onText }: OrderRowProps) {
  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-surface p-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-bold text-ink">{order.customer_name}</p>
        <p className="text-sm tabular-nums text-muted">
          {order.order_code} · {order.phone}
        </p>
        <p className="mt-1 text-sm text-muted">
          {order.num_loads} {order.num_loads === 1 ? "load" : "loads"} ·{" "}
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
      </div>
    </li>
  );
}
