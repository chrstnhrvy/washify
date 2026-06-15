import { useId, useState } from "react";
import { Loader2 } from "lucide-react";
import Logo from "../../components/ui/Logo";
import { supabase } from "../../lib/supabase";
import PricingModeToggle from "./PricingModeToggle";
import { priceLabel } from "./pricing";
import type { PricingMode, Shop } from "./useShop";

type OnboardingProps = {
  shop: Shop;
  onDone: () => void;
};

/** First-login setup: name the shop and choose the pricing model. */
export default function Onboarding({ shop, onDone }: OnboardingProps) {
  const [name, setName] = useState(shop.shop_name);
  const [mode, setMode] = useState<PricingMode>(shop.pricing_mode);
  const [price, setPrice] = useState(
    mode === "per_kg" ? Number(shop.price_per_kg) : Number(shop.price_per_load),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const baseId = useId();

  function switchMode(next: PricingMode) {
    setMode(next);
    setPrice(next === "per_kg" ? Number(shop.price_per_kg) : Number(shop.price_per_load));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || price <= 0) {
      setError("Add a shop name and a price greater than zero.");
      return;
    }
    setSaving(true);
    setError(null);
    const update: Record<string, unknown> = {
      shop_name: name.trim(),
      pricing_mode: mode,
      onboarded: true,
    };
    if (mode === "per_kg") update.price_per_kg = price;
    else update.price_per_load = price;

    const { error } = await supabase.from("shops").update(update).eq("id", shop.id);
    setSaving(false);
    if (error) setError(error.message);
    else onDone();
  }

  const field = "min-h-[44px] w-full rounded-xl bg-bg px-3 text-base text-ink ring-1 ring-slate-200";

  return (
    <div className="mx-auto max-w-lg">
      <Logo />
      <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-ink">
        Welcome! Let's set up your shop
      </h1>
      <p className="mt-2 text-muted">
        You can change any of this later in Settings.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-5 rounded-2xl border border-slate-200 bg-surface p-5 shadow-card"
      >
        <div>
          <label htmlFor={`${baseId}-name`} className="text-sm font-semibold text-ink">
            Shop name
          </label>
          <input
            id={`${baseId}-name`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Happy Wash"
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
            onChange={(e) => setPrice(Number(e.target.value))}
            className={`mt-1 ${field}`}
          />
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
          {saving && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}
          Finish setup
        </button>
      </form>
    </div>
  );
}
