# Supabase setup for dynamic QR codes

QRx uses one Supabase project for sign-in (magic links), the `dynamic_codes`
and `scan_events` tables, and the stats functions the dashboard calls.

## 1. Create or pick a project

Any project on the free tier works at launch scale. Keep it separate from
projects that hold client or HR data: this one's anon key ships in a public
JavaScript bundle.

## 2. Apply the migration

Either:

```bash
npx supabase link --project-ref <ref>
npx supabase db push
```

or open the SQL editor in the Supabase dashboard and run
`migrations/20260928120000_dynamic_codes.sql` as is.

## 3. Configure auth

In **Authentication → URL configuration**:

- Site URL: `https://qrx.samita.in`
- Redirect URLs: `https://qrx.samita.in/**` and, for local work,
  `http://localhost:3000/**`

Magic links are enabled by default under **Authentication → Providers →
Email**. Turn off "Confirm email" if you want first-time users signed in from
the very first link.

## 4. Wire the front end

Copy `.env.example` to `.env.local` (or set the same variables as Docker build
args) with the project URL and the **anon** key from **Project settings → API**.

## 5. Deploy the redirect Worker

See `../worker/README.md`. The Worker needs the project URL and the
**service role** key as secrets. That key bypasses row-level security, so it
must never appear in the React app or in git.

## Upgrading a user to Pro

Until payments are wired up (step 3), set the plan by hand with the service
role, for example from the SQL editor:

```sql
update public.profiles set plan = 'pro' where email = 'customer@example.com';
```

Plan limits are rows in `plan_limits` and are enforced by a trigger and by the
stats functions, so changing them there changes them everywhere. Keep
`PLANS` in `src/qrTypes/registry.mjs` in sync for the UI copy.
