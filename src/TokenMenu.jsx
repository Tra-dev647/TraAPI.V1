import React, { useEffect, useState } from "react";

const KEY = "kd_token";
const readToken = () => {
  try { return localStorage.getItem(KEY) || ""; } catch { return ""; }
};
const saveToken = (value) => {
  try { localStorage.setItem(KEY, value); } catch { /* storage unavailable */ }
};

export default function TokenMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [token, setToken] = useState(readToken);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setModalOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function getToken() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/token", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.token) throw new Error(data.error || `HTTP ${res.status}`);
      setToken(data.token);
      saveToken(data.token);
    } catch (err) {
      setError(`មិនអាចបង្កើត Token បានទេ៖ ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function copy(text, label) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(""), 1500);
    } catch { /* clipboard unavailable */ }
  }

  const example = `curl -H "Authorization: Bearer ${token || "YOUR_TOKEN"}" \\\n  "${origin}/api/search?q=ស្មោះ"`;

  return (
    <>
      <button
        type="button"
        className="menu-btn"
        aria-label="Menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((v) => !v)}
      >
        <span /><span /><span />
      </button>

      {menuOpen && (
        <>
          <div className="menu-backdrop" onClick={() => setMenuOpen(false)} />
          <nav className="menu-panel">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setModalOpen(true);
              }}
            >
              🔑 យក API Token
            </button>
            <a href="/api" target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)}>
              📘 API Docs
            </a>
          </nav>
        </>
      )}

      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>API Token</h2>
              <button type="button" className="clear" aria-label="បិទ" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <p className="modal-text">
              ប្រើ Token នេះដើម្បីហៅ API វចនានុក្រម។ រក្សាវាជាសម្ងាត់ កុំចែករំលែកជាសាធារណៈ។
            </p>

            {token ? (
              <>
                <div className="token-box">{token}</div>
                <div className="modal-actions">
                  <button type="button" className="primary" onClick={() => copy(token, "token")}>
                    {copied === "token" ? "បានចម្លង ✓" : "ចម្លង Token"}
                  </button>
                  <button type="button" onClick={getToken} disabled={loading}>
                    {loading ? "កំពុងបង្កើត…" : "បង្កើតថ្មី"}
                  </button>
                </div>
                <div className="modal-label">ឧទាហរណ៍</div>
                <pre className="code">{example}</pre>
                <button type="button" onClick={() => copy(example, "code")}>
                  {copied === "code" ? "បានចម្លង ✓" : "ចម្លងឧទាហរណ៍"}
                </button>
              </>
            ) : (
              <div className="modal-actions">
                <button type="button" className="primary" onClick={getToken} disabled={loading}>
                  {loading ? "កំពុងបង្កើត…" : "បង្កើត Token"}
                </button>
              </div>
            )}
            {error && <div className="notice error">{error}</div>}
          </div>
        </div>
      )}
    </>
  );
}
