import React, { useEffect, useState } from "react";
import { go } from "./nav.js";

export default function Menu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        className="menu-btn"
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span /><span /><span />
      </button>
      {open && (
        <>
          <div className="menu-backdrop" onClick={() => setOpen(false)} />
          <nav className="menu-panel">
            <button type="button" onClick={() => { setOpen(false); go("/developers"); }}>
              ⚙️ API
            </button>
          </nav>
        </>
      )}
    </>
  );
}
