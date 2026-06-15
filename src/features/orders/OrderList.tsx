import { Inbox } from "lucide-react";
import OrderRow from "./OrderRow";
import type { Order, OrderStatus } from "./types";

type OrderListProps = {
  orders: Order[];
  onStatus: (id: string, status: OrderStatus) => void;
  onTogglePaid: (id: string, paid: boolean) => void;
  onText: (order: Order) => void;
};

export default function OrderList({ orders, onStatus, onTogglePaid, onText }: OrderListProps) {
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-surface p-10 text-center">
        <Inbox size={28} className="mx-auto text-muted" aria-hidden="true" />
        <p className="mt-3 font-semibold text-ink">No orders to show</p>
        <p className="mt-1 text-sm text-muted">
          Add your first order above, or adjust your search.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {orders.map((order) => (
        <OrderRow
          key={order.id}
          order={order}
          onStatus={onStatus}
          onTogglePaid={onTogglePaid}
          onText={onText}
        />
      ))}
    </ul>
  );
}
