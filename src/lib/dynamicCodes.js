import { supabase } from "./supabase";

// Data access for the dashboard. Every call relies on row-level security in
// the database, so nothing here needs to filter by user.

const emptyStats = { total: 0, unique_visitors: 0, last_scan_at: null };

// Postgres raises CODE_LIMIT_REACHED (with a human hint) from a trigger.
const friendlyError = (error) => {
  if (!error) return null;
  if (error.message && error.message.includes("CODE_LIMIT_REACHED")) {
    const err = new Error(error.hint || "You have reached your plan's dynamic code limit.");
    err.code = "CODE_LIMIT_REACHED";
    return err;
  }
  return new Error(error.message || "Something went wrong");
};

const unwrap = ({ data, error }) => {
  if (error) throw friendlyError(error);
  return data;
};

export const listCodes = async () => {
  const [codes, stats] = await Promise.all([
    supabase
      .from("dynamic_codes")
      .select("*")
      .is("archived_at", null)
      .order("created_at", { ascending: false })
      .then(unwrap),
    supabase.rpc("list_code_stats").then(unwrap),
  ]);
  const byId = Object.fromEntries((stats || []).map((s) => [s.code_id, s]));
  return (codes || []).map((code) => ({ ...code, stats: byId[code.id] || emptyStats }));
};

export const getCode = async (id) =>
  supabase.from("dynamic_codes").select("*").eq("id", id).single().then(unwrap);

export const getCodeStats = async (id) =>
  supabase.rpc("get_code_stats", { p_code_id: id }).then(unwrap);

// Returns [] for Free owners: the RLS policy on scan_events only admits Pro.
export const listScans = async (id, limit = 100) =>
  supabase
    .from("scan_events")
    .select("id, scanned_at, country, region, city, device, browser, os, referrer")
    .eq("code_id", id)
    .order("scanned_at", { ascending: false })
    .limit(limit)
    .then(unwrap);

export const createCode = async ({ name, qrType, destination }) =>
  supabase
    .from("dynamic_codes")
    .insert({ name, qr_type: qrType, destination })
    .select()
    .single()
    .then(unwrap);

export const updateCode = async (id, patch) =>
  supabase.from("dynamic_codes").update(patch).eq("id", id).select().single().then(unwrap);

export const archiveCode = async (id) =>
  updateCode(id, { archived_at: new Date().toISOString() });

// A code created from a type page before the user was signed in is parked
// here until they come back from the magic link.
const PENDING_KEY = "qrx.pendingDynamicCode";

export const stashPendingCode = (payload) => {
  try {
    window.sessionStorage.setItem(PENDING_KEY, JSON.stringify(payload));
  } catch {
    /* private mode etc.; the user can recreate it from the dashboard */
  }
};

export const takePendingCode = () => {
  try {
    const raw = window.sessionStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    window.sessionStorage.removeItem(PENDING_KEY);
    return JSON.parse(raw);
  } catch {
    return null;
  }
};
