"use client";

import type { AxisKey } from "@/data/types";

const AXIS_OPTIONS: { key: AxisKey; label: string }[] = [
  { key: "year", label: "time" },
  { key: "medium", label: "medium" },
  { key: "concern", label: "concern" },
  { key: "technology", label: "tech" },
  { key: "context", label: "context" },
];

type Props = {
  side: "y" | "x";
  active: AxisKey;
  onChange: (next: AxisKey) => void;
  /** The axis currently used on the other side; rendered as disabled. */
  disabled?: AxisKey;
};

export function AxisSwitcher({ side, active, onChange, disabled }: Props) {
  const directionGlyph = side === "y" ? "↓" : "→";
  const directionLabel = side === "y" ? "rows go down" : "columns go right";

  return (
    <div
      style={{
        display: "flex",
        gap: "14px",
        alignItems: "center",
        fontFamily: "var(--font-mono)",
      }}
    >
      <span style={{ fontSize: "13px", color: "var(--text-subtle)" }}>
        {side} axis
      </span>
      {AXIS_OPTIONS.map((opt) => {
        const isActive = opt.key === active;
        const isDisabled = opt.key === disabled;
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => !isDisabled && !isActive && onChange(opt.key)}
            aria-pressed={isActive}
            disabled={isDisabled}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "14px",
              fontWeight: isActive ? 500 : 400,
              color: isActive
                ? "var(--text)"
                : isDisabled
                  ? "var(--text-subtle)"
                  : "var(--text-muted)",
              background: isActive ? "var(--surface)" : "transparent",
              padding: isActive ? "4px 10px" : "4px 0",
              borderRadius: "4px",
              cursor: isDisabled || isActive ? "default" : "pointer",
              transition: "color 0.15s ease, background-color 0.15s ease",
            }}
          >
            {opt.label}
          </button>
        );
      })}
      <span
        aria-hidden
        title={directionLabel}
        style={{
          fontSize: "16px",
          color: "var(--text-muted)",
          lineHeight: 1,
          marginLeft: "2px",
        }}
      >
        {directionGlyph}
      </span>
    </div>
  );
}
