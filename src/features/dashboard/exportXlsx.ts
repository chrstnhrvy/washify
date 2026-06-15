import type { Order } from "../orders/types";

/** Download the given orders as an .xlsx file. xlsx loads on demand. */
export async function exportOrdersToXlsx(orders: Order[], periodLabel: string) {
  const XLSX = await import("xlsx");
  const rows = orders.map((o) => ({
    Code: o.order_code,
    Customer: o.customer_name,
    Phone: o.phone,
    Loads: o.num_loads,
    "Amount Due": Number(o.amount_due),
    Status: o.status,
    Paid: o.paid ? "Yes" : "No",
    "Drop-off": o.dropoff_date,
  }));
  const sheet = XLSX.utils.json_to_sheet(rows);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Orders");
  XLSX.writeFile(book, `washify-${periodLabel.toLowerCase()}.xlsx`);
}
