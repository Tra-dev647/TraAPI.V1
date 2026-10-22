import { loadEnglish, normalize, publicEntry, send, guard, requireToken } from "../_lib.js";

// GET /api/en/love -> every entry whose English headword is exactly this word
export default function handler(req, res) {
  if (guard(req, res) || requireToken(req, res)) return;
  const raw = String(req.query.word ?? "").trim().slice(0, 100);
  const q = normalize(raw);
  const entries = loadEnglish().filter((e) => e._word === q).map(publicEntry);
  if (!entries.length) return send(res, 404, { error: "Word not found", word: raw });
  send(res, 200, { word: raw, count: entries.length, entries });
}
