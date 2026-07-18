# Getting the Water Debt Tracker online

The app itself is built. What's left are a few steps that need your own free
accounts — I can't create accounts on your behalf, so these are for you (or
whoever's comfortable clicking through a signup) to do once. Should take
about 15-20 minutes total.

## 1. Create a free Supabase project (the shared database)

This is where all the customer/debt data actually lives, so every family
member sees the same numbers.

1. Go to https://supabase.com and sign up (free tier is enough).
2. Click **New project**. Pick any name (e.g. "water-tracker") and a
   password for the database (save it somewhere, you likely won't need it
   again).
3. Once the project is created, open the **SQL Editor** (left sidebar) →
   **New query**.
4. Open the file [`supabase/schema.sql`](supabase/schema.sql) from this
   project, copy its full contents, paste into the SQL editor, and click
   **Run**. This creates the `customers`, `family_members`, and `entries`
   tables, and seeds two starter family member names ("Dad", "Me") that you
   can rename or add to later from the app's Settings page.
5. Go to **Project Settings** (gear icon) → **API**. You'll need two values
   from this page in step 3 below:
   - **Project URL**
   - **anon public** key

## 2. Fill in your local config

1. In the `water-tracker` folder, copy `.env.local.example` to `.env.local`.
2. Paste in the Project URL and anon key from step 1.5 above:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
   ```
3. Run `npm run dev` inside `water-tracker` and open http://localhost:3000 to
   confirm it connects (the red "Supabase isn't configured" banner should be
   gone, and you should see the "Dad"/"Me" names in the recorded-by dropdown
   when adding a sale).

## 3. Deploy so the whole family can reach it

The simplest path that doesn't require setting up GitHub:

1. In the `water-tracker` folder, run `npx vercel`. It'll ask you to log in
   (opens a browser — sign up for a free Vercel account if you don't have
   one) and a few setup questions — the defaults are fine for all of them.
2. When it asks about environment variables, or once the first deploy
   finishes, go to your project on https://vercel.com → **Settings** →
   **Environment Variables** and add the same two values from step 2 above
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
3. Run `npx vercel --prod` to deploy with those variables applied.
4. Vercel gives you a URL like `water-tracker-yourname.vercel.app`. That's
   the link to share with the family.

## 4. Add it to your phone's home screen

- **Android (Chrome)**: open the link, tap the ⋮ menu → **Add to Home
  screen**.
- **iPhone (Safari)**: open the link, tap the Share icon → **Add to Home
  Screen**.

It'll open like a regular app from then on, with its own icon.

## Notes

- There's no login screen by design — anyone with the link can view and
  edit everything. The link itself is effectively the password, so don't
  post it publicly; share it directly with family.
- The app works offline: if you log a sale with no signal, it saves on your
  phone and syncs automatically next time you have a connection (look for
  the "Offline" or "Syncing..." banner at the top).
- SMS/WhatsApp payment reminders weren't built — that needs a paid
  messaging service (e.g. Twilio). The app does highlight overdue balances
  in red on the dashboard instead. If you want real text reminders later,
  that's a separate step that needs its own account/cost.
