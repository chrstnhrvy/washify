import { useId, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Check, Loader2 } from "lucide-react";
import type { AppOutletContext } from "../../app/app-context";
import { supabase } from "../../lib/supabase";
import PricingModeToggle from "./PricingModeToggle";
import { priceLabel } from "./pricing";
import type { PricingMode } from "./useShop";

export default function SettingsPage() {
  const { shop, refetchShop } = useOutletContext<AppOutletContext>();
  const [name, setName] = useState(shop.shop_name);
  const [mode, setMode] = useState<PricingMode>(shop.pricing_mode);
  const [price, setPrice] = useState(
    shop.pricing_mode === "per_kg"
      ? Number(shop.price_per_kg)
      : Number(shop.price_per_load),
  );
  const [pageId, setPageId] = useState(shop.messenger_page_id ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const baseId = useId();

  function switchMode(next: PricingMode) {
    setMode(next);
    setPrice(next === "per_kg" ? Number(shop.price_per_kg) : Number(shop.price_per_load));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    const update: Record<string, unknown> = {
      shop_name: name.trim(),
      pricing_mode: mode,
      messenger_page_id: pageId.trim() || null,
    };
    if (mode === "per_kg") update.price_per_kg = price;
    else update.price_per_load = price;

    const { error } = await supabase.from("shops").update(update).eq("id", shop.id);
    setSaving(false);
    if (error) setError(error.message);
    else {
      setSaved(true);
      refetchShop();
    }
  }

  const field = "min-h-[44px] w-full rounded-xl bg-bg px-3 text-base text-ink ring-1 ring-slate-200";

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Settings</h1>
        <p className="text-muted">Update your shop name and pricing.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-slate-200 bg-surface p-5 shadow-card"
      >
        <div>
          <label htmlFor={`${baseId}-name`} className="text-sm font-semibold text-ink">
            Shop name
          </label>
          <input
            id={`${baseId}-name`}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }}
            className={`mt-1 ${field}`}
          />
        </div>

        <div>
          <span className="text-sm font-semibold text-ink">How do you charge?</span>
          <div className="mt-1">
            <PricingModeToggle value={mode} onChange={switchMode} />
          </div>
        </div>

        <div>
          <label htmlFor={`${baseId}-price`} className="text-sm font-semibold text-ink">
            {priceLabel(mode)}
          </label>
          <input
            id={`${baseId}-price`}
            type="number"
            min={0}
            step="any"
            value={price}
            onChange={(e) => {
              setPrice(Number(e.target.value));
              setSaved(false);
            }}
            className={`mt-1 ${field}`}
          />
        </div>

        <div>
          <label htmlFor={`${baseId}-page`} className="text-sm font-semibold text-ink">
            Facebook Page ID (for Messenger)
          </label>
          <input
            id={`${baseId}-page`}
            value={pageId}
            onChange={(e) => {
              setPageId(e.target.value);
              setSaved(false);
            }}
            placeholder="e.g. 1183045104892705"
            className={`mt-1 ${field}`}
          />
          <p className="mt-1 text-xs text-muted">
            Optional. Enables the Messenger connect QR on orders. Leave blank if
            you only use SMS.
          </p>
        </div>

        {error && (
          <p role="alert" className="text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving || name.trim() === ""}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-primary px-5 text-base font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={18} className="animate-spin" aria-hidden="true" />
          ) : saved ? (
            <Check size={18} aria-hidden="true" />
          ) : null}
          {saved ? "Saved" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
