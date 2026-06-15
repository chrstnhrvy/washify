import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { Order, OrderStatus } from "./types";

export type NewOrder = {
  customer_name: string;
  phone: string;
  num_loads: number;
};

/**
 * Loads and mutates the signed-in shop's orders. Reads are scoped automatically
 * by RLS (shop_id = auth.uid()); writes pass shop_id explicitly.
 */
export function useOrders(shopId: string, pricePerLoad: number) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else {
      setOrders((data ?? []) as Order[]);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addOrder = useCallback(
    async (input: NewOrder) => {
      const { count } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true });
      const code = `WSH-${String((count ?? 0) + 1).padStart(4, "0")}`;

      const { data, error } = await supabase
        .from("orders")
        .insert({
          shop_id: shopId,
          order_code: code,
          customer_name: input.customer_name,
          phone: input.phone,
          num_loads: input.num_loads,
          amount_due: input.num_loads * pricePerLoad,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      setOrders((prev) => [data as Order, ...prev]);
    },
    [shopId, pricePerLoad],
  );

  const setStatus = useCallback(
    async (id: string, status: OrderStatus) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o)),
      );
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", id);
      if (error) void refresh();
    },
    [refresh],
  );

  const togglePaid = useCallback(
    async (id: string, paid: boolean) => {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, paid } : o)));
      const { error } = await supabase
        .from("orders")
        .update({ paid })
        .eq("id", id);
      if (error) void refresh();
    },
    [refresh],
  );

  const markTexted = useCallback(async (id: string) => {
    const when = new Date().toISOString();
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, texted_at: when } : o)),
    );
    const { error } = await supabase
      .from("orders")
      .update({ texted_at: when })
      .eq("id", id);
    if (error) void refresh();
  }, [refresh]);

  return { orders, loading, error, addOrder, setStatus, togglePaid, markTexted };
}
