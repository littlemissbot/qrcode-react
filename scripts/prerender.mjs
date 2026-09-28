// Prerenders every route of the built app to static HTML so search engines
// get real content (title, meta tags, H1, copy) without executing JavaScript.
//
// Runs after `react-scripts build` (see the "postbuild" script). It serves
// build/ on a local port, opens each route in headless Chromium, waits for the
// page to render, and writes the resulting DOM to build/<slug>.html. The home
// page overwrites build/index.html, which is also nginx's SPA fallback.
//
// Chromium lookup order: $PRERENDER_CHROMIUM, a few well-known paths, then
// whatever playwright-core can find on its own. Set SKIP_PRERENDER=1 to build
// without it (the site still works, it just ships an empty shell to crawlers).

import { createServer } from "node:http";
import { readFile, writeFile, access } from "node:fs/promises";
import { createReadStream, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { qrTypes } from "../src/qrTypes/registry.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUILD_DIR = path.resolve(__dirname, "..", "build");
const PORT = Number(process.env.PRERENDER_PORT) || 4173;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".txt": "text/plain",
  ".xml": "application/xml",
  ".map": "application/json",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const routes = ["/", ...qrTypes.map((t) => `/${t.slug}`)];

const outputFileFor = (route) =>
  route === "/"
    ? path.join(BUILD_DIR, "index.html")
    : path.join(BUILD_DIR, `${route.slice(1)}.html`);

const serveBuild = () =>
  new Promise((resolve) => {
    const server = createServer((req, res) => {
      const urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
      let filePath = path.join(BUILD_DIR, urlPath);
      if (!filePath.startsWith(BUILD_DIR) || !existsSync(filePath) || urlPath === "/") {
        filePath = path.join(BUILD_DIR, "index.html");
      }
      res.setHeader("Content-Type", MIME[path.extname(filePath)] || "application/octet-stream");
      createReadStream(filePath).pipe(res);
    });
    server.listen(PORT, "127.0.0.1", () => resolve(server));
  });

const findChromium = async () => {
  const candidates = [
    process.env.PRERENDER_CHROMIUM,
    "/opt/pw-browsers/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
    "/usr/bin/google-chrome",
  ].filter(Boolean);
  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      /* try next */
    }
  }
  return undefined;
};

const main = async () => {
  if (process.env.SKIP_PRERENDER === "1") {
    console.warn("[prerender] SKIP_PRERENDER=1 set; skipping. Crawlers will get an empty shell.");
    return;
  }
  if (!existsSync(path.join(BUILD_DIR, "index.html"))) {
    throw new Error("build/index.html not found. Run `react-scripts build` first.");
  }

  const template = await readFile(path.join(BUILD_DIR, "index.html"), "utf8");
  const executablePath = await findChromium();
  console.log(`[prerender] chromium: ${executablePath || "(playwright default)"}`);

  const server = await serveBuild();
  let browser;
  try {
    browser = await chromium.launch({
      executablePath,
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    // Analytics must not fire during the build.
    await context.route(/googletagmanager\.com|google-analytics\.com/, (r) => r.abort());

    for (const route of routes) {
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (err) => errors.push(err.message));
      await page.goto(`http://127.0.0.1:${PORT}${route}`, { waitUntil: "networkidle" });
      await page.waitForSelector("#root h1", { timeout: 15000 });
      // Mark what was rendered so index.js knows whether it can hydrate.
      await page.evaluate((r) => {
        document.getElementById("root").setAttribute("data-prerendered", r);
      }, route);
      const html = `<!DOCTYPE html>\n${await page.evaluate(
        () => document.documentElement.outerHTML
      )}`;
      await page.close();
      if (errors.length) {
        throw new Error(`[prerender] JS errors on ${route}:\n${errors.join("\n")}`);
      }
      if (html.length < template.length) {
        throw new Error(`[prerender] ${route} rendered less HTML than the template; refusing to write.`);
      }
      await writeFile(outputFileFor(route), html);
      console.log(`[prerender] ${route} -> ${path.relative(BUILD_DIR, outputFileFor(route))}`);
    }
  } finally {
    if (browser) await browser.close();
    server.close();
  }
  console.log(`[prerender] done: ${routes.length} routes`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
