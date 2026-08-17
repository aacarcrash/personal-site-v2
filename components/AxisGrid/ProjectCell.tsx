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
/**
 * Three of the thirty-one items have a case study behind them, and nothing in
 * the grid said so — a scanner had no way to tell which clicks pay for
 * themselves. Clusters never qualify: they are collections, not arguments.
 */
function isCaseStudy(item: ProjectOrCluster): boolean {
  return item.type === "project" && item.tier === "case-study";
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
  /** Derived by AxisGrid from the cell's real width — see TARGET_TILE_W there.
   *  Defaults to the old fixed size for any caller outside the grid. */
  tile?: { w: number; h: number };
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
  tile = { w: 80, h: 54 },
  onEnter,
}: Props) {
  const isCluster = item.type === "cluster";
  const placeholder = isPlaceholder(item.thumbnail);
  const summary = getCardSummary(item);
  const caseStudy = isCaseStudy(item);

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
    // The tile's parent is the centred block, not the cell. CellFill is
    // positioned against the cell, so measure against the cell.
    const cell = el.closest("[data-cell]");
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
      {/* Deck stack. A cluster is several works, so the tile SHOWS a pile
          rather than stating a number in a corner badge — the count is
          already spoken in the hover caption ("N sketches"), so the badge
          was saying it twice and sitting on the artwork to do it.

          Offsets are +4 and +8 down-right, and they stay absolute: the ghost
          overhangs rather than widening the tile, so a cluster and a single
          work are the same box and land on the same grid. The cell has 10px
          of side padding and a 10px gap between tiles, so the overhang clears
          with 2px to spare wherever the tile sits. Two ghosts only: three
          reads as clutter at this size.

          These MUST NOT be clipped, which constrains the hover animation —
          the parent may translate but must never scale, or the ghosts
          scale out of the space the cell reserved for them. */}
      {isCluster && (
        <>
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: 8,
              top: 8,
              width: tile.w,
              height: tile.h,
              borderRadius: "var(--radius-sm)",
              background: "var(--border)",
            }}
          />
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: 4,
              top: 4,
              width: tile.w,
              height: tile.h,
              borderRadius: "var(--radius-sm)",
              background: "var(--text-subtle)",
            }}
          />
        </>
      )}
      <Link
        href={hrefFor(item)}
        aria-label={caseStudy ? `${item.name} — case study` : item.name}
        title={summary || item.name}
        style={{ display: "block", lineHeight: 0, position: "relative", zIndex: 1 }}
      >
        <span
          style={{
            position: "relative",
            display: "block",
            width: tile.w,
            height: tile.h,
            borderRadius: "var(--radius-sm)",
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
          {/* A mark, not a word. Tiles render at TARGET_TILE_W = 64px, where
              11px — the type ramp's floor — buys about nine characters, so
              "CASE STUDY" was never an option here. A 4px dot survives any
              thumbnail underneath it because it carries its own scrim, and it
              cannot collide with the extraLabel in the opposite corner.

              On its own a dot means nothing, so it is never on its own: the
              hover fill spells out CASE STUDY next to the title, the link's
              aria-label says it, and the mobile list writes it in full. The
              dot is the resting shorthand for a thing the page explains
              everywhere a reader might stop. */}
          {caseStudy && (
            <span
              aria-hidden
              style={{
                position: "absolute",
                top: 5,
                right: 5,
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.95)",
                // Thumbnails are the only colour on the page and a white dot
                // can land on a pale one, so it carries a hairline ring to
                // hold its edge. A soft outer glow was tried first and read
                // as a notification badge — the contained ring keeps the mark
                // the size it actually is.
                boxShadow: "0 0 0 1px rgba(0,0,0,0.55)",
              }}
            />
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
                // Was 8.5px, the smallest text on the site and white over a
                // photograph. 11px is the ramp floor. On a narrow tile the
                // longer axis names truncate — accepted: this is a hint, and
                // the full value is on the hover card.
                fontSize: "var(--step-label)",
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
        </span>
      </Link>
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
  const caseStudy = isCaseStudy(item);

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
          style={{
            position: "absolute",
            inset: 0,
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
          {/* Sibling overlay, not a boxShadow on the container: an inset
              box-shadow paints under the Image's absolutely positioned fill
              child, so it was invisible. This sits after it in DOM order. */}
          <span
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              boxShadow: "inset 0 0 0 1px var(--thumb-inset)",
              pointerEvents: "none",
            }}
          />
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
              flexWrap: "wrap",
              gap: 6,
            }}
          >
            {item.name}
            {isCluster && (
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  /* Tracking widens every gap including the SPACE, so "5"
                     and "sketches" drifted apart and read as two things.
                     wordSpacing pulls just that gap back so the pair reads
                     as one phrase, without untracking the word itself. */
                  letterSpacing: "0.4px",
                  wordSpacing: "-1.4px",
                  textTransform: "uppercase",
                  /* The pair is one phrase, so it breaks as one. On a narrow
                     tile the row used to break INSIDE it and leave "5" hanging
                     on the title's line with "SKETCHES" below. nowrap + a
                     wrapping parent moves the whole count to the next line. */
                  whiteSpace: "nowrap",
                  opacity: 0.8,
                }}
              >
                {item.count} sketches
              </span>
            )}
            {/* Same slot, same type treatment and same nowrap rule as the
                cluster count — this is structurally the identical thing, a
                short mono fact qualifying the title, so it reuses the styling
                that was already tuned for that job rather than inventing a
                second one. It is also what tells a reader what the resting
                dot meant. */}
            {caseStudy && (
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  letterSpacing: "0.4px",
                  wordSpacing: "-1.4px",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  opacity: 0.8,
                }}
              >
                Case study
              </span>
            )}
          </span>
          {summary && (
            <span
              style={{
                color: "rgba(255,255,255,0.82)",
                // --font-inter no longer exists after the font swap, so this
                // resolved to nothing. --font-sans is the same face it was
                // already falling back to; renders identically.
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
