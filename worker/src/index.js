// QRx redirect Worker.
//
// A dynamic QR code encodes <REDIRECT_BASE>/<short_code>. This Worker looks
// the code up in Supabase, answers with a 302 to the current destination, and
// records one scan_events row after the response has been sent. Country and
// city come from Cloudflare's request.cf, device/browser/OS from the user
// agent, and the visitor hash lets the dashboard count unique visitors per
// day without ever storing an IP address.
//
// Secrets (wrangler secret put): SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// Vars (wrangler.toml):          SITE_URL

import { parseUserAgent, isBot } from "../../src/lib/parseUserAgent.mjs";

const SHORT_CODE_RE = /^[A-Za-z0-9]{4,16}$/;

const supabaseHeaders = (env) => ({
  apikey: env.SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
});

const lookupCode = async (shortCode, env) => {
  const url = new URL(`${env.SUPABASE_URL}/rest/v1/dynamic_codes`);
  url.searchParams.set("select", "id,destination");
  url.searchParams.set("short_code", `eq.${shortCode}`);
  url.searchParams.set("archived_at", "is.null");
  url.searchParams.set("limit", "1");
  const res = await fetch(url, { headers: supabaseHeaders(env) });
  if (!res.ok) throw new Error(`lookup failed: ${res.status}`);
  const rows = await res.json();
  return rows[0] || null;
};

const sha256Hex = async (input) => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
};

const recordScan = async (request, code, env) => {
  const ua = request.headers.get("user-agent") || "";
  const ip = request.headers.get("cf-connecting-ip") || "";
  const day = new Date().toISOString().slice(0, 10);
  const cf = request.cf || {};
  const { os, device, browser } = parseUserAgent(ua);
  let referrer = null;
  try {
    const ref = request.headers.get("referer");
    if (ref) referrer = new URL(ref).hostname;
  } catch {
    referrer = null;
  }

  const row = {
    code_id: code.id,
    visitor_hash: await sha256Hex(`${ip}|${ua}|${code.id}|${day}`),
    country: cf.country || null,
    region: cf.region || null,
    city: cf.city || null,
    device,
    browser,
    os,
    referrer,
  };

  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/scan_events`, {
    method: "POST",
    headers: { ...supabaseHeaders(env), Prefer: "return=minimal" },
    body: JSON.stringify(row),
  });
  if (!res.ok) console.error(`scan insert failed: ${res.status} ${await res.text()}`);
};

const html = (status, title, body) =>
  new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title><style>body{font-family:system-ui,sans-serif;max-width:32rem;margin:15vh auto;padding:0 1.5rem;color:#392b58;text-align:center}a{color:inherit}</style></head><body><h1>${title}</h1><p>${body}</p></body></html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } }
  );

const worker = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    // Accept both /<code> (own domain) and /r/<code> (path on the main site).
    const shortCode = url.pathname.replace(/^\/(r\/)?/, "").split("/")[0];

    if (!shortCode) {
      return Response.redirect(env.SITE_URL || "https://qrx.samita.in", 302);
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", { status: 405 });
    }
    if (!SHORT_CODE_RE.test(shortCode)) {
      return html(404, "Code not found", `This QR code does not exist. <a href="${env.SITE_URL}">Make your own at QRx</a>.`);
    }

    let code;
    try {
      code = await lookupCode(shortCode, env);
    } catch (err) {
      console.error(err);
      return html(503, "Temporarily unavailable", "Please try scanning again in a moment.");
    }
    if (!code) {
      return html(404, "Code not found", `This QR code has been removed or never existed. <a href="${env.SITE_URL}">Make your own at QRx</a>.`);
    }

    const ua = request.headers.get("user-agent") || "";
    if (request.method === "GET" && !isBot(ua)) {
      ctx.waitUntil(recordScan(request, code, env).catch((err) => console.error(err)));
    }

    return new Response(null, {
      status: 302,
      headers: {
        Location: code.destination,
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
      },
    });
  },
};

export default worker;
