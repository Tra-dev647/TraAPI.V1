import React, { useState } from "react";
import { go } from "./nav.js";

const HKEY = "tra_tokens";
const readHistory = () => {
  try {
    const v = JSON.parse(localStorage.getItem(HKEY) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};
const writeHistory = (list) => {
  try { localStorage.setItem(HKEY, JSON.stringify(list)); } catch { /* storage unavailable */ }
};
const mask = (t) => (t.length > 22 ? `${t.slice(0, 14)}…${t.slice(-6)}` : t);
const fmt = (ms) =>
  new Date(ms).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
  });

function useCopy() {
  const [copied, setCopied] = useState("");
  const copy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(""), 1500);
    } catch { /* clipboard unavailable */ }
  };
  return [copied, copy];
}

function Code({ children }) {
  return <pre className="code">{children}</pre>;
}

function DocsTab({ base }) {
  return (
    <div className="doc">
      <h2>ចាប់ផ្តើម</h2>
      <p>API នេះឱ្យអ្នកស្វែងរកពាក្យ និងយកអត្ថន័យពីវចនានុក្រមខ្មែរ។ ឆ្លើយជា JSON ហើយប្រើបានគ្មានកំណត់។</p>
      <div className="modal-label">Base URL</div>
      <Code>{base}/api</Code>

      <h2>Authentication</h2>
      <p>បង្កើត Token នៅផ្ទាំង "បង្កើត API" (ចាប់ផ្តើមដោយ <b>Tra-</b>) រួចផ្ញើជាមួយរាល់ request៖</p>
      <Code>{`Authorization: Bearer Tra-xxxxxxxx.xxxxxxxx`}</Code>
      <p>ឬ <code>X-API-Key: Tra-...</code> ឬ <code>?token=Tra-...</code></p>

      <h2>GET /api/search</h2>
      <p>ស្វែងរកតាមពាក្យ៖ ពាក្យដូចគ្នាបេះបិទមុន រួចពាក្យចាប់ផ្តើមដូចគ្នា។</p>
      <table className="params">
        <tbody>
          <tr><td><code>q</code></td><td>ពាក្យដែលរក (ចាំបាច់)</td></tr>
          <tr><td><code>limit</code></td><td>ចំនួនក្នុងមួយទំព័រ (១–១០០, លំនាំដើម ២០)</td></tr>
          <tr><td><code>page</code></td><td>លេខទំព័រ (លំនាំដើម ១)</td></tr>
          <tr><td><code>exact</code></td><td><code>1</code> = តែពាក្យដូចគ្នាបេះបិទ</td></tr>
        </tbody>
      </table>
      <Code>{`curl -H "Authorization: Bearer YOUR_TOKEN" \\
  "${base}/api/search?q=ស្មោះ&limit=3"`}</Code>
      <Code>{`{
  "query": "ស្មោះ",
  "total": 3,
  "page": 1,
  "limit": 3,
  "totalPages": 1,
  "results": [
    {
      "id": "…",
      "word": "ស្មោះ",
      "definition": "(គុ. ឬ កិ. វិ.) ត្រង់អស់ពីចិត្ត …",
      "short": "(គុ. ឬ កិ. វិ.) ត្រង់អស់ពីចិត្ត … ។ ដូចជា ចិត្តស្មោះ, ស្រឡាញ់ស្មោះ ។"
    }
  ]
}`}</Code>

      <h2>GET /api/word/&#123;word&#125;</h2>
      <p>យកគ្រប់ entry របស់ពាក្យមួយ។ ឆ្លើយ 404 បើរកមិនឃើញ។</p>
      <Code>{`curl -H "Authorization: Bearer YOUR_TOKEN" \\
  "${base}/api/word/ព្យាយាម"`}</Code>

      <h2>GET /api/en/search</h2>
      <p>ស្វែងរកអង់គ្លេស → ខ្មែរ។ ប្រើ parameter ដូច /api/search (q, limit, page, exact)។</p>
      <Code>{`curl -H "Authorization: Bearer YOUR_TOKEN" \\
  "${base}/api/en/search?q=love&limit=3"`}</Code>

      <h2>GET /api/en/&#123;word&#125;</h2>
      <p>យកគ្រប់ entry របស់ពាក្យអង់គ្លេសមួយ។ ឆ្លើយ 404 បើរកមិនឃើញ។</p>

      <h2>GET /api/random</h2>
      <p>ពាក្យចៃដន្យមួយ។</p>

      <h2>JavaScript</h2>
      <Code>{`const res = await fetch("${base}/api/search?q=" + encodeURIComponent("ស្មោះ"), {
  headers: { Authorization: "Bearer YOUR_TOKEN" }
});
const data = await res.json();
console.log(data.results);`}</Code>

      <h2>Python</h2>
      <Code>{`import requests

r = requests.get(
    "${base}/api/search",
    params={"q": "ស្មោះ"},
    headers={"Authorization": "Bearer YOUR_TOKEN"},
)
print(r.json()["results"])`}</Code>

      <h2>កូដកំហុស</h2>
      <table className="params">
        <tbody>
          <tr><td><code>400</code></td><td>ខ្វះ parameter (ឧ. q)</td></tr>
          <tr><td><code>401</code></td><td>Token ខុស ឬគ្មាន</td></tr>
          <tr><td><code>404</code></td><td>រកពាក្យមិនឃើញ</td></tr>
          <tr><td><code>405</code></td><td>Method ខុស (ប្រើ GET)</td></tr>
        </tbody>
      </table>

      <div className="contact-box">
        <b>ចង់បានឃ្លាំងទិន្នន័យពាក្យទាំងអស់?</b>
        <span>ទំនាក់ទំនងតាម Telegram៖ <a href="https://t.me/Tradev14" target="_blank" rel="noopener noreferrer">t.me/Tradev14</a></span>
      </div>

      <p className="credit">ទិន្នន័យ៖ Khmer Choun Nath Dictionary / Open Institute (LGPL 2.1) · SBBIC English-Khmer Dictionary (MIT, Society for Better Books in Cambodia)</p>
    </div>
  );
}

function CreateTab({ base }) {
  const [history, setHistory] = useState(readHistory);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, copy] = useCopy();
  const latest = history[0];

  async function create() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/token", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.token) throw new Error(data.error || `HTTP ${res.status}`);
      const next = [{ token: data.token, t: Date.now() }, ...history].slice(0, 50);
      setHistory(next);
      writeHistory(next);
    } catch (err) {
      setError(`មិនអាចបង្កើត Token បានទេ៖ ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  function remove(token) {
    const next = history.filter((h) => h.token !== token);
    setHistory(next);
    writeHistory(next);
  }

  return (
    <div className="doc">
      <h2>បង្កើត API Token</h2>
      <p>Token មានសុពលភាព ៩០ ថ្ងៃ ហើយមានកម្រិត ៦០ សំណើក្នុងមួយនាទី។ រក្សាវាជាសម្ងាត់។</p>
      <div className="modal-actions">
        <button type="button" className="primary" onClick={create} disabled={loading}>
          {loading ? "កំពុងបង្កើត…" : "＋ បង្កើត Token ថ្មី"}
        </button>
      </div>
      {error && <div className="notice error">{error}</div>}

      {latest && (
        <>
          <div className="modal-label">Token ចុងក្រោយ</div>
          <div className="token-box">{latest.token}</div>
          <div className="modal-actions">
            <button type="button" onClick={() => copy(latest.token, "latest")}>
              {copied === "latest" ? "បានចម្លង ✓" : "ចម្លង Token"}
            </button>
          </div>
          <div className="modal-label">សាកល្បង</div>
          <Code>{`curl -H "Authorization: Bearer ${latest.token}" \\
  "${base}/api/search?q=ស្មោះ"`}</Code>
        </>
      )}

      <h2>ប្រវត្តិ Token</h2>
      {history.length === 0 ? (
        <p className="muted">មិនទាន់មាន Token ទេ។</p>
      ) : (
        <ul className="history">
          {history.map((h) => (
            <li key={h.token}>
              <div>
                <div className="history-token">{mask(h.token)}</div>
                <div className="history-date">{fmt(h.t)}</div>
              </div>
              <div className="history-actions">
                <button type="button" onClick={() => copy(h.token, h.token)}>
                  {copied === h.token ? "✓" : "ចម្លង"}
                </button>
                <button type="button" onClick={() => remove(h.token)} aria-label="លុប">លុប</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="muted small">
        ប្រវត្តិនេះរក្សាទុកក្នុង browser របស់អ្នកតែប៉ុណ្ណោះ។ ការលុបចេញពីបញ្ជីមិនបិទ Token ទេ។
      </p>
    </div>
  );
}

function AiTab() {
  const [copied, copy] = useCopy();
  const [error, setError] = useState("");

  async function copyForAi() {
    setError("");
    try {
      const res = await fetch("/docs/Tra-API.md");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      await copy(
        `Read this API documentation and help me write code that uses it:\n\n${text}`,
        "ai"
      );
    } catch (err) {
      setError(`មិនអាចចម្លងបានទេ៖ ${err.message}`);
    }
  }

  const files = [
    { name: "PDF", note: "ឯកសារ API ជា PDF សម្រាប់ទាញយក ឬផ្ទុកឡើងទៅ AI", href: "/docs/Tra-API.pdf", dl: true },
    { name: "Markdown", note: "អត្ថបទសុទ្ធ ងាយបិទភ្ជាប់ក្នុង AI គ្រប់ប្រភេទ", href: "/docs/Tra-API.md", dl: true },
    { name: "OpenAPI (JSON)", note: "សម្រាប់ Custom GPT, Postman និងឧបករណ៍ផ្សេងៗ", href: "/docs/openapi.json", dl: false },
    { name: "llms.txt", note: "សន្ទស្សន៍ឲ្យ AI និងប្រព័ន្ធស្វែងរកស្គាល់ឯកសារ", href: "/llms.txt", dl: false }
  ];

  return (
    <div className="doc">
      <h2>ឯកសារសម្រាប់ AI</h2>
      <p>ទាញយក ឬចម្លងឯកសារខាងក្រោម ហើយឲ្យទៅ AI (ChatGPT, Claude, Gemini, Copilot…) ដើម្បីឲ្យវាសរសេរកូដប្រើ API នេះឲ្យអ្នក។</p>

      <div className="modal-actions">
        <button type="button" className="primary" onClick={copyForAi}>
          {copied === "ai" ? "បានចម្លង ✓" : "ចម្លងសម្រាប់ AI"}
        </button>
      </div>
      {error && <div className="notice error">{error}</div>}
      <p>ចុចហើយបិទភ្ជាប់ (Paste) ក្នុង AI ណាមួយ។ កុំដាក់ Token ពិតក្នុងសារ លុះត្រាតែចាំបាច់។</p>

      <h2>ទាញយកឯកសារ</h2>
      <div className="file-list">
        {files.map((f) => (
          <a key={f.href} className="file-card" href={f.href} target="_blank" rel="noopener noreferrer" {...(f.dl ? { download: true } : {})}>
            <span>
              <b>{f.name}</b>
              <small>{f.note}</small>
            </span>
          </a>
        ))}
      </div>

      <div className="contact-box">
        <b>ចង់បានឃ្លាំងទិន្នន័យពាក្យទាំងអស់?</b>
        <span>ទំនាក់ទំនងតាម Telegram៖ <a href="https://t.me/Tradev14" target="_blank" rel="noopener noreferrer">t.me/Tradev14</a></span>
      </div>

      <h2>របៀបប្រើ</h2>
      <p>១) ចម្លង ឬទាញយកឯកសារ ២) បិទភ្ជាប់ ឬផ្ទុកឡើងទៅ AI ៣) សុំឲ្យវា "សរសេរកូដស្វែងរកពាក្យតាមឯកសារនេះ" ៤) ដាក់ Token របស់អ្នកក្នុងកូដដោយខ្លួនឯង។</p>
    </div>
  );
}

export default function ApiPage() {
  const [tab, setTab] = useState("docs");
  const base = window.location.origin;

  return (
    <div className="app-shell">
      <header className="api-head">
        <div className="api-bar">
          <button type="button" className="back" onClick={() => go("/")}>← ត្រឡប់</button>
          <div className="api-title">
            <span className="seal small">ក</span>
            <span>API for Developer</span>
          </div>
        </div>
        <div className="tabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === "docs"} className={tab === "docs" ? "on" : ""} onClick={() => setTab("docs")}>
            Docs
          </button>
          <button type="button" role="tab" aria-selected={tab === "create"} className={tab === "create" ? "on" : ""} onClick={() => setTab("create")}>
            បង្កើត API
          </button>
          <button type="button" role="tab" aria-selected={tab === "ai"} className={tab === "ai" ? "on" : ""} onClick={() => setTab("ai")}>
            AI &amp; PDF
          </button>
        </div>
      </header>
      <main className="content">
        {tab === "docs" ? <DocsTab base={base} /> : tab === "ai" ? <AiTab /> : <CreateTab base={base} />}
      </main>
    </div>
  );
}
