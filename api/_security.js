// Lightweight protection layer. No external services needed.
// NOTE: counters live in each serverless instance's memory, so limits are
// "best effort". For hard limits also enable a Vercel Firewall rate-limit rule.

const buckets = new Map(); // key -> { count, reset }

export function clientIp(req) {
  const h = req.headers || {};
  const raw =
    h["x-real-ip"] || h["x-vercel-forwarded-for"] || String(h["x-forwarded-for"] || "").split(",")[0] || "unknown";
  return String(raw).trim();
}

// Returns { ok, remaining, retryAfter }
export function hit(key, limit, windowMs) {
  const now = Date.now();
  if (buckets.size > 5000) for (const [k, b] of buckets) if (b.reset <= now) buckets.delete(k);
  let b = buckets.get(key);
  if (!b || b.reset <= now) {
    b = { count: 0, reset: now + windowMs };
    buckets.set(key, b);
  }
  b.count++;
  return {
    ok: b.count <= limit,
    remaining: Math.max(0, limit - b.count),
    retryAfter: Math.ceil((b.reset - now) / 1000)
  };
}

export function isBlockedIp(req) {
  const list = (process.env.BLOCKED_IPS || "").split(",").map((x) => x.trim()).filter(Boolean);
  return list.includes(clientIp(req));
}

// Browser requests must come from our own site (or ALLOWED_ORIGINS). Requests
// with no Origin header (curl, servers) are not browsers, so they pass this
// check and are limited by IP instead.
export function sameOrigin(req) {
  const origin = req.headers?.origin;
  if (!origin) return true;
  let host;
  try { host = new URL(origin).host; } catch { return false; }
  const allowed = (process.env.ALLOWED_ORIGINS || "").split(",").map((x) => x.trim()).filter(Boolean);
  return host === req.headers?.host || allowed.includes(origin) || allowed.includes(host);
}

export const clampQuery = (value, max = 100) => String(value ?? "").trim().slice(0, max);
