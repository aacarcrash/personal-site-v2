"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { AxisKey, ProjectOrCluster } from "@/data/types";
import { thumbFor } from "@/lib/thumb";
import { getProjectAxisValues } from "@/lib/axes";
import { getCardSummary, clusterSlug } from "./axisGridUtils";

const PLACEHOLDER_GRADIENTS: Record<string, string> = {
  mare: "linear-gradient(135deg, #1a1a1a 0%, #333 50%, #1f1f1f 100%)",
  "date-0-0": "linear-gradient(135deg, #1a1a2e 0%, #2a2a4e 50%, #1a1a3e 100%)",
  "aa-warsaw": "linear-gradient(135deg, #2a2a1a 0%, #3a3a2a 50%, #2a2a1a 100%)",
  "latent-space":
    "linear-gradient(135deg, #17151f 0%, #241f33 50%, #1a1730 100%)",
  "dark-mofo": "linear-gradient(135deg, #2a1414 0%, #3a1a1a 50%, #241010 100%)",
};
const PLACEHOLDER_INITIALS: Record<string, string> = {
  mare: "Mare",
  "date-0-0": "0:0",
  "aa-warsaw": "AA",
  "latent-space": "latent",
  "dark-mofo": "Mofo",
};

function isPlaceholder(thumbnail: string): boolean {
  if (thumbnail === "" || thumbnail.includes("/placeholder.")) return true;
  if (/^https?:\/\//i.test(thumbnail)) return true;
  return false;
}

type Props = {
  item: ProjectOrCluster;
  yAxis?: AxisKey;
  xAxis?: AxisKey;
  yValue?: string;
  xValue?: string;
  /** This tile is the one being hovered in its cell — blooms to fill the cell. */
  filled?: boolean;
  /** Another tile in this cell is hovered — dim back. */
  faded?: boolean;
  onEnter?: () => void;
};

export function ProjectCell({
  item,
  yAxis,
  xAxis,
  yValue,
  xValue,
  filled,
  faded,
  onEnter,
}: Props) {
  const isCluster = item.type === "cluster";
  const placeholder = isPlaceholder(item.thumbnail);
  const summary = getCardSummary(item);

  const extraValues: string[] = [];
  if (yAxis && yValue)
    for (const v of getProjectAxisValues(item, yAxis))
      if (v !== yValue) extraValues.push(v);
  if (xAxis && xValue)
    for (const v of getProjectAxisValues(item, xAxis))
      if (v !== xValue) extraValues.push(v);
  const extraLabel =
    extraValues.length === 1
      ? `+ ${extraValues[0]}`
      : extraValues.length > 1
        ? `+${extraValues.length}`
        : null;

  const href = isCluster
    ? `/sketches/${clusterSlug(item)}`
    : `/projects/${(item as Extract<ProjectOrCluster, { type: "project" }>).slug}`;

  const bg = placeholder
    ? (PLACEHOLDER_GRADIENTS[item.id] ?? "var(--surface)")
    : "var(--surface)";

  // Hovered tile: bloom to fill the cell (absolute), show the name, no chip.
  if (filled) {
    return (
      <motion.span
        key="filled"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "absolute",
          inset: "8px",
          zIndex: 5,
          borderRadius: "4px",
          overflow: "hidden",
          display: "block",
          transformOrigin: "center",
        }}
      >
        <Link
          href={href}
          aria-label={item.name}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            position: "relative",
          }}
        >
          <span style={{ position: "absolute", inset: 0, background: bg }}>
            {!placeholder && (
              <Image
                src={thumbFor(item.thumbnail)}
                alt={item.name}
                fill
                sizes="360px"
                style={{ objectFit: "cover" }}
              />
            )}
          </span>
          <span
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              padding: "26px 11px 10px",
              background:
                "linear-gradient(to top, rgba(0,0,0,0.78), rgba(0,0,0,0.35) 55%, rgba(0,0,0,0))",
              display: "flex",
              flexDirection: "column",
              gap: "3px",
            }}
          >
            <span
              style={{
                color: "#fff",
                fontFamily: "var(--font-serif)",
                fontSize: 15,
                letterSpacing: "-0.2px",
                lineHeight: 1.2,
                display: "flex",
                alignItems: "baseline",
                gap: 6,
              }}
            >
              {item.name}
              {isCluster && (
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 9,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    opacity: 0.8,
                  }}
                >
                  {item.count} sketches
                </span>
              )}
            </span>
            {summary && (
              <span
                style={{
                  color: "rgba(255,255,255,0.82)",
                  fontFamily: "var(--font-inter)",
                  fontSize: 11,
                  lineHeight: 1.35,
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {summary}
              </span>
            )}
          </span>
        </Link>
      </motion.span>
    );
  }

  // Default / dimmed tile.
  const width = 80;
  const height = 54;
  return (
    <motion.span
      key="default"
      onMouseEnter={onEnter}
      animate={{ opacity: faded ? 0.18 : 1 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      style={{ position: "relative", display: "inline-block", lineHeight: 0 }}
    >
      <Link
        href={href}
        aria-label={item.name}
        title={summary || item.name}
        style={{ display: "block", lineHeight: 0 }}
      >
        <span style={{ position: "relative", display: "block", width, height }}>
          <span
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "3px",
              overflow: "hidden",
              background: bg,
            }}
          >
            {!placeholder && (
              <Image
                src={thumbFor(item.thumbnail)}
                alt={item.name}
                fill
                sizes="120px"
                style={{ objectFit: "cover" }}
              />
            )}
            {placeholder && PLACEHOLDER_INITIALS[item.id] && (
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(255,255,255,0.32)",
                  fontFamily: "var(--font-serif)",
                  fontSize: 14,
                  letterSpacing: "-0.2px",
                }}
              >
                {PLACEHOLDER_INITIALS[item.id]}
              </span>
            )}
            {/* Multi-axis affordance: a thin label bar on the thumbnail (hidden on hover). */}
            {extraLabel && (
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  padding: "5px 5px 3px",
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0))",
                  color: "rgba(255,255,255,0.82)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "8.5px",
                  letterSpacing: "0.2px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  lineHeight: 1,
                }}
              >
                {extraLabel}
              </span>
            )}
          </span>
          {isCluster && (
            <span
              style={{
                position: "absolute",
                top: -6,
                right: -6,
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "var(--text)",
                color: "var(--bg)",
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1.5px solid var(--bg)",
                zIndex: 2,
              }}
            >
              {item.count}
            </span>
          )}
        </span>
      </Link>
    </motion.span>
  );
}
