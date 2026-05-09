"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { AxisKey, ProjectOrCluster } from "@/data/types";
import { AXIS_VALUES } from "@/data/types";
import { thumbFor } from "@/lib/thumb";
import { getProjectAxisValues } from "@/lib/axes";
import { clusterSlug } from "@/components/AxisGrid/axisGridUtils";
import { getCardSummary } from "@/components/AxisGrid/axisGridUtils";
import { useForceLayout, type AttractorNode, type Link as SimLink, type Node, type ProjectNode } from "./useForceLayout";
import { fitBlob, blobLabelAnchor } from "./fitBlob";

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 900;
const NODE_W = 56;
const NODE_H = 38;

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

const ACTIVE_AXES: AxisKey[] = ["concern", "medium", "context", "technology"];

const AXIS_LABELS: Record<AxisKey, string> = {
  year: "year",
  medium: "medium",
  concern: "concern",
  technology: "tech",
  context: "context",
};

/**
 * Hand-placed coordinates for each axis's values. The cluster view's
 * layout depends on these positions — attractors are pinned, projects
 * gravitate toward them via the force sim.
 *
 * Coordinates are in CANVAS_WIDTH × CANVAS_HEIGHT space.
 */
const ATTRACTOR_COORDS: Record<AxisKey, Record<string, { x: number; y: number }>> = {
  year: {
    "2026": { x: 1080, y: 220 },
    "2025": { x: 880, y: 200 },
    "2024": { x: 680, y: 280 },
    "2023": { x: 480, y: 480 },
    "2022": { x: 320, y: 680 },
  },
  medium: {
    Web: { x: 220, y: 200 },
    XR: { x: 480, y: 200 },
    Film: { x: 720, y: 200 },
    "Game engine": { x: 960, y: 280 },
    Performance: { x: 1080, y: 540 },
    Installation: { x: 720, y: 700 },
    Sound: { x: 380, y: 700 },
  },
  concern: {
    "Memory & loss": { x: 320, y: 540 },
    "Place & land": { x: 760, y: 740 },
    Worldbuilding: { x: 460, y: 220 },
    "Tools/interface": { x: 1000, y: 320 },
  },
  technology: {
    Web: { x: 220, y: 220 },
    "Game engine": { x: 540, y: 200 },
    "Creative coding": { x: 880, y: 240 },
    "Shader/GPU": { x: 1080, y: 480 },
    Hardware: { x: 760, y: 720 },
    "3D/Render": { x: 320, y: 700 },
  },
  context: {
    Product: { x: 320, y: 220 },
    Independent: { x: 720, y: 280 },
    "Commission/Exhibition": { x: 1000, y: 540 },
    Teaching: { x: 460, y: 700 },
  },
};

type Props = {
  projects: ProjectOrCluster[];
};

export function ClusterView({ projects }: Props) {
  const [axis, setAxis] = useState<AxisKey>("concern");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoveredAttractor, setHoveredAttractor] = useState<string | null>(null);

  const { nodes, links } = useMemo(() => {
    const attractorCoords = ATTRACTOR_COORDS[axis];
    const values = AXIS_VALUES[axis] as readonly string[];

    const attractors: AttractorNode[] = values
      .filter((v) => attractorCoords[v])
      .map((v) => ({
        id: `attractor:${v}`,
        kind: "attractor" as const,
        label: v,
        fx: attractorCoords[v].x,
        fy: attractorCoords[v].y,
      }));

    const projectNodes: ProjectNode[] = projects.map((p) => ({
      id: `project:${p.id}`,
      kind: "project" as const,
      payload: p,
    }));

    const allLinks: SimLink[] = [];
    for (const p of projects) {
      const tags = getProjectAxisValues(p, axis);
      for (const tag of tags) {
        if (attractorCoords[tag]) {
          allLinks.push({
            source: `project:${p.id}`,
            target: `attractor:${tag}`,
          });
        }
      }
    }

    return {
      nodes: [...attractors, ...projectNodes] as Node[],
      links: allLinks,
    };
  }, [projects, axis]);

  const positions = useForceLayout(nodes, links, {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  });

  const activeProject =
    hoveredId && hoveredId.startsWith("project:")
      ? projects.find((p) => `project:${p.id}` === hoveredId)
      : null;
  const activeProjectTags = activeProject
    ? new Set(getProjectAxisValues(activeProject, axis))
    : null;

  // Compute a smooth ellipse around each attractor's projects, fitted to
  // the actual settled positions via PCA. Multi-tag projects appear in
  // multiple ellipses — when their settled position is inside both, the
  // wells visibly overlap (Venn-style), telling the truth about how the
  // work sits across categories.
  const blobs = useMemo(() => {
    type ResolvedBlob = {
      label: string;
      shape: ReturnType<typeof fitBlob>;
      labelAnchor: { x: number; y: number };
      count: number;
    };
    const result: ResolvedBlob[] = [];
    if (positions.size === 0) return result;
    for (const attr of nodes) {
      if (attr.kind !== "attractor") continue;
      const tagged: { x: number; y: number }[] = [];
      for (const p of projects) {
        const projectTags = getProjectAxisValues(p, axis);
        if (!projectTags.includes(attr.label)) continue;
        const pos = positions.get(`project:${p.id}`);
        if (pos) tagged.push({ x: pos.x, y: pos.y });
      }
      if (tagged.length === 0) continue;
      const shape = fitBlob(tagged, 60);
      if (!shape) continue;
      const labelText = attr.label.toUpperCase();
      const labelWidth = labelText.length * 8.6 + 16;
      const labelAnchor = blobLabelAnchor(
        shape,
        labelWidth,
        CANVAS_WIDTH,
        CANVAS_HEIGHT,
      );
      result.push({ label: attr.label, shape, labelAnchor, count: tagged.length });
    }
    // Render larger blobs first so smaller blobs paint on top — the
    // tightly-packed clusters stay legible.
    result.sort((a, b) => {
      if (!a.shape || !b.shape) return 0;
      return b.shape.rx * b.shape.ry - a.shape.rx * a.shape.ry;
    });
    return result;
  }, [nodes, positions, projects, axis]);

  return (
    <section style={{ padding: "0 64px 64px", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: "8px",
          paddingBottom: "16px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--text-muted)",
            letterSpacing: "0.3px",
          }}
        >
          cluster by
        </span>
        {ACTIVE_AXES.map((a) => {
          const active = a === axis;
          return (
            <button
              key={a}
              type="button"
              onClick={() => setAxis(a)}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: active ? "var(--text)" : "var(--text-muted)",
                letterSpacing: "0.3px",
                padding: "2px 8px",
                background: active ? "var(--surface)" : "transparent",
                border: "none",
                borderRadius: "2px",
                cursor: "pointer",
              }}
            >
              {AXIS_LABELS[a]}
            </button>
          );
        })}
      </div>

      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`,
          border: "0.5px solid var(--border)",
          background: "var(--bg)",
          overflow: "hidden",
        }}
      >
        <svg
          viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
          width="100%"
          height="100%"
          style={{ position: "absolute", inset: 0, display: "block" }}
        >
          {/* Amorphous blob wells — shape follows where projects actually
              settled. Multi-tag projects appear in multiple blobs, so wells
              visibly overlap (Venn-diagram style). */}
          {blobs.map((blob) => {
            if (!blob.shape) return null;
            const { cx, cy, rx, ry, rotation } = blob.shape;
            const isHighlighted =
              activeProjectTags?.has(blob.label) ||
              hoveredAttractor === blob.label;
            const labelText = blob.label.toUpperCase();
            const labelWidth = labelText.length * 8.6 + 16;
            return (
              <g
                key={blob.label}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHoveredAttractor(blob.label)}
                onMouseLeave={() => setHoveredAttractor(null)}
              >
                <ellipse
                  cx={cx}
                  cy={cy}
                  rx={rx}
                  ry={ry}
                  transform={`rotate(${rotation} ${cx} ${cy})`}
                  fill="var(--text)"
                  fillOpacity={isHighlighted ? 0.05 : 0.02}
                  stroke="var(--text-muted)"
                  strokeWidth={0.6}
                  strokeDasharray="3 4"
                  opacity={isHighlighted ? 0.95 : 0.55}
                  style={{ transition: "all 0.18s ease" }}
                />
                <rect
                  x={blob.labelAnchor.x - labelWidth / 2}
                  y={blob.labelAnchor.y - 12}
                  width={labelWidth}
                  height={18}
                  fill="var(--bg)"
                  fillOpacity={0.92}
                  style={{ pointerEvents: "none" }}
                />
                <text
                  x={blob.labelAnchor.x}
                  y={blob.labelAnchor.y}
                  textAnchor="middle"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "13px",
                    fill: "var(--text)",
                    fontWeight: 500,
                    letterSpacing: "0.4px",
                    textTransform: "uppercase",
                    opacity: isHighlighted ? 1 : 0.8,
                    pointerEvents: "none",
                  }}
                >
                  {blob.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Project nodes (HTML over SVG so we get real <Image>) */}
        {nodes
          .filter((n): n is ProjectNode => n.kind === "project")
          .map((node) => {
            const pos = positions.get(node.id);
            if (!pos) return null;
            const project = node.payload as ProjectOrCluster;
            const isHovered = hoveredId === node.id;
            const projectTags = getProjectAxisValues(project, axis);
            const isMulti = projectTags.length > 1;
            const matchesHoveredAttractor =
              hoveredAttractor === null || projectTags.includes(hoveredAttractor);
            const dimmed = hoveredAttractor !== null && !matchesHoveredAttractor;
            const placeholder = isPlaceholder(project.thumbnail);
            const isCluster = project.type === "cluster";
            const href = isCluster
              ? `/sketches/${clusterSlug(project)}`
              : `/projects/${(project as Extract<ProjectOrCluster, { type: "project" }>).slug}`;
            const summary = getCardSummary(project);
            return (
              <Link
                key={node.id}
                href={href}
                onMouseEnter={() => setHoveredId(node.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  position: "absolute",
                  left: `${(pos.x / CANVAS_WIDTH) * 100}%`,
                  top: `${(pos.y / CANVAS_HEIGHT) * 100}%`,
                  width: NODE_W,
                  height: NODE_H,
                  marginLeft: -NODE_W / 2,
                  marginTop: -NODE_H / 2,
                  borderRadius: 2,
                  overflow: "visible",
                  background: "transparent",
                  transform: isHovered ? "scale(1.05)" : "scale(1)",
                  transition: "transform 0.18s ease-out, opacity 0.18s ease",
                  opacity: dimmed ? 0.15 : 1,
                  zIndex: isHovered ? 20 : 1,
                  display: "block",
                  pointerEvents: dimmed ? "none" : "auto",
                }}
                aria-label={project.name}
              >
                <span
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 2,
                    overflow: "hidden",
                    background: placeholder
                      ? PLACEHOLDER_GRADIENTS[project.id] ?? "var(--surface)"
                      : "var(--surface)",
                    outline: isMulti ? "1px solid var(--text)" : "none",
                    outlineOffset: 2,
                  }}
                >
                  {!placeholder && (
                    <Image
                      src={thumbFor(project.thumbnail)}
                      alt={project.name}
                      fill
                      sizes="56px"
                      style={{ objectFit: "cover" }}
                    />
                  )}
                </span>
                {isHovered && (
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      top: NODE_H + 10,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 220,
                      background: "var(--bg)",
                      border: "0.5px solid var(--border)",
                      borderRadius: 4,
                      boxShadow: "0 6px 22px rgba(0,0,0,0.14)",
                      padding: "10px 12px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      pointerEvents: "none",
                      zIndex: 50,
                      lineHeight: 1.4,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: 16,
                        color: "var(--text)",
                        letterSpacing: "-0.2px",
                      }}
                    >
                      {project.name}
                    </span>
                    {summary && (
                      <span
                        style={{
                          fontFamily: "var(--font-inter)",
                          fontSize: 12,
                          color: "var(--text-muted)",
                        }}
                      >
                        {summary}
                      </span>
                    )}
                    {projectTags.length > 0 && (
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          color: "var(--text-subtle)",
                          letterSpacing: "0.3px",
                          paddingTop: 2,
                          textTransform: "uppercase",
                        }}
                      >
                        {projectTags.join(" · ")}
                      </span>
                    )}
                  </span>
                )}
              </Link>
            );
          })}
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          paddingTop: "16px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>
          <LegendItem label="Project node">
            <span style={{ width: 24, height: 16, background: "var(--text-muted)", borderRadius: 1, display: "inline-block" }} />
          </LegendItem>
          <LegendItem label="Multi-tag (between attractors)">
            <span
              style={{
                width: 24,
                height: 16,
                background: "var(--text-muted)",
                borderRadius: 1,
                display: "inline-block",
                outline: "1px solid var(--text)",
                outlineOffset: 2,
                marginRight: 4,
              }}
            />
          </LegendItem>
          <LegendItem label={`${axis} attractor`}>
            <span
              style={{
                width: 16,
                height: 16,
                border: "0.5px dashed var(--text-muted)",
                borderRadius: "50%",
                display: "inline-block",
              }}
            />
          </LegendItem>
        </div>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--text-muted)",
            letterSpacing: "0.3px",
          }}
        >
          Hover a project to highlight its attractors · click to open
        </span>
      </div>
    </section>
  );
}

function LegendItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span style={{ display: "flex", gap: "8px", alignItems: "center" }}>
      {children}
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          color: "var(--text-secondary)",
          letterSpacing: "0.3px",
        }}
      >
        {label}
      </span>
    </span>
  );
}
