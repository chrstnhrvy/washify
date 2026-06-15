export const ORDER_STATUSES = [
  "Received",
  "Washing",
  "Ready",
  "Picked up",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type Order = {
  id: string;
  shop_id: string;
  order_code: string | null;
  customer_name: string;
  phone: string;
  num_loads: number;
  amount_due: number;
  dropoff_date: string;
  status: OrderStatus;
  paid: boolean;
  texted_at: string | null;
  created_at: string;
};

/** Badge colors per status (semantic tokens, not raw hex). */
export const STATUS_STYLES: Record<OrderStatus, string> = {
  Received: "bg-slate-100 text-slate-700",
  Washing: "bg-primary/15 text-primary-dark",
  Ready: "bg-success/20 text-emerald-700",
  "Picked up": "bg-slate-200 text-slate-500",
};
