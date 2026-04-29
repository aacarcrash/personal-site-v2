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
  disabled?: AxisKey; // can't pick the axis already used on the other side
};

export function AxisSwitcher({ side, active, onChange, disabled }: Props) {
  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        alignItems: "center",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          fontWeight: 500,
          color: "var(--text-subtle)",
          letterSpacing: "1px",
          textTransform: "uppercase",
        }}
      >
        {side.toUpperCase()}
      </span>
      {AXIS_OPTIONS.map((opt) => {
        const isActive = opt.key === active;
        const isDisabled = opt.key === disabled;
        return (
          <button
            key={opt.key}
            onClick={() => !isDisabled && !isActive && onChange(opt.key)}
            aria-pressed={isActive}
            disabled={isDisabled}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              fontWeight: isActive ? 500 : 400,
              color: isActive
                ? "var(--text)"
                : isDisabled
                ? "var(--text-subtle)"
                : "var(--text-muted)",
              background: isActive ? "var(--surface)" : "transparent",
              padding: isActive ? "3px 8px" : "3px 0",
              borderRadius: "3px",
              cursor: isDisabled || isActive ? "default" : "pointer",
              transition: "color 0.15s ease, background-color 0.15s ease",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
