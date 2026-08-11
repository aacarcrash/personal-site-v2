"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type React from "react";
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
function bgFor(item: ProjectOrCluster): string {
  return isPlaceholder(item.thumbnail)
    ? (PLACEHOLDER_GRADIENTS[item.id] ?? "var(--surface)")
    : "var(--surface)";
}
function hrefFor(item: ProjectOrCluster): string {
  return item.type === "cluster"
    ? `/sketches/${clusterSlug(item)}`
    : `/projects/${(item as Extract<ProjectOrCluster, { type: "project" }>).slug}`;
}

/** The hovered tile's position + size within its cell, so the fill grows from it. */
export type CellGeom = {
  top: number;
  left: number;
  width: number;
  height: number;
  cellW: number;
  cellH: number;
};

type Props = {
  item: ProjectOrCluster;
  yAxis?: AxisKey;
  xAxis?: AxisKey;
  yValue?: string;
  xValue?: string;
  faded?: boolean;
  onEnter?: (geom: CellGeom) => void;
};

/** Small resting tile. Measures its own spot in the cell on hover so CellFill
 *  can start exactly there and grow. Same image size (360px) as the fill. */
export function ProjectCell({
  item,
  yAxis,
  xAxis,
  yValue,
  xValue,
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

  function handleEnter(e: React.MouseEvent<HTMLSpanElement>) {
    const el = e.currentTarget;
    const cell = el.parentElement;
    if (!cell || !onEnter) return;
    const er = el.getBoundingClientRect();
    const cr = cell.getBoundingClientRect();
    onEnter({
      top: er.top - cr.top,
      left: er.left - cr.left,
      width: er.width,
      height: er.height,
      cellW: cell.clientWidth,
      cellH: cell.clientHeight,
    });
  }

  return (
    <motion.span
      onMouseEnter={handleEnter}
      animate={{ opacity: faded ? 0.18 : 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: "relative", display: "inline-block", lineHeight: 0 }}
    >
      <Link
        href={hrefFor(item)}
        aria-label={item.name}
        title={summary || item.name}
        style={{ display: "block", lineHeight: 0 }}
      >
        <span
          style={{
            position: "relative",
            display: "block",
            width: 80,
            height: 54,
            borderRadius: "3px",
            overflow: "hidden",
            background: bgFor(item),
          }}
        >
          {!placeholder && (
            <Image
              src={thumbFor(item.thumbnail)}
              alt={item.name}
              fill
              sizes="360px"
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
      </Link>
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
    </motion.span>
  );
}

/**
 * The hovered tile grown up. It's ONE image whose box animates its real
 * width/height/position from the tile's spot to fill the cell — object-fit
 * re-crops every frame, so the photo stays crisp and never distorts. Sits over
 * the (identical) resting tile, so frame 0 is seamless.
 */
export function CellFill({
  item,
  geom,
}: {
  item: ProjectOrCluster;
  geom: CellGeom;
}) {
  const isCluster = item.type === "cluster";
  const placeholder = isPlaceholder(item.thumbnail);
  const summary = getCardSummary(item);

  const rest = {
    top: geom.top,
    left: geom.left,
    width: geom.width,
    height: geom.height,
  };
  const full = {
    top: 8,
    left: 8,
    width: Math.max(0, geom.cellW - 16),
    height: Math.max(0, geom.cellH - 16),
  };

  return (
    <motion.span
      initial={rest}
      // Grow: expressive ease-OUT-expo — leaps out, settles into the cell.
      animate={{
        ...full,
        transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
      }}
      // Retract: its natural mirror — ease-IN-expo, and quicker. A dismiss should
      // get out of the way faster than the reveal arrived; reusing the ease-out
      // here made the shrink snap then dawdle. Caption fades fast on its own (below).
      exit={{
        ...rest,
        transition: { duration: 0.32, ease: [0.7, 0, 0.84, 1] },
      }}
      style={{
        position: "absolute",
        zIndex: 5,
        borderRadius: "4px",
        overflow: "hidden",
        display: "block",
      }}
    >
      <Link
        href={hrefFor(item)}
        aria-label={item.name}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          position: "relative",
        }}
      >
        <span
          style={{ position: "absolute", inset: 0, background: bgFor(item) }}
        >
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
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.12 } }}
          transition={{ duration: 0.3, delay: 0.15 }}
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
                  fontSize: "var(--step-label)",
                  lineHeight: "var(--lh-label)",
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
                fontFamily: "var(--font-sans)",
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
        </motion.span>
      </Link>
    </motion.span>
  );
}
