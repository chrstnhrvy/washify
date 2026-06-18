import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Coins, Shirt, Receipt, Download, Loader2, Wallet, TrendingUp, Repeat } from "lucide-react";
import type { AppOutletContext } from "../../app/app-context";
import Spinner from "../../components/ui/Spinner";
import { useOrders } from "../orders/useOrders";
import { activeUnitPrice, unitLabel } from "../settings/pricing";
import StatCard from "./StatCard";
import BarChart from "./BarChart";
import { exportOrdersToXlsx } from "./exportXlsx";
import {
  PERIODS,
  filterByPeriod,
  filterPreviousPeriod,
  groupByDay,
  repeatCustomerRate,
  type Period,
} from "./period";

const peso = (n: number) => `₱${Math.round(n).toLocaleString()}`;

export default function DashboardPage() {
  const { shop } = useOutletContext<AppOutletContext>();
  const { orders, loading } = useOrders(shop.id, activeUnitPrice(shop));
  const qtyLabel = unitLabel(shop.pricing_mode);
  const [period, setPeriod] = useState<Period>("Week");
  const [exporting, setExporting] = useState(false);

  const inPeriod = filterByPeriod(orders, period);
  const revenue = inPeriod.reduce((sum, o) => sum + Number(o.amount_due), 0);
  const loads = inPeriod.reduce((sum, o) => sum + o.num_loads, 0);
  const daily = groupByDay(inPeriod, period);

  // Derived metrics
  const prevRevenue = filterPreviousPeriod(orders, period).reduce(
    (sum, o) => sum + Number(o.amount_due),
    0,
  );
  const delta = prevRevenue > 0 ? Math.round(((revenue - prevRevenue) / prevRevenue) * 100) : null;
  const outstanding = orders
    .filter((o) => !o.paid)
    .reduce((sum, o) => sum + Number(o.amount_due), 0);
  const avgOrder = inPeriod.length ? revenue / inPeriod.length : 0;
  const repeatRate = repeatCustomerRate(inPeriod, orders);

  async function handleExport() {
    setExporting(true);
    try {
      await exportOrdersToXlsx(inPeriod, period);
    } finally {
      setExporting(false);
    }
  }

  if (loading) return <Spinner label="Loading sales…" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">Sales</h1>
          <p className="text-muted">Your shop's totals over time.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl bg-slate-100 p-1" role="group" aria-label="Period">
            {PERIODS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                aria-pressed={period === p}
                className={`min-h-[40px] rounded-lg px-3 text-sm font-semibold transition-colors ${
                  period === p ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting || inPeriod.length === 0}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-primary px-4 text-base font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
            ) : (
              <Download size={18} aria-hidden="true" />
            )}
            Export
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Coins}
          label="Revenue"
          value={peso(revenue)}
          sub={delta === null ? undefined : `${delta >= 0 ? "+" : ""}${delta}% vs last ${period.toLowerCase()}`}
          subTone={delta === null ? "muted" : delta >= 0 ? "up" : "down"}
        />
        <StatCard icon={Shirt} label={qtyLabel} value={String(loads)} />
        <StatCard icon={Receipt} label="Orders" value={String(inPeriod.length)} />
        <StatCard icon={Wallet} label="Outstanding (unpaid)" value={peso(outstanding)} />
        <StatCard icon={TrendingUp} label="Avg order value" value={peso(avgOrder)} />
        <StatCard icon={Repeat} label="Repeat customers" value={`${repeatRate}%`} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-surface p-5 shadow-card">
          <h2 className="font-bold text-ink">Revenue per day</h2>
          <div className="mt-4">
            <BarChart
              data={daily.map((d) => ({ label: d.label, value: d.revenue }))}
              colorClass="bg-primary"
              format={peso}
              ariaLabel={`Revenue per day for the selected ${period.toLowerCase()}`}
            />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-surface p-5 shadow-card">
          <h2 className="font-bold text-ink">{qtyLabel} per day</h2>
          <div className="mt-4">
            <BarChart
              data={daily.map((d) => ({ label: d.label, value: d.loads }))}
              colorClass="bg-accent"
              ariaLabel={`${qtyLabel} per day for the selected ${period.toLowerCase()}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
