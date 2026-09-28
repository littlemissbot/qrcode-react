import { createClient } from "@supabase/supabase-js";
import { SITE_URL } from "../qrTypes/registry.mjs";

const url = process.env.REACT_APP_SUPABASE_URL;
const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// null when the deployment has no Supabase project configured; the app then
// behaves as a purely static generator and hides every dynamic-code feature.
export const supabase = url && anonKey ? createClient(url, anonKey) : null;

export const isDynamicEnabled = () => supabase !== null;

export const REDIRECT_BASE = (
  process.env.REACT_APP_REDIRECT_BASE || `${SITE_URL}/r`
).replace(/\/+$/, "");

export const shortUrlFor = (shortCode) => `${REDIRECT_BASE}/${shortCode}`;

export const UPGRADE_URL = process.env.REACT_APP_UPGRADE_URL || null;
