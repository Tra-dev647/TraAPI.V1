import { loadDictionary, normalize, publicEntry, send, guard, requireToken } from "../_lib.js";

// GET /api/word/ស្មោះ  -> every entry whose headword is exactly this word
export default function handler(req, res) {
  if (guard(req, res) || requireToken(req, res)) return;
  const raw = String(req.query.word ?? "").trim();
  const q = normalize(raw);
  const entries = loadDictionary().filter((e) => e._word === q).map(publicEntry);
  if (!entries.length) return send(res, 404, { error: "Word not found", word: raw });
  send(res, 200, { word: raw, count: entries.length, entries });
}
