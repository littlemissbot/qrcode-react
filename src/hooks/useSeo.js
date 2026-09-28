import { useEffect } from "react";
import { SITE_URL } from "../qrTypes/registry.mjs";

const setMeta = (selector, attr, content) => {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    const [name, value] = selector.replace(/^meta\[|\]$/g, "").split("=");
    el.setAttribute(name, value.replace(/"/g, ""));
    document.head.appendChild(el);
  }
  el.setAttribute(attr, content);
};

const setLink = (rel, href) => {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

const JSON_LD_ID = "qrx-page-jsonld";

const setJsonLd = (data) => {
  let el = document.getElementById(JSON_LD_ID);
  if (!data) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = JSON_LD_ID;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
};

/**
 * Writes the per-page <head> tags. The prerender script snapshots the DOM
 * after this runs, so crawlers receive the same tags without executing JS.
 */
const useSeo = ({ title, description, path, jsonLd, noindex = false }) => {
  useEffect(() => {
    const url = `${SITE_URL}${path === "/" ? "" : path}`;
    document.title = title;
    setMeta('meta[name="robots"]', "content", noindex ? "noindex, nofollow" : "index, follow");
    setMeta('meta[name="description"]', "content", description);
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:url"]', "content", url);
    setMeta('meta[property="twitter:title"]', "content", title);
    setMeta('meta[property="twitter:description"]', "content", description);
    setLink("canonical", url);
    setJsonLd(jsonLd);
  }, [title, description, path, jsonLd, noindex]);
};

export default useSeo;
