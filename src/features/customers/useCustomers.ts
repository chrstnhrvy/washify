import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export type Customer = {
  id: string;
  name: string;
  phone: string;
  visit_count: number;
  last_visit: string;
  messenger_psid: string | null;
};

/** Loads the shop's saved customers (scoped by RLS), newest visit first. */
export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("customers")
      .select("id, name, phone, visit_count, last_visit, messenger_psid")
      .order("last_visit", { ascending: false });
    setCustomers((data ?? []) as Customer[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { customers, loading, refresh };
}
