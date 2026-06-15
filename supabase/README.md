# `supabase/` — Database schema, RLS & SQL

SQL you run in the Supabase SQL Editor (phase 3). Keep these in version control
so the multi-tenant setup is reproducible.

**Future files:**
- `schema.sql` — `shops`, `orders`, `customers`, `faq_documents` tables.
- `rls.sql` — Row Level Security policies (`shop_id = auth.uid()`).
- `match_documents.sql` — pgvector similarity function (vector(768), Gemini).
- `provision_shop.sql` — trigger creating a shop row on first sign-in.

The importable n8n workflow JSONs live in the top-level `n8n/` folder.
