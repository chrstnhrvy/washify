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
export function useOrders(shopId: string, unitPrice: number) {
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

  // Live updates: refetch when any of this shop's orders change (e.g. an
  // inbound Messenger link writes a PSID from n8n).
  useEffect(() => {
    const channel = supabase
      .channel(`orders-${shopId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `shop_id=eq.${shopId}` },
        () => void refresh(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [shopId, refresh]);

  /** Best-effort: keep the customer directory in sync (matched by phone). */
  async function upsertCustomer(name: string, phone: string) {
    const { data } = await supabase
      .from("customers")
      .select("id, visit_count")
      .eq("phone", phone)
      .order("last_visit", { ascending: false })
      .limit(1);
    const today = new Date().toISOString().slice(0, 10);
    const existing = data?.[0];
    if (existing) {
      await supabase
        .from("customers")
        .update({ name, visit_count: (existing.visit_count ?? 1) + 1, last_visit: today })
        .eq("id", existing.id);
    } else {
      await supabase.from("customers").insert({ shop_id: shopId, name, phone });
    }
  }

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
          amount_due: input.num_loads * unitPrice,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      setOrders((prev) => [data as Order, ...prev]);
      void upsertCustomer(input.customer_name, input.phone);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [shopId, unitPrice],
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

  const setMessengerPsid = useCallback(
    async (id: string, psid: string) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, messenger_psid: psid } : o)),
      );
      const { error } = await supabase
        .from("orders")
        .update({ messenger_psid: psid })
        .eq("id", id);
      if (error) void refresh();
    },
    [refresh],
  );

  const updateOrder = useCallback(
    async (id: string, fields: NewOrder) => {
      const amount = fields.num_loads * unitPrice;
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, ...fields, amount_due: amount } : o)),
      );
      const { error } = await supabase
        .from("orders")
        .update({
          customer_name: fields.customer_name,
          phone: fields.phone,
          num_loads: fields.num_loads,
          amount_due: amount,
        })
        .eq("id", id);
      if (error) void refresh();
    },
    [refresh, unitPrice],
  );

  const deleteOrder = useCallback(
    async (id: string) => {
      setOrders((prev) => prev.filter((o) => o.id !== id));
      const { error } = await supabase.from("orders").delete().eq("id", id);
      if (error) void refresh();
    },
    [refresh],
  );

  return {
    orders,
    loading,
    error,
    addOrder,
    setStatus,
    togglePaid,
    markTexted,
    setMessengerPsid,
    updateOrder,
    deleteOrder,
  };
}
