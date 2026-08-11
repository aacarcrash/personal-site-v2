"use client";

// Header search trigger — placement D. Sits in the empty title-row space
// between the name block and the About/CV nav, filled treatment (contrast
// with the bordered CommandMenuTrigger stub). Opens the command menu via the
// same synthetic ⌘K the global listener in CommandMenu.tsx handles, so this
// has no direct dependency on that component's internal state — same
// mechanism as components/CommandMenu/CommandMenuTrigger.tsx.
//
// Collapses to a 44px icon-only hit area below 820px (kbd pill + label
// dropped) — the site-wide mobile breakpoint used throughout globals.css.

function dispatchOpenSearch() {
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
}

function SearchIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      style={{ flexShrink: 0 }}
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function HeaderSearchTrigger() {
  return (
    <button type="button" onClick={dispatchOpenSearch} aria-label="Open search" className="header-search">
      <span className="header-search-icon">
        <SearchIcon />
      </span>
      <span className="header-search-label">search</span>
      <span className="header-search-kbd">⌘K</span>
      <style jsx>{`
        .header-search {
          display: flex;
          align-items: center;
          /* flex-start, not center: site-header's items align on the name's
             baseline (align-items: baseline), and the name block is two
             lines (name + tagline). Centering this box on the whole block
             sinks it well below the nav links, which sit on the name's own
             line. flex-start puts the box's top at the row's cross-start —
             i.e. level with the name line, matching the nav visually. */
          align-self: flex-start;
          gap: 8px;
          flex-grow: 1;
          margin: 0 48px;
          background: var(--surface);
          border: none;
          border-radius: 2px;
          padding: 8px 12px;
          cursor: pointer;
          color: var(--text-muted);
        }
        .header-search-icon {
          display: flex;
          color: var(--text-muted);
        }
        .header-search-label {
          font-family: var(--font-mono);
          font-size: 12px;
          /* --text-muted on --surface lands at ~4.0:1, under the 4.5:1 floor in
             design.md. This label sits inside a button, so it is interactive text. */
          color: var(--text-secondary);
          flex-grow: 1;
          text-align: left;
        }
        .header-search-kbd {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--text-muted);
          background: var(--bg);
          border-radius: 2px;
          padding: 2px 6px;
          line-height: 1.4;
          flex-shrink: 0;
        }
        @media (max-width: 820px) {
          .header-search {
            flex-grow: 0;
            margin: 0;
            width: 44px;
            height: 44px;
            padding: 0;
            justify-content: center;
          }
          .header-search-label,
          .header-search-kbd {
            display: none;
          }
        }
      `}</style>
    </button>
  );
}
