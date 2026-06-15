import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export type Shop = {
  id: string;
  shop_name: string;
  owner_name: string | null;
  price_per_load: number;
  max_kg: number;
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
      .select("id, shop_name, owner_name, price_per_load, max_kg")
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
