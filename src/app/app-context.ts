import type { Shop } from "../features/settings/useShop";

/** Data the AppLayout passes down to nested /app routes via <Outlet>. */
export type AppOutletContext = {
  shop: Shop;
  /** Re-read the shop row (e.g. after editing settings). */
  refetchShop: () => void;
};
