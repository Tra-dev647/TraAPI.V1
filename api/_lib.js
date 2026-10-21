import fs from "node:fs";
import path from "node:path";

let cache = null;

export const normalize = (value) =>
  String(value ?? "")
    .normalize("NFC")
    .replace(/[​-‍﻿]/g, "")
    .toLocaleLowerCase();

// Minimal RFC 4180 CSV parser (handles quotes, escaped quotes, newlines in fields).
function parseCsv(text) {
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

export function send(res, status, body, cache = "public, s-maxage=86400, stale-while-revalidate=604800") {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", cache);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.status(status).send(JSON.stringify(body));
}

// Returns true when the request was fully handled (preflight or wrong method).
export function guard(req, res) {
  if (req.method === "OPTIONS") {
    send(res, 204, null);
    return true;
  }
  if (req.method !== "GET") {
    send(res, 405, { error: "Method not allowed. Use GET." });
    return true;
  }
  return false;
}
