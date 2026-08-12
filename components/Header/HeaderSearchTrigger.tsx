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
//
// Styling lives in app/globals.css, NOT in a styled-jsx block here. styled-jsx
// injects from JavaScript, so this control painted as unstyled stacked text
// for about a second on every cold load. See the note above .header-search
// there before moving any of it back.

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
    </button>
  );
}
