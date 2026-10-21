import { loadDictionary, publicEntry, send, guard } from "./_lib.js";

// GET /api/random
export default function handler(req, res) {
  if (guard(req, res)) return;
  const all = loadDictionary();
  const entry = all[Math.floor(Math.random() * all.length)];
  send(res, 200, publicEntry(entry), "no-store");
}
