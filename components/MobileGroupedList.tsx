"use client";

import { useMemo, useState } from "react";
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
                showTag={getProjectAxisValues(item, showAxis).join(" · ")}
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

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
  return (
    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
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
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as AxisKey)}
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--step-label)",
          lineHeight: "var(--lh-label)",
          color: "var(--text)",
          background: "var(--surface)",
          padding: "3px 8px",
          borderRadius: "3px",
          border: "0.5px solid var(--border)",
          cursor: "pointer",
          appearance: "none",
        }}
      >
        {PRIMARY_OPTIONS.map((opt) => (
          <option key={opt.key} value={opt.key} disabled={opt.key === disabled}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Row({
  item,
  showTag,
}: {
  item: ProjectOrCluster;
  showTag: string;
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
          borderRadius: "3px",
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
        {isCluster && (
          <span
            style={{
              position: "absolute",
              top: -5,
              right: -5,
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "var(--text)",
              color: "var(--bg)",
              fontFamily: "var(--font-mono)",
              // Was 7px, the smallest literal in the codebase and well under
              // the 11px ramp floor. The badge circle grows with it.
              fontSize: "var(--step-label)",
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1.5px solid var(--bg)",
            }}
          >
            {item.count}
          </span>
        )}
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
          // minWidth:0 alone only lets the box shrink — an unbreakable title
          // ("Electronicos Fantasticos") still overflowed it and painted
          // under the tag chip at 375/390. This lets the word itself break.
          overflowWrap: "anywhere",
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
          whiteSpace: "nowrap",
          // The chip is nowrap, so without this flex would shrink its BOX
          // while the text kept its width — the text spilled left over the
          // title. Reserving the box is what actually stops the overlap.
          flexShrink: 0,
        }}
      >
        {showTag}
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
