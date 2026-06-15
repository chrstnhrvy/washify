import type { PricingMode, Shop } from "./useShop";

/** The price for the shop's active pricing mode. */
export function activeUnitPrice(shop: Shop): number {
  return Number(
    shop.pricing_mode === "per_kg" ? shop.price_per_kg : shop.price_per_load,
  );
}

/** Quantity noun, pluralized for loads ("load"/"loads", or "kg"). */
export function unitNoun(mode: PricingMode, qty: number): string {
  if (mode === "per_kg") return "kg";
  return qty === 1 ? "load" : "loads";
}

/** Field label for the quantity input. */
export function unitLabel(mode: PricingMode): string {
  return mode === "per_kg" ? "Kilos" : "Loads";
}

/** Field label for the price input. */
export function priceLabel(mode: PricingMode): string {
  return mode === "per_kg" ? "Price per kg (₱)" : "Price per load (₱)";
}

/** Numeric input step (kg allows halves). */
export function unitStep(mode: PricingMode): number {
  return mode === "per_kg" ? 0.5 : 1;
}
