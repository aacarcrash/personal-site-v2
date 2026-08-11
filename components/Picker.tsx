"use client";

/**
 * The one segmented picker for the whole site.
 *
 * There were FOUR implementations of this control before: the grid's two
 * axis switchers (13px, bracketed chip), the cluster view's "cluster by"
 * row (12px, plain chip), and the list view's sort toggle (12px, plain
 * chip). Same job, three different visual languages, so the control
 * changed appearance depending on which view mode you were in.
 *
 * Generic over the key type because the three callers pick different
 * things — an AxisKey in the grid and cluster, a SortKey in the list.
 */
type Option<T extends string> = { key: T; label: string };

type Props<T extends string> = {
  /** What sits before the options — "Y", "X", "cluster by", "sort". */
  label: string;
  options: Option<T>[];
  active: T;
  onChange: (next: T) => void;
  /** An option that cannot be chosen because it is in use elsewhere. */
  disabled?: T;
  /** Where the disabled option is in use, for its accessible name. */
  takenOn?: string;
  /** What to do when the taken option is clicked. With this, the dashed
   *  option is not dead — it trades places with the axis holding it, which is
   *  the only thing a person could mean by clicking it. Without it, the
   *  option stays genuinely inert (the list sort picker has no second axis
   *  to trade with). */
  onSwap?: () => void;
  /** The two keys that drive this picker, e.g. ["W", "S"]. Shows the same
   *  hint object the view bar uses, on hover. */
  keys?: [string, string];
  /** What those keys move, in the user's words — "rows", "columns", "sort". */
  keysLabel?: string;
  /** Hang the hint from the right edge, for a picker aligned to the right. */
  align?: "start" | "end";
};

export function Picker<T extends string>({
  label,
  options,
  active,
  onChange,
  disabled,
  takenOn,
  onSwap,
  keys,
  keysLabel,
  align = "start",
}: Props<T>) {
  return (
    <div className="picker-wrap" data-align={align}>
      {keys && (
        <span className="picker-keyhint" aria-hidden>
          <span className="key-cap">{keys[0]}</span>
          <span className="key-cap">{keys[1]}</span>
          {keysLabel}
        </span>
      )}
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
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
        {label}
      </span>
      {options.map((opt) => {
        const isActive = opt.key === active;
        const isDisabled = opt.key === disabled;
        const isSwap = isDisabled && !!onSwap;
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => {
              if (isSwap) return onSwap();
              if (!isDisabled && !isActive) onChange(opt.key);
            }}
            aria-pressed={isActive}
            disabled={isDisabled && !isSwap}
            /* A disabled option is not broken — it is already in use on the
               other axis. Putting that in the accessible name keeps the
               state off colour alone. When it can be swapped, say the
               outcome, not the state: the click does something. */
            title={
              isSwap
                ? `Swap the axes — put ${opt.label} on ${label}`
                : isDisabled && takenOn
                  ? `Already the ${takenOn} axis`
                  : undefined
            }
            aria-label={
              isSwap
                ? `Swap the axes — put ${opt.label} on the ${label} axis`
                : isDisabled && takenOn
                  ? `${opt.label} — already the ${takenOn} axis`
                  : undefined
            }
            style={{
              display: "inline-flex",
              alignItems: "baseline",
              gap: 0,
              fontFamily: "var(--font-mono)",
              /* One step below the featured byline (--step-sm). At
                 --step-data these read as the same weight as the copy above
                 them, so the controls stopped being chrome. Contrast is kept
                 by the ink, not the size: --text-secondary is 9.6:1. */
              fontSize: "var(--step-meta)",
              lineHeight: "var(--lh-meta)",
              /* No weight dial: every Sheet U face is single-weight. The
                 selection is the brackets plus the --surface fill. No
                 outline — it read as too boxed-in. */
              /* --text-disabled is only for ink that cannot be clicked. Once
                 the dashed option swaps the axes it is a live control, so it
                 rides --text-muted (6.3:1) instead of --text-disabled
                 (3.4:1). Truly inert options — a picker with no onSwap —
                 keep the disabled ink. */
              color: isActive
                ? "var(--text)"
                : isSwap
                  ? "var(--text-muted)"
                  : isDisabled
                    ? "var(--text-disabled)"
                    : "var(--text-secondary)",
              background: isActive ? "var(--surface)" : "transparent",
              /* Dashed only on the taken option, so "spoken for" is a mark
                 rather than a grey step compared across the row. */
              border: isDisabled
                ? "0.5px dashed var(--border)"
                : "0.5px solid transparent",
              padding: isActive || isDisabled ? "4px 7px" : "4px 0",
              borderRadius: "var(--radius-sm)",
              cursor: isActive || (isDisabled && !isSwap) ? "default" : "pointer",
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
    </div>
  );
}
