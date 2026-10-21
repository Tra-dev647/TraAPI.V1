import React, {
  StrictMode,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState
} from "react";
import { createRoot } from "react-dom/client";
import Papa from "papaparse";
import "./style.css";

const PAGE_SIZE = 20;
const DATA_URL = `${import.meta.env.BASE_URL}data/kh_dictionary.csv`;

// Normalize text so that search is case-insensitive and ignores zero-width
// characters that often sneak into Khmer text.
const normalize = (value) =>
  String(value ?? "")
    .normalize("NFC")
    .replace(/[​-‍﻿]/g, "")
    .toLocaleLowerCase();

function useDictionary() {
  const [state, setState] = useState({ rows: [], loading: true, error: "" });

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch(DATA_URL, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const text = await response.text();
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });

        const rows = (parsed.data || [])
          .filter((r) => r && (r.word || r.definition))
          .map((r, i) => {
            const word = String(r.word || "").trim();
            const definition = String(r.definition || "").trim();
            return {
              id: String(r._id || i + 1),
              word,
              definition,
              _word: normalize(word),
              _definition: normalize(definition)
            };
          });

        setState({ rows, loading: false, error: "" });
      } catch (err) {
        if (err.name === "AbortError") return;
        setState({
          rows: [],
          loading: false,
          error:
            "មិនអាចផ្ទុកឯកសារវចនានុក្រមបានទេ។ សូមពិនិត្យថា CSV មាននៅក្នុង public/data/។"
        });
      }
    }

    load();
    return () => controller.abort();
  }, []);

  return state;
}

function App() {
  const { rows, loading, error } = useDictionary();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [page, setPage] = useState(0);
  const [copiedId, setCopiedId] = useState(null);

  // Keep typing responsive while the large list is filtered.
  const deferredQuery = useDeferredValue(query);

  const results = useMemo(() => {
    const q = normalize(deferredQuery.trim());
    if (!q) return [];
    return rows.filter((r) => r._word.includes(q) || r._definition.includes(q));
  }, [rows, deferredQuery]);

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const visible = results.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const search = useCallback((value) => {
    setQuery(value);
    setPage(0);
    setSelectedId(null);
  }, []);

  const goToPage = useCallback((next) => {
    setPage(next);
    setSelectedId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  async function copyItem(item) {
    try {
      await navigator.clipboard.writeText(`${item.word}\n${item.definition}`);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId((id) => (id === item.id ? null : id)), 1500);
    } catch {
      /* clipboard may be unavailable (insecure context) */
    }
  }

  const hasQuery = query.trim().length > 0;

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="topline">
          <span className="seal">ក</span>
          <span>KHMER LANGUAGE • DICTIONARY</span>
        </div>
        <h1>វចនានុក្រមខ្មែរ</h1>
        <p className="subtitle">ស្វែងយល់ពាក្យខ្មែរ និងអត្ថន័យរបស់វា</p>
        <div className="searchbox">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={query}
            onChange={(e) => search(e.target.value)}
            placeholder="ស្វែងរកពាក្យ ឬអត្ថន័យ..."
            aria-label="ស្វែងរកពាក្យ"
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button
              type="button"
              className="clear"
              onClick={() => search("")}
              aria-label="លុបពាក្យស្វែងរក"
            >
              ×
            </button>
          )}
        </div>
        <div className="hint">វាយពាក្យខ្មែរ ដើម្បីស្វែងរកក្នុងវចនានុក្រម</div>
      </header>

      <main className="content">
        <div className="stats">
          <div>
            <strong>{loading ? "…" : rows.length.toLocaleString("en-US")}</strong>
            <span>ពាក្យក្នុងទិន្នន័យ</span>
          </div>
          <div>
            <strong>{hasQuery ? results.length.toLocaleString("en-US") : "—"}</strong>
            <span>លទ្ធផលស្វែងរក</span>
          </div>
        </div>

        {error && <div className="notice error" role="alert">{error}</div>}
        {loading && (
          <div className="empty" role="status">
            <div className="spinner" />
            កំពុងផ្ទុកវចនានុក្រម…
          </div>
        )}

        {!loading && !error && !hasQuery && (
          <div className="welcome">
            <div className="book-icon">📖</div>
            <h2>សូមស្វាគមន៍</h2>
            <p>ចាប់ផ្ដើមដោយវាយពាក្យខ្មែរនៅក្នុងប្រអប់ស្វែងរកខាងលើ។</p>
            <div className="tip">គន្លឹះ៖ អ្នកអាចស្វែងរកតាមពាក្យ ឬផ្នែកមួយនៃនិយមន័យបាន។</div>
          </div>
        )}

        {!loading && hasQuery && results.length === 0 && (
          <div className="empty">
            <div className="book-icon">🔎</div>
            <h2>រកមិនឃើញពាក្យ</h2>
            <p>សាកល្បងពាក្យផ្សេង ឬពិនិត្យអក្ខរាវិរុទ្ធម្ដងទៀត។</p>
          </div>
        )}

        {!loading && visible.length > 0 && (
          <>
            <div className="results-heading">
              លទ្ធផលស្វែងរក <span>{results.length.toLocaleString("en-US")}</span>
            </div>
            <div className="result-list">
              {visible.map((item) => {
                const open = selectedId === item.id;
                return (
                  <div
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    aria-expanded={open}
                    className={`result-card ${open ? "active" : ""}`}
                    onClick={() => setSelectedId(open ? null : item.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedId(open ? null : item.id);
                      }
                    }}
                  >
                    <div className="word-line">
                      <span className="word">{item.word || "—"}</span>
                      <span className="arrow">↗</span>
                    </div>
                    <p className={`definition ${open ? "full" : ""}`}>
                      {item.definition || "មិនមាននិយមន័យ"}
                    </p>
                    {open && (
                      <div className="detail">
                        លេខសម្គាល់៖ {item.id}
                        <button
                          type="button"
                          className="copy"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyItem(item);
                          }}
                        >
                          {copiedId === item.id ? "បានចម្លង ✓" : "ចម្លងពាក្យ"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {results.length > PAGE_SIZE && (
              <div className="pagination">
                <button type="button" disabled={page === 0} onClick={() => goToPage(page - 1)}>
                  មុន
                </button>
                <span>ទំព័រ {page + 1} / {totalPages}</span>
                <button
                  type="button"
                  disabled={page + 1 >= totalPages}
                  onClick={() => goToPage(page + 1)}
                >
                  បន្ទាប់
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <footer>
        <span className="footer-mark">ក</span>
        <p>វចនានុក្រមខ្មែរ · Khmer Dictionary</p>
        <small>ទិន្នន័យ៖ Khmer Choun Nath Dictionary / Open Institute</small>
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
