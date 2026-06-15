# Phase 2 Setup — Supabase Auth (Google Sign-in)

Follow these once. Total time: about 15 minutes. After this, the "Get Started"
buttons do a real Google login and land you in `/app` with your own shop.

---

## 1. Create a Supabase project

1. Go to <https://supabase.com> and sign in.
2. **New project** → give it a name (e.g. `washify`), set a database password
   (save it somewhere), pick the closest region. Wait for it to finish.

## 2. Create the database tables

1. In the project, open **SQL Editor** → **New query**.
2. Run each of these files from the repo, in order (paste the contents, click
   **Run**):
   1. `supabase/schema.sql` — creates `shops`, `orders`, `customers`
   2. `supabase/rls.sql` — turns on Row Level Security
   3. `supabase/provision_shop.sql` — auto-creates your shop on first sign-in

## 3. Get your API keys

1. **Project Settings → API**.
2. Copy the **Project URL** and the **anon public** key.
3. In the repo root, create a file named `.env` (copy `.env.example`) and fill in:
   ```
   VITE_N8N_BASE_URL=http://localhost:5678/webhook
   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY
   ```
   > Restart `npm run dev` after editing `.env` — Vite only reads it on startup.

## 4. Set up Google as a login provider

This has two sides: Google Cloud (issues the credentials) and Supabase (uses them).

### 4a. Google Cloud Console
1. Go to <https://console.cloud.google.com> → create/select a project.
2. **APIs & Services → OAuth consent screen** → choose **External** → fill the
   app name + your email → save. Add yourself under **Test users**.
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
   - Application type: **Web application**.
   - **Authorized redirect URI** — paste your Supabase callback (find the exact
     value in Supabase step 4b; it looks like):
     ```
     https://YOUR-PROJECT.supabase.co/auth/v1/callback
     ```
   - Create, then copy the **Client ID** and **Client secret**.

### 4b. Supabase
1. **Authentication → Providers → Google** → enable it.
2. Paste the **Client ID** and **Client secret** from Google. Save.
   (This screen also shows the exact callback URL to use in step 4a.)

## 5. Allow your app's URLs

In Supabase: **Authentication → URL Configuration**.
- **Site URL:** `http://localhost:5173`
- **Redirect URLs:** add `http://localhost:5173/app`
  (later, also add your Vercel URLs, e.g. `https://washify.vercel.app` and
  `https://washify.vercel.app/app`).

---

## 6. Try it

```bash
npm run dev
```
Open <http://localhost:5173>, click **Get Started with Google**, pick your
account. You should land on `/app` showing **"<your name>'s Laundry"** and your
email. Click **Sign out** to return to the landing page.

### If something's off
- **Lands back on the landing page after login:** the redirect URL isn't allowed
  — recheck step 5 (must include `/app`).
- **Google error "redirect_uri_mismatch":** the URI in Google (step 4a) must
  exactly match Supabase's callback (step 4b).
- **"No shop profile found" banner in /app:** `provision_shop.sql` wasn't run, or
  you signed in before running it. Run it, then sign out and back in.
- **Buttons do nothing / console warns about Supabase:** `.env` is missing keys
  or the dev server wasn't restarted after editing `.env`.
