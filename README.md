# Water Debt Tracker

A shared, installable web app for tracking who owes what for water deliveries.
Built with Claude Code; this file is the handoff doc for continuing the work
in VS Code (or any editor).

## The problem this solves

The family sells water to regular customers, often on credit. Debt was being
tracked informally (memory/paper), so nobody could reliably answer "who owes
what," "who logged this sale," or "how much is outstanding overall." The goal
is a simple website that installs like an app ("Add to Home Screen") that any
family member can open to log sales/payments and see the same shared,
up-to-date picture of who owes what.

## Key decisions (already made, don't relitigate without reason)

These came out of a back-and-forth with the project owner — they're
intentional trade-offs, not oversights:

- **No login/password, anywhere.** Anyone with the link can open the app and
  see/edit everything. This was an explicit choice for simplicity over
  access control. Mitigation: the app isn't search-indexed (`public/robots.txt`
  disallows all), so the link itself is the only way in — treat it like a
  password when sharing it.
- **No individual accounts, but entries are still attributed.** Every sale/
  payment has a "recorded by" dropdown (family member names, editable in
  Settings) so you can tell who logged what, without the complexity of real
  auth. This directly solves the original "we don't know who did what"
  complaint.
- **Offline matters.** Deliveries sometimes happen with no signal, so writes
  always land in local storage first (Dexie/IndexedDB) and sync to Supabase
  in the background when a connection is available.
- **No paid SMS/WhatsApp reminders (yet).** That needs a paid third-party
  service (e.g. Twilio) and an account the project owner would need to set
  up themselves. v1 does in-app overdue highlighting instead (red flag on
  the dashboard for balances unpaid past `OVERDUE_DAYS`).
- **Currency is a placeholder.** `src/lib/config.ts` hardcodes `$` — change
  it to match the local currency.

## Tech stack

- **Next.js 16** (App Router, TypeScript, Tailwind v4) — see
  `AGENTS.md`/`CLAUDE.md` in this folder: this Next.js version may differ
  from what's in an LLM's training data, so check
  `node_modules/next/dist/docs/` before assuming an API.
- **Supabase** (hosted Postgres) — the shared database every family member's
  browser reads/writes to. Not yet connected to a real project; see
  "Current status" below.
- **Dexie.js** — IndexedDB wrapper for the local-first cache and offline
  write queue.
- **Service worker + manifest** — makes the app installable to a phone home
  screen. Registered in production only (see "Known gotcha" below).
- **Vercel** — intended hosting, not yet deployed.

## Architecture

```
src/lib/types.ts       Customer / FamilyMember / Entry TypeScript types
src/lib/supabase.ts     Supabase client. Falls back to placeholder creds so
                        build/prerender doesn't crash before real creds
                        exist; isSupabaseConfigured flags whether it's real.
src/lib/db.ts           Dexie (IndexedDB) schema: customers, familyMembers,
                        entries tables. entries has a `pending` flag for
                        rows created offline that still need to sync.
src/lib/sync.ts         All read/write logic: pullAll() (Supabase -> Dexie),
                        pushPending() (Dexie -> Supabase), syncNow(),
                        startBackgroundSync() (runs on mount + online event +
                        30s interval), and mutation helpers (addEntry,
                        addCustomer, addFamilyMember, delete*, rename*).
                        Every mutation writes to Dexie first, Supabase second
                        — the UI never blocks on network.
src/lib/hooks.ts        React hooks (useLiveQuery from dexie-react-hooks)
                        that read from the local Dexie cache. Includes the
                        balance/overdue calculation
                        (useCustomersWithBalances).
src/lib/format.ts       Money/date formatting helpers.
src/lib/config.ts       CURRENCY_SYMBOL, OVERDUE_DAYS constants.

src/app/page.tsx                    Dashboard: customer list by balance,
                                     overdue highlighting, total outstanding.
src/app/customers/[id]/page.tsx     Customer detail: full entry history,
                                     running balance, quick add sale/payment.
src/app/sales/new/page.tsx          Wraps EntryForm (type="sale") in Suspense
                                     (required because it reads useSearchParams).
src/app/payments/new/page.tsx       Same, type="payment".
src/app/reports/page.tsx            Weekly/monthly sales, total outstanding,
                                     total collected, top debtors.
src/app/settings/page.tsx           Manage family member names and customers
                                     (add/rename/delete).
src/app/layout.tsx                  Root layout: PWA metadata (manifest,
                                     icons, appleWebApp), Header, AppProviders.
src/app/providers.tsx               Client wrapper: registers the service
                                     worker (prod only) and starts background
                                     sync on mount.

src/components/EntryForm.tsx        Shared form for both sale and payment
                                     entry (customer picker, amount, quantity
                                     [sale only], recorded-by, date, note).
src/components/CustomerPicker.tsx   <select> of existing customers + inline
                                     "add new customer" flow.
src/components/RecordedByPicker.tsx Same pattern for family member names.
src/components/Header.tsx           Top nav + SyncStatus + ConfigWarning.
src/components/SyncStatus.tsx       Shows an "Offline" / "Syncing..." banner
                                     when relevant; hidden otherwise.
src/components/ConfigWarning.tsx    Red banner shown when Supabase env vars
                                     aren't set yet.

supabase/schema.sql     Run this in the Supabase SQL editor once a project
                        exists. Creates customers/family_members/entries
                        tables with permissive RLS policies (open access,
                        matching the no-login decision) and seeds two
                        starter family member names.
public/manifest.json    PWA manifest (name, icons, theme color).
public/sw.js            App-shell service worker (cache-first for the shell
                        so the app opens with no signal; never caches
                        Supabase API calls).
public/icon-*.png       Generated by scripts/make_icon.py (pure-Python PNG
                        generator, no image libs needed — regenerate with
                        `python scripts/make_icon.py public` if you want a
                        different icon).
public/robots.txt       Disallows all crawling (no-login privacy mitigation).
.env.local.example      Template for NEXT_PUBLIC_SUPABASE_URL /
                        NEXT_PUBLIC_SUPABASE_ANON_KEY.
SETUP.md                 Step-by-step, non-technical instructions for
                        creating the Supabase project and deploying to
                        Vercel. Written for the project owner, not a dev.
```

## Current status

**Built and verified working** (via a local dev server, exercised through
the actual UI): dashboard, add sale/add payment forms with inline customer
and family-member creation, customer detail page with running balance,
reports aggregation, settings (add family members/customers; rename/delete
customers). Type-checks clean (`npx tsc --noEmit`), lints clean
(`npm run lint`), builds clean (`npm run build`).

**Not yet done:**
- No real Supabase project connected — the app currently only has local
  (per-browser) data via Dexie. `SETUP.md` has the steps; they need real
  accounts the project owner has to create themselves.
- Not deployed to Vercel yet.
- Delete-customer/delete-family-member flows use the browser's native
  `confirm()` — works fine for real users, just couldn't be driven by
  browser automation during testing (blocking modal), so double check by
  hand.
- No automated test suite — everything was verified by hand through the UI.

## Known gotcha (already fixed once, don't reintroduce)

The service worker is registered **only when `NODE_ENV === "production"`**
(see `src/app/providers.tsx`). Registering it in dev caused an infinite
reload loop: Next's dev server rebuilds constantly, but a cache-first SW
kept serving a stale `/` that mismatched the fresh JS bundle, so Next forced
a reload, which hit the stale cache again, forever. If you ever see the dev
server logging endless `GET /` requests, this is almost certainly it — check
for a registered SW in devtools (Application → Service Workers) and
unregister it.

## How to continue in VS Code

1. Open this `water-tracker` folder directly in VS Code (not the parent
   folder — its name has spaces/parentheses that break npm package naming,
   which is why the project lives in this subfolder to begin with).
2. `npm install` if `node_modules` isn't already there.
3. Follow `SETUP.md` to connect a real Supabase project (needed for any
   multi-device/multi-person testing — without it the app still runs, just
   with data trapped in one browser's local storage).
4. `npm run dev` and open http://localhost:3000.

## Natural next steps

- Wire up the Supabase project and confirm sync works across two browsers.
- Deploy to Vercel, add it to a phone home screen, test with real offline
  conditions (airplane mode) rather than just the local Dexie cache.
- Consider making `OVERDUE_DAYS` and `CURRENCY_SYMBOL` editable from the
  Settings page instead of hardcoded in `src/lib/config.ts`.
- If real SMS/WhatsApp reminders are wanted later, that's a new scope
  requiring a paid provider account (Twilio or similar) — needs explicit
  go-ahead before setting anything up.
