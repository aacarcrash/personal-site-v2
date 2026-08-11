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
  const otherSide = side === "y" ? "X" : "Y";
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
            /* The disabled option is not broken — it is the axis currently
               drawn on the OTHER side, so it cannot be picked twice. Saying
               that out loud in the accessible name means the state does not
               rest on colour, which is what it used to do. */
            title={
              isDisabled ? `Already the ${otherSide} axis` : undefined
            }
            aria-label={
              isDisabled ? `${opt.label} — already the ${otherSide} axis` : undefined
            }
            style={{
              display: "inline-flex",
              alignItems: "baseline",
              gap: 0,
              fontFamily: "var(--font-mono)",
              fontSize: "var(--step-data)",
              lineHeight: "var(--lh-data)",
              /* No weight dial: every Sheet U face is single-weight. The
                 selected state is a hairline chip plus typed brackets — a
                 mono-native selection mark that costs no colour, and reads
                 without the inverted-ink block the site does not want.
                 --surface on --bg is only a 4% step, so the 0.5px edge is
                 what actually makes the chip an object. */
              color: isActive
                ? "var(--text)"
                : isDisabled
                  ? "var(--text-disabled)"
                  : "var(--text-secondary)",
              background: isActive ? "var(--surface)" : "transparent",
              border: isActive
                ? "0.5px solid var(--border)"
                : isDisabled
                  ? /* Dashed, so "taken" is carried by the mark and not by a
                       grey step a reader has to compare across the row. */
                    "0.5px dashed var(--border)"
                  : "0.5px solid transparent",
              padding: isActive || isDisabled ? "4px 7px" : "4px 0",
              borderRadius: "3px",
              cursor: isDisabled || isActive ? "default" : "pointer",
              transition: "color 0.15s ease, background-color 0.15s ease",
            }}
          >
            {isActive && (
              <span aria-hidden style={{ color: "var(--text-muted)" }}>
                [
              </span>
            )}
            <span style={{ padding: isActive ? "0 3px" : 0 }}>{opt.label}</span>
            {isActive && (
              <span aria-hidden style={{ color: "var(--text-muted)" }}>
                ]
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
