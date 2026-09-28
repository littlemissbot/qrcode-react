// Writes build/sitemap.xml from the QR type registry so a new type page is
// never missing from the sitemap. Runs after `react-scripts build`.

import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { qrTypes, SITE_URL } from "../src/qrTypes/registry.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "..", "build", "sitemap.xml");

const today = new Date().toISOString().slice(0, 10);

const entries = [
  { loc: SITE_URL, priority: "1.0" },
  ...qrTypes.map((t) => ({ loc: `${SITE_URL}/${t.slug}`, priority: "0.8" })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    ({ loc, priority }) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

await writeFile(OUT, xml);
console.log(`[sitemap] wrote ${entries.length} URLs to ${path.relative(process.cwd(), OUT)}`);
