import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Search } from "lucide-react";
import type { AppOutletContext } from "../../app/app-context";
import Spinner from "../../components/ui/Spinner";
import OrderForm from "./OrderForm";
import OrderList from "./OrderList";
import TextCustomerModal from "./TextCustomerModal";
import { useOrders } from "./useOrders";
import { activeUnitPrice } from "../settings/pricing";
import { ORDER_STATUSES, type Order, type OrderStatus } from "./types";

export default function OrdersPage() {
  const { shop } = useOutletContext<AppOutletContext>();
  const unitPrice = activeUnitPrice(shop);
  const { orders, loading, error, addOrder, setStatus, togglePaid, markTexted } =
    useOrders(shop.id, unitPrice);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "All">("All");
  const [texting, setTexting] = useState<Order | null>(null);

  const q = query.trim().toLowerCase();
  const filtered = orders.filter((o) => {
    const matchesQuery =
      q === "" ||
      o.customer_name.toLowerCase().includes(q) ||
      o.phone.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "All" || o.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Orders</h1>
        <p className="text-muted">Add drop-offs and move them through to pickup.</p>
      </div>

      <OrderForm mode={shop.pricing_mode} unitPrice={unitPrice} onAdd={addOrder} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <label htmlFor="order-search" className="sr-only">
            Search orders
          </label>
          <input
            id="order-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or phone"
            className="min-h-[44px] w-full rounded-xl bg-surface pl-10 pr-3 text-base text-ink ring-1 ring-slate-200 placeholder:text-muted"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="status-filter" className="text-sm font-semibold text-muted">
            Status
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "All")}
            className="min-h-[44px] cursor-pointer rounded-xl bg-surface px-3 text-base font-semibold text-ink ring-1 ring-slate-200"
          >
            <option value="All">All</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      {loading ? (
        <Spinner label="Loading orders…" />
      ) : (
        <OrderList
          orders={filtered}
          mode={shop.pricing_mode}
          onStatus={setStatus}
          onTogglePaid={togglePaid}
          onText={setTexting}
        />
      )}

      {texting && (
        <TextCustomerModal
          order={texting}
          onClose={() => setTexting(null)}
          onSent={() => markTexted(texting.id)}
        />
      )}
    </div>
  );
}
