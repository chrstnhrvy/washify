import { useId, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Check, Loader2 } from "lucide-react";
import type { AppOutletContext } from "../../app/app-context";
import { supabase } from "../../lib/supabase";

export default function SettingsPage() {
  const { shop, refetchShop } = useOutletContext<AppOutletContext>();
  const [name, setName] = useState(shop.shop_name);
  const [price, setPrice] = useState(Number(shop.price_per_load));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const baseId = useId();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    const { error } = await supabase
      .from("shops")
      .update({ shop_name: name.trim(), price_per_load: price })
      .eq("id", shop.id);
    setSaving(false);
    if (error) {
      setError(error.message);
    } else {
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
        className="space-y-4 rounded-2xl border border-slate-200 bg-surface p-5 shadow-card"
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
          <label htmlFor={`${baseId}-price`} className="text-sm font-semibold text-ink">
            Price per load (₱)
          </label>
          <input
            id={`${baseId}-price`}
            type="number"
            min={0}
            value={price}
            onChange={(e) => {
              setPrice(Number(e.target.value));
              setSaved(false);
            }}
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
