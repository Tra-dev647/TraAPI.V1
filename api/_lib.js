import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

let cache = null;

export const normalize = (value) =>
  String(value ?? "")
    .normalize("NFC")
    .replace(/[​-‍﻿]/g, "")
    .toLocaleLowerCase();

// Minimal RFC 4180 CSV parser (handles quotes, escaped quotes, newlines in fields).
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}

// First sense up to the first "។", with its examples ("ដូចជា ...").
export function makeShort(definition) {
  const text = String(definition || "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  const end = text.indexOf("។");
  const clause = end >= 0 ? text.slice(0, end) : text;
  let split = clause.indexOf(" : ");
  if (split < 0) split = clause.indexOf(":");
  const meaning = (split >= 0 ? clause.slice(0, split) : clause).trim();
  const examples = split >= 0 ? clause.slice(split + 1).replace(/^[\s:]+/, "").trim() : "";
  let out = `${meaning} ។`;
  if (examples) out += ` ដូចជា ${examples} ។`;
  return out;
}

export function loadDictionary() {
  if (cache) return cache;
  const file = path.join(process.cwd(), "public", "data", "kh_dictionary.csv");
  const [header, ...body] = parseCsv(fs.readFileSync(file, "utf8"));
  const idx = Object.fromEntries(header.map((h, i) => [h.trim(), i]));
  cache = body
    .map((r, i) => {
      const word = String(r[idx.word] ?? "").trim();
      const definition = String(r[idx.definition] ?? "")
        .replace(/<"\d+">([^<]*?)\/a/g, "$1")
        .trim();
      return {
        id: String(r[idx._id] || i + 1),
        word,
        definition,
        short: makeShort(definition),
        _word: normalize(word)
      };
    })
    .filter((e) => e.word || e.definition);
  return cache;
}

export const publicEntry = ({ id, word, definition, short }) => ({ id, word, definition, short });

export function send(res, status, body, cache = "private, no-store") {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Key");
  res.setHeader("Cache-Control", cache);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.status(status).send(JSON.stringify(body));
}

// Returns true when the request was fully handled (preflight or wrong method).
export function guard(req, res, method = "GET") {
  if (req.method === "OPTIONS") {
    send(res, 204, null);
    return true;
  }
  if (req.method !== method) {
    send(res, 405, { error: `Method not allowed. Use ${method}.` });
    return true;
  }
  return false;
}

// ---- Stateless API tokens (HMAC-signed, no database needed) ----
const b64 = (buf) => Buffer.from(buf).toString("base64url");

function sign(body) {
  return crypto
    .createHmac("sha256", process.env.TOKEN_SECRET)
    .update(body)
    .digest("base64url")
    .slice(0, 32);
}

export function createToken() {
  const body = b64(JSON.stringify({ i: crypto.randomBytes(8).toString("hex"), t: Date.now() }));
  return `Tra-${body}.${sign(body)}`;
}

// 0 = tokens never expire (default). Set TOKEN_DAYS in Vercel to add an expiry.
export const tokenDays = () => Number(process.env.TOKEN_DAYS) || 0;

function verifyToken(token) {
  if (typeof token !== "string") return false;
  const prefix = token.startsWith("Tra-") ? 4 : token.startsWith("kd_") ? 3 : 0;
  if (!prefix) return false;
  const [body, sig] = token.slice(prefix).split(".");
  if (!body || !sig) return false;
  let issued;
  try {
    issued = JSON.parse(Buffer.from(body, "base64url").toString("utf8")).t;
  } catch {
    return false;
  }
  if (!Number.isFinite(issued)) return false;
  if (tokenDays() > 0 && Date.now() - issued > tokenDays() * 86400000) return false;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  const revoked = (process.env.REVOKED_TOKENS || "").split(",").map((x) => x.trim()).filter(Boolean);
  return !revoked.includes(token);
}

// Returns true when the request was rejected (401/500 already sent).
export function requireToken(req, res) {
  if (!process.env.TOKEN_SECRET) {
    send(res, 500, { error: "Server is missing TOKEN_SECRET environment variable." });
    return true;
  }
  const header = String(req.headers?.authorization || "");
  const token =
    (header.startsWith("Bearer ") ? header.slice(7).trim() : "") ||
    String(req.headers?.["x-api-key"] || "") ||
    String(req.query?.token || "");
  if (!verifyToken(token)) {
    send(res, 401, {
      error: "Invalid or missing API token. Get one from the website menu, then send it as 'Authorization: Bearer <token>'."
    });
    return true;
  }
  return false;
}

// ---- English -> Khmer dictionary (SBBIC) ----
let enCache = null;
export function loadEnglish() {
  if (enCache) return enCache;
  const file = path.join(process.cwd(), "public", "data", "en_km_dictionary.csv");
  const [header, ...body] = parseCsv(fs.readFileSync(file, "utf8"));
  const idx = Object.fromEntries(header.map((h, i) => [h.trim(), i]));
  enCache = body
    .map((r, i) => {
      const word = String(r[idx.word] ?? "").trim();
      const definition = String(r[idx.definition] ?? "").trim();
      return { id: String(r[idx._id] || i + 1), word, definition, short: definition, _word: normalize(word) };
    })
    .filter((e) => e.word && e.definition);
  return enCache;
}
