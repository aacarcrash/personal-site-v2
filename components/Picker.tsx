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
};

export function Picker<T extends string>({
  label,
  options,
  active,
  onChange,
  disabled,
  takenOn,
}: Props<T>) {
  return (
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
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => !isDisabled && !isActive && onChange(opt.key)}
            aria-pressed={isActive}
            disabled={isDisabled}
            /* A disabled option is not broken — it is already in use on the
               other axis. Putting that in the accessible name keeps the
               state off colour alone. */
            title={isDisabled && takenOn ? `Already the ${takenOn} axis` : undefined}
            aria-label={
              isDisabled && takenOn
                ? `${opt.label} — already the ${takenOn} axis`
                : undefined
            }
            style={{
              display: "inline-flex",
              alignItems: "baseline",
              gap: 0,
              fontFamily: "var(--font-mono)",
              fontSize: "var(--step-data)",
              lineHeight: "var(--lh-data)",
              /* No weight dial: every Sheet U face is single-weight. The
                 selection is the brackets plus the --surface fill. No
                 outline — it read as too boxed-in. */
              color: isActive
                ? "var(--text)"
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
