"use client";

import Link from "next/link";
import Image from "next/image";
import type { AxisKey, ProjectOrCluster } from "@/data/types";
import { thumbFor } from "@/lib/thumb";
import { getProjectAxisValues } from "@/lib/axes";
import { clusterSlug } from "@/components/AxisGrid/axisGridUtils";
import type { Filters } from "./filterProjects";
import { getProjectTools } from "./filterProjects";

const PLACEHOLDER_GRADIENTS: Record<string, string> = {
  mare: "linear-gradient(135deg, #1a1a1a 0%, #333 50%, #1f1f1f 100%)",
  "date-0-0": "linear-gradient(135deg, #1a1a2e 0%, #2a2a4e 50%, #1a1a3e 100%)",
  "aa-warsaw": "linear-gradient(135deg, #2a2a1a 0%, #3a3a2a 50%, #2a2a1a 100%)",
  "mutek-ae": "linear-gradient(135deg, #1a1a2a 0%, #3a2a4a 50%, #0a0a1a 100%)",
  "spoon-spade-shovel": "linear-gradient(135deg, #2a2520 0%, #4a3a30 50%, #1a1510 100%)",
};

function isPlaceholder(thumbnail: string): boolean {
  if (!thumbnail || thumbnail.includes("/placeholder.")) return true;
  if (/^https?:\/\//i.test(thumbnail)) return true;
  return false;
}

const TAG_AXES: AxisKey[] = ["medium", "concern", "context"];

type Props = {
  item: ProjectOrCluster;
  filters: Filters;
  toggleAxis: (axis: AxisKey, value: string) => void;
  toggleTool: (tool: string) => void;
};

export function ProjectRow({ item, filters, toggleAxis, toggleTool }: Props) {
  const isCluster = item.type === "cluster";
  const placeholder = isPlaceholder(item.thumbnail);
  const tools = getProjectTools(item);

  const href = isCluster
    ? `/sketches/${clusterSlug(item)}`
    : `/projects/${(item as Extract<ProjectOrCluster, { type: "project" }>).slug}`;

  return (
    <div className="pr-row">
      <Link
        href={href}
        className="pr-thumb"
        style={{
          borderRadius: "2px",
          overflow: "hidden",
          position: "relative",
          background: placeholder
            ? PLACEHOLDER_GRADIENTS[item.id] ?? "var(--surface)"
            : "var(--surface)",
          display: "block",
        }}
        aria-label={item.name}
      >
        {!placeholder && (
          <Image
            src={thumbFor(item.thumbnail)}
            alt={item.name}
            fill
            sizes="(max-width: 820px) 100vw, 144px"
            style={{ objectFit: "cover" }}
          />
        )}
      </Link>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: "16px",
          }}
        >
          <Link
            href={href}
            className="pr-title"
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--text)",
              letterSpacing: "-0.5px",
              lineHeight: 1,
              textDecoration: "none",
            }}
          >
            {item.name}
          </Link>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--text-muted)",
              letterSpacing: "0.5px",
              flexShrink: 0,
            }}
          >
            {getProjectAxisValues(item, "year").join(" / ")}
          </span>
        </div>
        {item.subtitle && (
          <span
            className="pr-sub"
            style={{
              fontFamily: "var(--font-sans)",
              color: "var(--text-secondary)",
              lineHeight: 1.45,
              maxWidth: "640px",
            }}
          >
            {item.subtitle}
          </span>
        )}

        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", paddingTop: "4px" }}>
          {TAG_AXES.flatMap((axis) =>
            getProjectAxisValues(item, axis).map((v) => {
              const active = filters[axis]?.has(v) ?? false;
              return (
                <Chip
                  key={`${axis}:${v}`}
                  label={v}
                  active={active}
                  onClick={() => toggleAxis(axis, v)}
                />
              );
            }),
          )}
        </div>

        {tools.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "6px",
              paddingTop: "4px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: "var(--text-muted)",
                letterSpacing: "0.4px",
                textTransform: "uppercase",
                marginRight: "2px",
              }}
            >
              Tools
            </span>
            {tools.map((t) => {
              const active = filters.tools?.has(t) ?? false;
              return (
                <ToolChip
                  key={t}
                  label={t}
                  active={active}
                  onClick={() => toggleTool(t)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
        color: active ? "var(--text)" : "var(--text-muted)",
        padding: "3px 8px",
        border: `0.5px solid ${active ? "var(--text)" : "var(--border)"}`,
        borderRadius: "2px",
        background: "transparent",
        cursor: "pointer",
        letterSpacing: "0.4px",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

function ToolChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  // Tools chips are visually lighter than tag chips — no border by default,
  // just a subtle dot separator feel. Active state matches the tag chips.
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "12px",
        color: active ? "var(--text)" : "var(--text-secondary)",
        padding: "2px 6px",
        border: active ? "0.5px solid var(--text)" : "0.5px solid transparent",
        borderRadius: "2px",
        background: "transparent",
        cursor: "pointer",
        letterSpacing: "0.3px",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}
