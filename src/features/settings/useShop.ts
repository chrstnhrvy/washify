import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export type PricingMode = "per_load" | "per_kg";

export type Shop = {
  id: string;
  shop_name: string;
  owner_name: string | null;
  pricing_mode: PricingMode;
  price_per_load: number;
  price_per_kg: number;
  max_kg: number;
  onboarded: boolean;
};

/** Loads the signed-in owner's shop row (created on first sign-in by a trigger). */
export function useShop(userId: string | undefined) {
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from("shops")
      .select(
        "id, shop_name, owner_name, pricing_mode, price_per_load, price_per_kg, max_kg, onboarded",
      )
      .eq("id", userId)
      .maybeSingle();
    setShop((data as Shop | null) ?? null);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { shop, loading, refetch: load };
}
