import { clampQuery } from "./_security.js";
import { loadDictionary, normalize, publicEntry, send, guard, requireToken } from "./_lib.js";

// GET /api/search?q=ស្មោះ&limit=20&page=1&exact=1
export default function handler(req, res) {
  if (guard(req, res) || requireToken(req, res)) return;
  const q = normalize(clampQuery(req.query.q));
  if (!q) return send(res, 400, { error: "Missing query parameter: q" });

  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const page = Math.min(1000, Math.max(1, parseInt(req.query.page, 10) || 1));
  const exactOnly = ["1", "true"].includes(String(req.query.exact ?? ""));

  const exact = [];
  const prefix = [];
  for (const e of loadDictionary()) {
    if (e._word === q) exact.push(e);
    else if (!exactOnly && e._word.startsWith(q)) prefix.push(e);
  }
  const all = [...exact, ...prefix];
  const results = all.slice((page - 1) * limit, page * limit).map(publicEntry);

  send(res, 200, {
    query: clampQuery(req.query.q),
    total: all.length,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(all.length / limit)),
    results
  });
}
