# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"QRx" is a client-only QR code generator built with Create React App (react-scripts 5), React 17 and Ant Design 5. There is no backend: QR images are produced in the browser by the `qrcode` npm package and downloaded as data URLs. The production Docker image builds the app and serves `build/` from nginx (`Dockerfile`, `nginx.conf`, `docker-compose.yml`).

## Commands

```bash
npm ci                                   # install (lockfile present)
npm start                                # dev server on http://localhost:3000
npm run build                            # react-scripts build, then postbuild: prerender every route + write build/sitemap.xml
SKIP_PRERENDER=1 npm run build           # build without Chromium (crawlers would get an empty shell; never deploy this)
PRERENDER_CHROMIUM=/path/to/chrome npm run prerender   # rerun only the prerender step against an existing build/
CI=true npm run build                    # what Docker/CI effectively do: ESLint warnings become errors
npm run lint                             # eslint over src/ and scripts/ (CRA "react-app" preset); also lint worker/src before pushing
cd worker && npm run deploy              # deploy the Cloudflare redirect Worker (needs wrangler login + secrets, see worker/README.md)
CI=true npx react-scripts test --watchAll=false            # run all tests once, non-interactive
CI=true npx react-scripts test --watchAll=false src/App.test.js   # run a single test file
npx react-scripts test -t "pattern"      # run tests whose name matches, in watch mode
```

Notes on current state (verified):
- `CI=true npm run build` treats every ESLint warning as an error, and Docker/CI runners set `CI`. Keep lint at zero warnings before pushing.
- The prerender step (`scripts/prerender.mjs`) needs a Chromium binary. It checks `$PRERENDER_CHROMIUM`, then `/opt/pw-browsers/chromium` (Claude Code cloud sessions), then the usual Linux paths, then playwright-core's own lookup. The Dockerfile installs Alpine's chromium. It aborts the build on any page JS error, so a runtime crash on a route fails `npm run build` rather than shipping.
- `src/setupTests.js` mocks `window.matchMedia` and `window.scrollTo`, because antd's responsive grid calls the former on mount and the form page calls the latter, and jsdom implements neither.
- Tests and the default build run with no `REACT_APP_SUPABASE_*` variables, so every dynamic-code feature is hidden and `supabase` is `null`. To exercise those UI paths locally, build with placeholder values (`REACT_APP_SUPABASE_URL=https://x.supabase.co REACT_APP_SUPABASE_ANON_KEY=x npm run build`); the prerender still succeeds because auth resolves client-side.
- The Worker has no test runner of its own. Its handler is plain ESM that runs under Node 22 (global `fetch`, `Request`, `Response`, `crypto.subtle`), so it can be exercised by importing `worker/src/index.js` and stubbing `globalThis.fetch`.

## Architecture

Multi-page SEO site with React Router (`react-router-dom` v6) and build-time prerendering:
- `src/qrTypes/registry.mjs` is the single source of truth for every QR type: `key`, URL `slug`, labels, `isReady(values)` (when to auto-generate), `buildPayload(values)` (form values to the encoded string), and the page's SEO copy (`title`, `description`, `h1`, `intro`, `steps`, `faq`). It is dependency-free ESM on purpose: the Node build scripts import it directly, so it must never import React, antd or anything webpack-only. `src/qrTypes/index.js` re-exports it with the icon and form component attached per key.
- Routes live in `src/App.js`: `/` (landing), `/:slug` (a type page, 404s redirect home), and `/form?type=<key>` (legacy pre-router URLs, redirected to the slug). The header logo and every home-page card are real `<Link>`s so crawlers can discover each page.
- `src/hooks/useSeo.js` writes `document.title`, description, canonical, Open Graph and Twitter tags, and optional JSON-LD into `<head>` on every page. The prerender snapshot captures those tags, so per-page SEO works without server rendering.
- `scripts/prerender.mjs` runs after `react-scripts build`: serves `build/`, opens every route from the registry in headless Chromium, and writes the rendered DOM to `build/<slug>.html` (the home page overwrites `build/index.html`). It stamps `data-prerendered="<path>"` on `#root`; `src/index.js` hydrates only when that matches the current path and otherwise renders from scratch, so the SPA fallback never hydrates mismatched markup. `nginx.conf` uses `try_files $uri $uri.html $uri/ /index.html` to serve those files without trailing-slash redirects. `scripts/generate-sitemap.mjs` writes `build/sitemap.xml` from the same registry.
- `pages/QRCodeForm.jsx` is the generator page. It owns a single antd `Form` whose values are the union of the type-specific fields and the shared customization fields, renders the type's `Form` component, the preview, and `components/common/SeoContent` (how-to steps and FAQ, the crawlable text that gives each page something to rank for).

Data flow inside `QRCodeForm`:
1. The type's `Form` component (from `components/forms/qr-types/*Form`) contains only `Form.Item`s; it renders inside the parent `Form` and does not manage state. Field `name`s are the contract between the form component and the type's `buildPayload` in the registry.
2. `components/forms/QRCodeCustomization` adds the shared `option*` fields (`optionImageType`, `optionMargin`, `optionQuality`, `optionDarkColor`, `optionLightColor`, `optionMaskPattern`, `optionWidth`, `errorCorrectionLevel`). Defaults come from `getDefaultQRCodeOptions()` in `utils/qrCodeGenerator.js` and are passed as `initialValues`.
3. `onValuesChange` regenerates on every keystroke once `type.isReady(values)` is true; the submit button runs the same path with validation.
4. `type.buildPayload(values)` produces the string, then `generateQRCode(qrData, values)` in `utils/qrCodeGenerator.js` maps `option*` fields onto `qrcode` library options. SVG is special-cased through `QRCode.toString({type:"svg"})` and wrapped in a `data:image/svg+xml` URL; raster types go through `QRCode.toDataURL`. It returns `{url, mime}`, and the MIME drives the download file extension.
5. `components/common/QRCodePreview` is presentational: shows the image or spinner, the download button, and an optional dump of the raw payload string.

Adding a new QR type means: one entry in `registry.mjs` (with SEO copy), one `qr-types/<Name>Form` component, and one line mapping the key to its icon and form in `qrTypes/index.js`. The route, home-page card, sitemap entry and prerendered page follow automatically. Add payload tests to `src/qrTypes/registry.test.js`.

## Dynamic codes (Supabase + Cloudflare Worker)

Static generation stays fully client-side. Dynamic codes add three parts, all optional and all disabled when `REACT_APP_SUPABASE_URL`/`REACT_APP_SUPABASE_ANON_KEY` are unset (`src/lib/supabase.js` exports `supabase = null` and `isDynamicEnabled()`):

- **Database** (`supabase/migrations/20260928120000_dynamic_codes.sql`): `profiles` (one per auth user, `plan` = free|pro, created by a trigger on `auth.users`), `plan_limits` (max active codes, history days), `dynamic_codes` (owner, unique `short_code`, `destination` must be http(s), `archived_at`), and `scan_events` (one row per scan, no IP; `visitor_hash` = sha256 of ip|ua|code|day). Row-level security: owners read/write their own codes; per-scan rows are readable only by Pro owners; nobody but the service role inserts scans. A `before insert` trigger enforces the plan's code limit, so the client-side check is cosmetic. Aggregates come from two `security definer` RPCs, `list_code_stats()` and `get_code_stats(uuid)`, which clip history to the plan window and return country/device breakdowns only for Pro.
- **Redirect Worker** (`worker/src/index.js`): `GET /<code>` or `/r/<code>` looks the code up through Supabase REST with the service-role key (secret), returns a 302 with `Cache-Control: no-store`, and in `ctx.waitUntil` inserts a `scan_events` row with `request.cf` geo and the UA classification from `src/lib/parseUserAgent.mjs` (shared with the app's tests; keep it import-free). Known crawlers and HEAD requests are redirected but not counted. Dynamic codes encode `REDIRECT_BASE/<short_code>` where `REDIRECT_BASE` comes from `REACT_APP_REDIRECT_BASE` (default `<SITE_URL>/r`); changing it after codes are printed breaks them.
- **App**: `src/auth/AuthProvider.jsx` holds the session and profile and exports `RequireAuth` for `/dashboard` and `/dashboard/codes/:id` (both `noindex`, both excluded in `robots.txt`). `src/lib/dynamicCodes.js` is the only data-access module. `components/common/DynamicCodePanel` sits under the preview on types flagged `dynamicCapable` in the registry (only http(s) payloads: url, whatsapp, maps, because a 302 to `mailto:`/`tel:`/`upi:` is unreliable on phones); when the visitor is signed out it parks the draft in `sessionStorage` and `Dashboard` creates it after the magic link returns. `pages/CodeDetail.jsx` renders the QR of the short URL with the same `QRCodeCustomization` form, lets the owner edit the destination or archive the code, and shows aggregates for everyone and per-scan tables for Pro. Plan copy in the UI reads `PLANS` from the registry; the numbers must match `plan_limits` in the migration.

Other things worth knowing:
- Colour pickers: antd `ColorPicker` yields a colour object once touched but the default is a hex string, so `generateQRCode` handles both (`typeof === "string"` vs `.toHexString()`). Keep that when adding colour fields.
- Theme tokens (primary `#392B58`, background `#ebe9ee`) are set once in the antd `ConfigProvider` in `App.js` and repeated as literals in a few components and in the default QR colours.
- Each component lives in its own folder with `index.jsx` and a `styles.css` imported by the component.
- The site URL (`https://qrx.samita.in`) is a constant in the registry and is used for canonicals and the sitemap. `public/index.html` still carries the static default meta tags and analytics snippet.
