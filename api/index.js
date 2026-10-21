import { loadDictionary, send, guard } from "./_lib.js";

// GET /api  -> API description
export default function handler(req, res) {
  if (guard(req, res)) return;
  send(res, 200, {
    name: "Khmer Dictionary API",
    source: "Khmer Choun Nath Dictionary / Open Institute (LGPL 2.1); English-Khmer: SBBIC (MIT)",
    totalEntries: loadDictionary().length,
    endpoints: {
      search: "/api/search?q=ស្មោះ&limit=20&page=1&exact=0",
      word: "/api/word/ស្មោះ",
      random: "/api/random",
      englishSearch: "/api/en/search?q=love&limit=20",
      englishWord: "/api/en/love"
    },
    auth: "Send 'Authorization: Bearer <token>' (or ?token=). Get a token from the website menu."
  }, "public, s-maxage=3600");
}
