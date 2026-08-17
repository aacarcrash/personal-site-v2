"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { AxisKey, ProjectOrCluster } from "@/data/types";
import { AXIS_VALUES } from "@/data/types";
import { thumbFor } from "@/lib/thumb";
import { getProjectAxisValues } from "@/lib/axes";
import { clusterSlug } from "./AxisGrid/axisGridUtils";

const PRIMARY_OPTIONS: { key: AxisKey; label: string }[] = [
  { key: "year", label: "time" },
  { key: "medium", label: "medium" },
  { key: "concern", label: "concern" },
  { key: "technology", label: "tech" },
  { key: "context", label: "context" },
];

const PLACEHOLDER_GRADIENTS: Record<string, string> = {
  mare: "linear-gradient(135deg, #1a1a1a 0%, #333 50%, #1f1f1f 100%)",
  "date-0-0": "linear-gradient(135deg, #1a1a2e 0%, #2a2a4e 50%, #1a1a3e 100%)",
  "aa-warsaw": "linear-gradient(135deg, #2a2a1a 0%, #3a3a2a 50%, #2a2a1a 100%)",
};

function isPlaceholder(thumbnail: string): boolean {
  if (!thumbnail || thumbnail.includes("/placeholder.")) return true;
  if (/^https?:\/\//i.test(thumbnail)) return true;
  return false;
}

type Props = {
  projects: ProjectOrCluster[];
};

export function MobileGroupedList({ projects }: Props) {
  const [groupBy, setGroupBy] = useState<AxisKey>("year");
  const [showAxis, setShowAxis] = useState<AxisKey>("medium");

  const grouped = useMemo(() => {
    const groups = new Map<string, ProjectOrCluster[]>();
    for (const p of projects) {
      for (const key of getProjectAxisValues(p, groupBy)) {
        const existing = groups.get(key);
        if (existing) {
          if (!existing.includes(p)) existing.push(p);
        } else {
          groups.set(key, [p]);
        }
      }
    }
    // Order by axis declaration
    const ordered: { key: string; items: ProjectOrCluster[] }[] = [];
    for (const v of AXIS_VALUES[groupBy]) {
      const items = groups.get(v as string);
      if (items && items.length > 0) ordered.push({ key: v as string, items });
    }
    return ordered;
  }, [projects, groupBy]);

  return (
    <section style={{ display: "flex", flexDirection: "column" }}>
      {/* Selector row */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          padding: "8px 20px 16px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Selector label="Group by" value={groupBy} onChange={setGroupBy} disabled={showAxis} />
        <Selector label="Show" value={showAxis} onChange={setShowAxis} disabled={groupBy} />
      </div>

      {/* Grouped list */}
      <div style={{ padding: "0 20px" }}>
        {grouped.map(({ key, items }) => (
          <div key={key}>
            <div
              style={{
                padding: "12px 0 8px",
                borderBottom: "0.5px solid var(--border)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--step-meta)",
                  lineHeight: "var(--lh-meta)",
                  color: "var(--text-muted)",
                }}
              >
                {key}
              </span>
            </div>
            {items.map((item) => (
              <Row
                key={item.id}
                item={item}
                showTag={getProjectAxisValues(item, showAxis)}
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

// A real listbox, not a <select>. `appearance: none` styles only the CLOSED
// state — the moment a native select opens, the OS draws the list, with the
// system typeface, system colours and system metrics. On this site that meant
// a stock grey dropdown appearing in the middle of a monochrome, mono-type
// page. Nothing in CSS can reach it, so the control has to be rebuilt.
//
// Keyboard contract matches the native one it replaces: Enter/Space/ArrowDown
// open, arrows move, Enter/Space commit, Escape cancels, Tab or an outside
// click dismisses. Roles are listbox/option with aria-activedescendant, so
// screen readers announce it as the same kind of widget as before.
function Selector({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: AxisKey;
  onChange: (v: AxisKey) => void;
  disabled?: AxisKey;
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  /* useMemo, or the arrow keys do not work at all.
     This filter built a NEW array on every render, so the effect below —
     which lists `options` as a dependency — never compared equal and ran
     after every render, not just on open. Every ArrowDown set activeIndex,
     re-rendered, and the effect immediately reset it to the index of the
     value already selected. Driving the real UI: Enter, ArrowDown, Enter
     left "time" selected. Hover highlighting died the same way. */
  const options = useMemo(
    () => PRIMARY_OPTIONS.filter((o) => o.key !== disabled),
    [disabled],
  );
  const currentLabel =
    PRIMARY_OPTIONS.find((o) => o.key === value)?.label ?? String(value);

  const commit = useCallback(
    (key: AxisKey) => {
      onChange(key);
      setOpen(false);
    },
    [onChange],
  );

  // Dismiss on outside click. Pointerdown rather than click so it closes
  // before the underlying element reacts.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [open]);

  useEffect(() => {
    if (open) setActiveIndex(Math.max(0, options.findIndex((o) => o.key === value)));
  }, [open, options, value]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + options.length) % options.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const opt = options[activeIndex];
      if (opt) commit(opt.key);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div
      ref={rootRef}
      style={{ display: "flex", gap: "6px", alignItems: "center", position: "relative" }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--step-label)",
          lineHeight: "var(--lh-label)",
          color: "var(--text-muted)",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </span>
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-haspopup="listbox"
        aria-activedescendant={open ? `${listId}-${activeIndex}` : undefined}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--step-label)",
          lineHeight: "var(--lh-label)",
          color: "var(--text)",
          background: "var(--surface)",
          padding: "4px 9px",
          borderRadius: "var(--radius-sm)",
          border: "0.5px solid var(--border)",
          cursor: "pointer",
        }}
      >
        {currentLabel}
      </button>
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            zIndex: 50,
            listStyle: "none",
            margin: 0,
            padding: "4px",
            minWidth: "128px",
            background: "var(--bg)",
            border: "0.5px solid var(--border)",
            borderRadius: "6px",
            boxShadow: "0 6px 20px rgba(17,17,17,0.10)",
          }}
        >
          {options.map((opt, i) => {
            const selected = opt.key === value;
            const active = i === activeIndex;
            return (
              <li
                key={opt.key}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={selected}
                onPointerDown={(e) => {
                  e.preventDefault();
                  commit(opt.key);
                }}
                onPointerEnter={() => setActiveIndex(i)}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--step-label)",
                  lineHeight: "var(--lh-label)",
                  color: selected ? "var(--text)" : "var(--text-secondary)",
                  background: active ? "var(--surface)" : "transparent",
                  padding: "7px 10px",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {opt.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Row({
  item,
  showTag,
}: {
  item: ProjectOrCluster;
  showTag: string[];
}) {
  const placeholder = isPlaceholder(item.thumbnail);
  const isCluster = item.type === "cluster";

  const inner = (
    <>
      <div
        style={{
          position: "relative",
          width: "56px",
          height: "40px",
          borderRadius: "var(--radius-sm)",
          overflow: "hidden",
          background: placeholder
            ? PLACEHOLDER_GRADIENTS[item.id] ?? "var(--surface)"
            : "var(--surface)",
          flexShrink: 0,
        }}
      >
        {!placeholder && (
          <Image
            src={thumbFor(item.thumbnail)}
            alt={item.name}
            fill
            sizes="56px"
            style={{ objectFit: "cover" }}
          />
        )}
        {/* The count badge is gone. It was pinned at top/right -5 INSIDE a
            box with overflow:hidden — the same rule that rounds the thumbnail
            corners — so ~40% of the circle was clipped off. The grid dropped
            its digit badge for the deck stack for the same reason it is not
            missed here: a cluster's count is not what tells you what the row
            is, and the row already names it. */}
        {/* Sibling overlay, not a boxShadow on the container: an inset
            box-shadow paints under the Image's absolutely positioned fill
            child, so it was invisible. This sits after it in DOM order. */}
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            boxShadow: "inset 0 0 0 1px var(--thumb-inset-tight)",
            pointerEvents: "none",
          }}
        />
      </div>
      <span
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "var(--step-sm)",
          lineHeight: "var(--lh-sm)",
          color: "var(--text)",
          flex: 1,
          // Let the name yield space so a long nowrap tag can't push the row
          // past the viewport.
          minWidth: 0,
          // break-word, NOT anywhere. `anywhere` also drops the box's
          // MIN-CONTENT width to a single character, so flex was free to
          // squeeze the title to nothing against the nowrap chip — long
          // names rendered as one letter per line. `break-word` leaves
          // min-content at the longest word, so the row keeps a real floor
          // and only breaks a word when it genuinely cannot fit.
          overflowWrap: "break-word",
        }}
      >
        {item.name}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--step-meta)",
          lineHeight: "var(--lh-meta)",
          color: "var(--text-muted)",
          background: "var(--surface)",
          padding: "2px 6px",
          borderRadius: "2px",
          /* First value, then a count. Everything else was tried here and
             each fix broke something: capping a nowrap chip truncated
             mid-word ("Performance · S…"), wrapping it made the box a
             flat 40% slab whatever it held, min-content sizing fixed the
             width but a max-height cut into the padding and stranded the
             previous value's separator on the cut line.
             One value plus "+2" cannot do any of that: it never wraps, it
             hugs its content, and it is the same rule the desktop grid tile
             already uses for extra axis values. The full set is on the
             project page. */
          flexShrink: 0,
          whiteSpace: "nowrap",
        }}
      >
        {showTag[0]}
        {showTag.length > 1 && (
          /* --text-muted, NOT --text-disabled. The chip sits on --surface,
             not --bg, where --text-disabled measures 3.03:1 light and 3.22:1
             dark at 12px — under the 4.5:1 floor. It is also inside a <Link>,
             and the token's documented role in globals.css is "genuinely
             non-interactive disabled options only. Never for live controls."
             The same misuse was removed from the /cv rail in this same batch. */
          <span style={{ color: "var(--text-muted)" }}>
            {` +${showTag.length - 1}`}
          </span>
        )}
      </span>
    </>
  );

  const styles: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 0",
    borderBottom: "0.5px solid var(--border)",
    width: "100%",
  };

  const href = isCluster
    ? `/sketches/${clusterSlug(item)}`
    : `/projects/${(item as Extract<ProjectOrCluster, { type: "project" }>).slug}`;
  return (
    <Link href={href} style={styles}>
      {inner}
    </Link>
  );
}
