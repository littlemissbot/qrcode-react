# QR Code Generator

A modern, user-friendly web application for generating customizable QR codes. Built with React and Ant Design, this application allows users to create QR codes with various customization options.

## Features

- Generate QR codes for website URLs, vCards, WiFi, email, SMS, phone numbers, plain text, UPI payments, WhatsApp chats and Google Maps locations
- Every generator has its own indexable page (for example `/wifi-qr-code-generator`) with prerendered HTML, its own meta tags and FAQ structured data
- Customize QR code appearance:
  - Multiple image formats (PNG, JPEG, WebP)
  - Adjustable margin size
  - Quality settings
  - Custom QR code color
  - Custom background color
  - Mask pattern selection
  - Adjustable width
- Download generated QR codes
- URL validation for secure (https) links
- Fully client-side for static codes: nothing you enter is uploaded anywhere
- Optional dynamic QR codes (URL, WhatsApp and Google Maps types): a short link you can redirect later, with scan counts, unique visitors and per-day totals; Pro accounts also see location, device and browser per scan
- Modern, responsive UI using Ant Design
- Real-time QR code preview

## Prerequisites

- Node.js (version 18 or higher)
- npm (comes with Node.js)
- Chromium, for the prerender step of `npm run build` (the Docker image installs it; locally, point `PRERENDER_CHROMIUM` at any Chrome/Chromium binary or set `SKIP_PRERENDER=1`)
- Docker and Docker Compose (for containerized deployment)

## Installation

### Local Development

1. Clone the repository:

```bash
git clone https://github.com/yourusername/qrcode-react.git
cd qrcode-react
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

The application will open in your default browser at [http://localhost:3000](http://localhost:3000).

### Docker Deployment

#### Development Mode

```bash
docker-compose up app-dev
```

#### Production Mode

```bash
docker-compose up app-prod
```

The production application will be available at [http://localhost](http://localhost).

## Usage

1. Pick a QR code type on the home page, or open its page directly (`/upi-qr-code-generator`, `/wifi-qr-code-generator`, ...)
2. Fill in the fields for that type. The preview updates as you type
3. Customize the QR code using the available options:
   - Select image type (PNG, JPEG, WebP)
   - Adjust margin using the slider
   - Set quality using the slider
   - Choose QR code color using the color picker
   - Choose background color using the color picker
   - Set mask pattern (0-7)
   - Adjust width (200-1200px)
4. Click the generate button to create the QR code
5. Download the generated QR code using the download button

## Dynamic QR codes and scan analytics

Static codes need no backend. Dynamic codes need two extra pieces, both optional:

1. **A Supabase project** for magic-link sign-in, the `dynamic_codes` and `scan_events` tables and the stats functions. Apply `supabase/migrations/*.sql` and follow `supabase/README.md`.
2. **The redirect Worker** in `worker/`, deployed to Cloudflare. It answers `<REACT_APP_REDIRECT_BASE>/<short_code>` with a 302 and logs the scan. See `worker/README.md`.

Then copy `.env.example` to `.env.local` and fill in `REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY` and `REACT_APP_REDIRECT_BASE`. When those are empty the app hides every dynamic feature and behaves as a static generator.

Plans: Free gets 3 active dynamic codes with total and unique scans over the last 90 days. Pro gets 100 codes, unlimited history and per-scan location, device and browser. Limits live in the `plan_limits` table and are enforced in the database.

## Adding a QR code type

All types are defined in `src/qrTypes/registry.mjs` (slug, labels, payload builder, SEO copy) and wired to a form component and icon in `src/qrTypes/index.js`. Adding an entry there plus a form under `src/components/forms/qr-types/` gives you a new page, a home-page card, a sitemap entry and a prerendered HTML file with no other changes.

## Technologies Used

- React 17.0.2
- Ant Design (antd) 5.9.2
- QRCode library 1.5.0
- Create React App

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run lint` - Lints `src/` and `scripts/`
- `npm run build` - Builds the app for production, then prerenders every route to static HTML and writes `build/sitemap.xml`
- `npm run prerender` / `npm run sitemap` - Run those two post-build steps on their own
- `npm run eject` - Ejects from Create React App

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

Samita Mondal
