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
  disabled?: AxisKey;
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
          fontSize: "var(--step-label)",
          lineHeight: "var(--lh-label)",
          color: "var(--text-muted)",
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
              fontSize: "var(--step-data)",
              lineHeight: "var(--lh-data)",
              /* No weight dial: every Sheet U face is single-weight, so the
                 active state is carried by --text plus the --surface chip. */
              color: isActive
                ? "var(--text)"
                : isDisabled
                  ? "var(--text-disabled)"
                  : "var(--text-muted)",
              background: isActive ? "var(--surface)" : "transparent",
              padding: isActive ? "4px 9px" : "4px 0",
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
