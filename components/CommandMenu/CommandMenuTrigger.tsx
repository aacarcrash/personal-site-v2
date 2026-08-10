"use client";

// Visible search-box trigger for the command menu — the primary affordance
// (⌘K alone is a hidden shortcut most recruiters never discover). Exported
// for Phase 2 to place on the homepage toolbar; not mounted anywhere yet
// (placement decision pending per the plan).

export function CommandMenuTrigger() {
  return (
    <button
      type="button"
      onClick={() => {
        // Dispatch the same combo the global listener in CommandMenu.tsx
        // listens for, so this trigger has no direct dependency on that
        // component's internal state.
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "k", metaKey: true }),
        );
      }}
      aria-label="Open search"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        width: "220px",
        height: "32px",
        padding: "0 10px",
        border: "0.5px solid var(--border)",
        borderRadius: "2px",
        background: "transparent",
        color: "var(--text-muted)",
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ flexShrink: 0 }}>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          flex: 1,
          textAlign: "left",
        }}
      >
        search
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          border: "0.5px solid var(--border)",
          borderRadius: "2px",
          padding: "2px 6px",
          lineHeight: 1.4,
          flexShrink: 0,
        }}
      >
        ⌘K
      </span>
    </button>
  );
}
