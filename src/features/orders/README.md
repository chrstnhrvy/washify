# `features/orders/` — Orders (phase 4) + Text Customer (phase 6)

Order entry, list, status pipeline (Received → Washing → Ready → Picked up),
search/filter, and the **Text Customer** button/modal that calls
`sendSms()` from `src/lib/n8n.ts` (160-char limit, confirm before send).

**Future files:** `OrderForm.tsx`, `OrderList.tsx`, `StatusPill.tsx`,
`TextCustomerModal.tsx`, `useOrders.ts`.
