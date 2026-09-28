# QRx redirect Worker

Cloudflare Worker that turns `https://<redirect-base>/<short_code>` into a
302 to the code's current destination and logs the scan to Supabase.

Why a Worker rather than a Supabase edge function: Cloudflare supplies the
visitor's country, region and city on every request at no cost, and the free
plan covers 100,000 requests a day. The Worker holds the Supabase service
role key as a secret; nothing else in the project may use that key.

## Deploy

```bash
cd worker
npm install
npx wrangler login
npx wrangler secret put SUPABASE_URL              # https://<ref>.supabase.co
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY  # Project settings → API → service_role
npm run deploy
```

The first deploy gives you `https://qrx-redirect.<account>.workers.dev`. Set
`REACT_APP_REDIRECT_BASE` to that URL (no trailing slash) and rebuild the
site; every dynamic QR code will then encode
`https://qrx-redirect.<account>.workers.dev/<short_code>`.

## Short URLs on your own domain

When `samita.in` is proxied through Cloudflare, uncomment the `[[routes]]`
block in `wrangler.toml` and redeploy. Codes then encode
`https://qrx.samita.in/r/<short_code>`, which is the default
`REACT_APP_REDIRECT_BASE`. Existing codes keep working only if the old base
also keeps resolving, so pick the final base before handing out codes.

## Local testing

```bash
cp .dev.vars.example .dev.vars   # fill in the two secrets
npm run dev
curl -I http://localhost:8787/<short_code>
```

`npm run tail` streams live logs from the deployed Worker.

## What gets stored per scan

Timestamp, country/region/city, device class, browser family, OS family, the
referring hostname when present, and a SHA-256 of IP + user agent + code +
day used only to count unique visitors. The IP address itself is never
stored. Requests from known crawlers and link-preview bots are redirected but
not counted.
