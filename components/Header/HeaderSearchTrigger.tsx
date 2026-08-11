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
          /* center, and deliberately NOT baseline. The header aligns on the
             last baseline, which is right for the nav and the name block
             because those are text. This is a filled box, and baseline-
             aligning a filled box means its position is set by where the
             text sits INSIDE it — so any change to this rule's own padding
             or line-height silently drags the whole field down the header.
             That already happened once. Centring pins it to the row instead,
             which is where baseline alignment was putting it anyway when the
             padding was what it is now. */
          align-self: center;
          gap: 8px;
          flex-grow: 1;
          margin: 0 48px;
          /* Replicates the view bar's COLOUR exactly — and colour here is
             not one value, it is a stack: the --glass-panel fill, the same
             hairline glass border, and the same inset top highlight. Using
             only the fill made this near-invisible on a flat page, because
             the fill alone is 20% white on an almost-white background; the
             highlight and border are what actually make the bar read as a
             light capsule. Shape stays as it was — the bar is a floating
             capsule, this is an inline field. */
          background: var(--search-field);
          /* No border. The view bar's hairline works there because the bar
             floats over arbitrary content and needs an edge to sit against;
             on a flat header the same line just boxes the field in. The
             shared FILL is what ties the two together. */
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
          /* 10px was below the ramp floor and the 2px/6px padding left the
             glyphs touching the badge edge, so it read as cramped rather
             than as a key. 11px on the label step, with padding that gives
             the ⌘ some room to breathe on all four sides. */
          font-size: var(--step-label);
          color: var(--text-muted);
          background: var(--bg);
          border: 0.5px solid var(--border);
          border-radius: 4px;
          padding: 3px 7px;
          /* Fixed line-height rather than a ratio: at 1.4 the box height
             depended on the glyph metrics of whatever mono was loaded, so
             the badge changed size between fallback and Necto Mono. */
          line-height: 14px;
          flex-shrink: 0;
        }
        @media (max-width: 820px) {
          /* Icon-only, and NO filled surface. At 44x44 with a --surface fill
             this was the only solid block in a header of plain text links and
             a bare 16px moon icon — it read as a button among labels. The
             44x44 stays as the TOUCH TARGET (below that fails the minimum
             tap size); only the fill is dropped, so the trigger carries the
             same visual weight as its neighbours. */
          .header-search {
            flex-grow: 0;
            margin: 0;
            /* 32, not 44. The box height decides where the centred icon
               lands, and at 44 it sat 6px below the nav links and the theme
               toggle. 32 matches the 33px nav row. The 44px touch target is
               restored by the ::after below, which expands the hit area
               WITHOUT changing the layout box — shrinking the box is what
               fixes the alignment. (The header aligns on centre now, not the
               baseline this comment used to cite.) */
            width: 32px;
            height: 32px;
            padding: 0;
            justify-content: center;
            background: transparent;
            position: relative;
          }
          .header-search::after {
            content: "";
            position: absolute;
            inset: -6px;
          }
          /* Match the theme toggle's 16px icon so the row reads as one set. */
          .header-search-icon :global(svg) {
            width: 16px;
            height: 16px;
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
