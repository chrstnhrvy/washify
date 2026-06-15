import type { Order } from "../orders/types";

export const PERIODS = ["Day", "Week", "Month"] as const;
export type Period = (typeof PERIODS)[number];

export function periodDays(p: Period): number {
  return p === "Day" ? 1 : p === "Week" ? 7 : 30;
}

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Orders created within the trailing window for the period (incl. today). */
export function filterByPeriod(orders: Order[], p: Period): Order[] {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (periodDays(p) - 1));
  return orders.filter((o) => new Date(o.created_at) >= start);
}

export type DayBucket = { label: string; revenue: number; loads: number };

/** Revenue and loads totaled per day across the period window. */
export function groupByDay(orders: Order[], p: Period): DayBucket[] {
  const days = periodDays(p);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const order: string[] = [];
  const map = new Map<string, DayBucket>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = dateKey(d);
    order.push(key);
    map.set(key, {
      label: d.toLocaleDateString(undefined, { month: "numeric", day: "numeric" }),
      revenue: 0,
      loads: 0,
    });
  }

  for (const o of orders) {
    const bucket = map.get(dateKey(new Date(o.created_at)));
    if (bucket) {
      bucket.revenue += Number(o.amount_due);
      bucket.loads += o.num_loads;
    }
  }

  return order.map((k) => map.get(k)!);
}
