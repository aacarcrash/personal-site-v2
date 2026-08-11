"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { AxisKey, ProjectOrCluster } from "@/data/types";
import { AxisSwitcher, AXIS_OPTIONS } from "./AxisSwitcher";
import { useCycleKeys } from "@/components/useCycleKeys";
import { ProjectCell, CellFill, type CellGeom } from "./ProjectCell";
import { buildCellMap, getAxisValues, cellKey } from "./axisGridUtils";
import { HoverProvider } from "./HoverContext";

const VALID_AXES: AxisKey[] = ["year", "medium", "concern", "technology", "context"];

function isAxisKey(value: string | null): value is AxisKey {
  return value !== null && (VALID_AXES as string[]).includes(value);
}

/**
 * Cycle to the next axis in a direction (+1 forward, -1 back), skipping the
 * axis already used on the other side.
 */
function cycleAxis(current: AxisKey, dir: 1 | -1, blocked: AxisKey): AxisKey {
  const idx = VALID_AXES.indexOf(current);
  for (let step = 1; step <= VALID_AXES.length; step++) {
    const next = VALID_AXES[(idx + dir * step + VALID_AXES.length) % VALID_AXES.length];
    if (next !== blocked) return next;
  }
  return current;
}

type Props = {
  projects: ProjectOrCluster[];
  defaultY?: AxisKey;
  defaultX?: AxisKey;
};

/* ---- Y label orientation -------------------------------------------------
   ONE SWITCH. Set to false and the grid is exactly what it was: a 112px
   gutter with horizontal labels that wrap. Nothing else needs touching.

   Horizontal, a label's measure is the gutter WIDTH, so the gutter has to be
   112px wide to fit "Commission/Exhibition" over two lines. Rotated, its
   measure is the row HEIGHT, which the grid already guarantees is at least
   ROW_MIN_H — so it never wraps and the lane shrinks to 32px. Those 80px go
   to the columns, which is what tips a 7-column axis from one tile per cell
   to two on a laptop.

   The cost is legibility: rotated text is genuinely harder to read, so keep
   this honest. Rotation is counter-clockwise so labels read BOTTOM-TO-TOP,
   the convention for a y-axis in a left-to-right script and the more
   readable of the two directions. It uses writing-mode rather than a
   transform, so the browser lays the box out itself and the text stays in
   the accessibility tree in reading order — a transform would put the label
   in its own layer and need its position patched by hand.

   ROW_MIN_H is 192, not 160, for one label: "Commission/Exhibition" renders
   177px at 13px Necto Mono and would clip in a 160px row. Dropping the
   labels to 12px would also fit, but 13px is deliberate — the X labels were
   raised from 12 to match them. Cheaper to spend the height.

   The margin is the point: 192 leaves 15px, so a slightly wider face or a
   longer axis value added later does not silently clip. Anything longer than
   ~26 characters needs this number raised with it. */
/* Currently FALSE — horizontal, pending an A/B read against the vertical
   version. Everything vertical needs is still here; flip this one constant. */
const Y_LABELS_VERTICAL = false;
/* 44, not 32. A rotated label at 13px only occupies ~16px of width, so a
   32px lane put it within 8px of both rules and it read as jammed into the
   corner. 44 gives it 14px of clear space either side and still hands 68px
   back to the columns. */
/* Horizontal lane is 124, not 112. It leaves 110px of content after the 14px
   of padding, and the widest single unbreakable word on any axis is
   "Worldbuilding" at 104px. Below that the browser has to break a real word
   mid-letter, which is what produced "Worldbuildin / g". */
const Y_LABEL_WIDTH = Y_LABELS_VERTICAL ? 44 : 124;
const ROW_MIN_H = Y_LABELS_VERTICAL ? 192 : 160;
const SECTION_PAD_X = 64;

/* Tile geometry is DERIVED, not fixed.
   The tile used to be a hardcoded 80x54 in a cell whose inner width varies
   with the number of X values. At 1440 that left 68px over, and because the
   cell is a plain wrapping flex row, all of it stacked on the right — a 10px
   left gap against a 78px right one. That is the "uneven padding" and the
   "doesn't use the grid" complaint, both from one cause.

   Fixing the count instead (2 per row) only moves the problem: a narrow axis
   would squeeze tiles to nothing and a wide one would blow them up. So the
   TARGET is the floor and the count follows it — the same thing MediaGallery
   already does. Tiles never render below TARGET_TILE_W.

   The count is picked exactly as before; only the leftover has somewhere to
   go — and where it goes is the whole design question. Letting it all flow
   into the tile made tiles big AND cramped, because every pixel the tile
   gains is a pixel of white space the cell loses: the tile ends up pressed
   against the column line with only the gap around it.

   So the tile is capped near its old size and the leftover goes back to the
   margins as AIR — split evenly around a centred block, instead of piling on
   the right the way the fixed 80px did. Rows inside the block still
   left-align, so a part-full last row does not float.

   MIN_SIDE_AIR is then reserved BEFORE the count is picked, not left over
   after it. Capping alone still let the two-across case run flush to the
   column line, because two tiles happened to fit the inner width exactly.
   Taking the air out first means a second column only appears when there is
   room for it AND for the air, so no configuration can come out cramped. */
const TARGET_TILE_W = 64;
const MAX_TILE_W = 88;
const MIN_SIDE_AIR = 10;
const TILE_ASPECT = 54 / 80;
const CELL_PAD_X = 10;
/* 14, not 10. Two tiles side by side at 10 read as one strip; the gap has to
   be visibly larger than the tile's own corner radius to separate them. */
const TILE_GAP = 14;

/** A label with a legal break after each slash.
 *
 *  No browser breaks a line at "/", so "Commission/Exhibition" is one
 *  unbreakable 167px token and overflows a 112px gutter. The alternatives were
 *  worse: `overflow-wrap: anywhere` breaks every word at the box edge, and
 *  respacing the value to "Commission / Exhibition" changes an axis KEY that
 *  content/*.json matches on. <wbr> adds the break opportunity and renders
 *  nothing — the string on screen is identical to the string in the data. */
function LabelWithBreaks({ text }: { text: string }) {
  const parts = text.split("/");
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <>
              /<wbr />
            </>
          )}
        </span>
      ))}
    </>
  );
}

export type TileSize = { w: number; h: number; perRow: number };

/** Block width for a cell holding `count` tiles. A cell with fewer items than
 *  perRow must shrink its block to what it actually holds — sizing every block
 *  at the full perRow left a lone tile pinned to the block's left edge, which
 *  is the original off-centre bug wearing a different hat. */
export function blockWidthFor(tile: TileSize, count: number): number {
  const cols = Math.max(1, Math.min(tile.perRow, count));
  return cols * tile.w + (cols - 1) * TILE_GAP;
}

function tileSizeFor(cellInner: number): TileSize {
  const usable = Math.max(1, cellInner - MIN_SIDE_AIR * 2);
  const perRow = Math.max(
    1,
    Math.floor((usable + TILE_GAP) / (TARGET_TILE_W + TILE_GAP)),
  );
  const fill = Math.max(
    1,
    Math.floor((usable - (perRow - 1) * TILE_GAP) / perRow),
  );
  const w = Math.min(fill, MAX_TILE_W);
  return { w, h: Math.round(w * TILE_ASPECT), perRow };
}

export const AXIS_KEYS = AXIS_OPTIONS.map((o) => o.key);

export function AxisGrid({ projects, defaultY = "year", defaultX = "medium" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialY = isAxisKey(searchParams.get("y")) ? (searchParams.get("y") as AxisKey) : defaultY;
  const initialX = isAxisKey(searchParams.get("x")) ? (searchParams.get("x") as AxisKey) : defaultX;

  const [yAxis, setYAxis] = useState<AxisKey>(initialY);
  const [xAxis, setXAxis] = useState<AxisKey>(initialX);

  const updateUrl = useCallback(
    (y: AxisKey, x: AxisKey) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("y", y);
      params.set("x", x);
      router.replace(`/?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const handleY = useCallback(
    (next: AxisKey) => {
      if (next === xAxis) return;
      setYAxis(next);
      updateUrl(next, xAxis);
    },
    [xAxis, updateUrl],
  );

  const handleX = useCallback(
    (next: AxisKey) => {
      if (next === yAxis) return;
      setXAxis(next);
      updateUrl(yAxis, next);
    },
    [yAxis, updateUrl],
  );

  /* The dashed option is the axis in use on the other side. Clicking it can
     only mean one thing — put it here — and the only way to honour that
     without dropping an axis is to trade them. */
  const swapAxes = useCallback(() => {
    setYAxis(xAxis);
    setXAxis(yAxis);
    updateUrl(xAxis, yAxis);
  }, [xAxis, yAxis, updateUrl]);

  // WASD, not arrows. This used to capture all four arrow keys on window,
  // which did two harmful things: it took arrow-key page scrolling away
  // from anyone navigating without a mouse, and it collided with the view
  // bar's own left/right (pressing left with the bar focused switched the
  // view AND cycled the X axis). Letters carry no default behaviour, so
  // they can be global without stealing anything.
  //   W / S  cycle the Y axis      A / D  cycle the X axis
  useCycleKeys<AxisKey>([
    { back: "w", fwd: "s", options: AXIS_KEYS, current: yAxis, onChange: handleY, skip: xAxis },
    { back: "a", fwd: "d", options: AXIS_KEYS, current: xAxis, onChange: handleX, skip: yAxis },
  ]);

  const yValues = useMemo(() => getAxisValues(yAxis), [yAxis]);
  const xValues = useMemo(() => getAxisValues(xAxis), [xAxis]);
  const cellMap = useMemo(() => buildCellMap(projects, yAxis, xAxis), [projects, yAxis, xAxis]);

  /* Measured once on the section, not per cell. Every cell in the grid is
     flex:1 in a row of identical width, so they are all the same size — one
     observer instead of rows x columns of them, and every tile on the page is
     guaranteed to agree. */
  const sectionRef = useRef<HTMLElement | null>(null);
  const [bodyW, setBodyW] = useState(0);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth - SECTION_PAD_X * 2 - Y_LABEL_WIDTH;
      setBodyW((prev) => (prev === w ? prev : w));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const tile = useMemo(() => {
    if (bodyW <= 0)
      return {
        w: TARGET_TILE_W,
        h: Math.round(TARGET_TILE_W * TILE_ASPECT),
        perRow: 1,
      };
    return tileSizeFor(bodyW / xValues.length - CELL_PAD_X * 2);
  }, [bodyW, xValues.length]);

  return (
    <HoverProvider>
    <section
      ref={sectionRef}
      style={{
        padding: "0 64px 64px",
      }}
    >
      {/* Switcher row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          /* 64 above / 36 below. Still asymmetric, so the controls read as
             belonging to the view they drive rather than to the featured
             strip — but 20 sat them right on top of the column headers. */
          paddingBottom: "36px",
        }}
      >
        <AxisSwitcher
          label="Y"
          takenOn="X"
          active={yAxis}
          onChange={handleY}
          disabled={xAxis}
          keys={["W", "S"]}
          keysLabel="change rows"
          onSwap={swapAxes}
        />
        <AxisSwitcher
          label="X"
          takenOn="Y"
          active={xAxis}
          onChange={handleX}
          disabled={yAxis}
          keys={["A", "D"]}
          keysLabel="change columns"
          onSwap={swapAxes}
          align="end"
        />
      </div>

      {/* Column headers */}
      <div style={{ display: "flex" }}>
        {/* Carries the header rule across the gutter, so the table's top
            edge is one unbroken line rather than starting at column 1. */}
        <div
          style={{
            width: Y_LABEL_WIDTH,
            borderBottom: "0.5px solid var(--grid-line)",
            /* And the gutter's own vertical rule starts at the header, not
               at row 1 — otherwise the lane opens one band late. */
            borderRight: "0.5px solid var(--grid-line)",
          }}
        />
        <div
          style={{
            display: "flex",
            flex: 1,
            borderBottom: "0.5px solid var(--grid-line)",
          }}
        >
          {xValues.map((xv, i) => (
            <div
              key={xv}
              style={{
                flex: 1,
                padding: "8px 0",
                display: "flex",
                justifyContent: "center",
                borderRight: i < xValues.length - 1 ? "0.5px solid var(--grid-line)" : undefined,
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={`${xAxis}-${xv}`}
                  initial={{ opacity: 0, y: -2 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 2 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    fontFamily: "var(--font-mono)",
                    // Matches the Y labels. These were 12px against the Y
                    // axis's 13px — one step apart on a pair that reads as
                    // one system, so the row looked subtly mismatched.
                    fontSize: "var(--step-data)",
                    lineHeight: "var(--lh-data)",
                    color: "var(--text-muted)",
                  }}
                >
                  {xv}
                </motion.span>
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Grid body — rows */}
      {yValues.map((yv, ri) => (
        <div key={`${yAxis}-${yv}`} style={{ display: "flex", minHeight: `${ROW_MIN_H}px` }}>
          <div
            style={{
              width: Y_LABEL_WIDTH,
              display: "flex",
              alignItems: "center",
              /* Rotated, the label is centred in its lane; horizontal, it is
                 pushed up against the rule so it reads as a row heading. */
              justifyContent: Y_LABELS_VERTICAL ? "center" : "flex-end",
              paddingRight: Y_LABELS_VERTICAL ? 0 : "14px",
              borderRight: "0.5px solid var(--grid-line)",
              /* The row rule runs THROUGH the label gutter, not just across
                 the cells. It turns the gutter into a lane of the same table
                 rather than a margin beside it, and it gives each label a
                 band of its own to sit in. */
              borderBottom:
                ri < yValues.length - 1
                  ? "0.5px solid var(--grid-line)"
                  : undefined,
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={`${yAxis}-${yv}`}
                initial={{ opacity: 0, x: -2 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 2 }}
                transition={{ duration: 0.15 }}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--step-data)",
                  color: "var(--text-muted)",
                  lineHeight: 1.25,
                  ...(Y_LABELS_VERTICAL
                    ? {
                        /* sideways-lr reads bottom-to-top. vertical-rl would
                           also rotate the text, but it rotates the other way
                           AND keeps each glyph upright in CJK fashion, which
                           is not what a Latin axis label wants. nowrap so the
                           label never breaks mid-string inside the row. */
                        writingMode: "sideways-lr" as const,
                        whiteSpace: "nowrap" as const,
                        /* A touch of tracking. Rotation costs legibility, and
                           opening the letterfit back up is the cheapest way to
                           buy some of it back. */
                        letterSpacing: "0.04em",
                      }
                    : {
                        /* Horizontal: labels wrap in the gutter, right-aligned.
                           break-word, NOT anywhere: anywhere breaks every word
                           at the box edge, so "Worldbuilding" came out as
                           "Worldbuildin / g". break-word only breaks a word
                           that cannot fit on a line of its own, and the gutter
                           is now wide enough that none of them qualify. The
                           slashed labels get their break from an explicit
                           <wbr> instead — see LabelWithBreaks. */
                        textAlign: "right" as const,
                        overflowWrap: "break-word" as const,
                      }),
                }}
              >
                <LabelWithBreaks text={yv} />
              </motion.span>
            </AnimatePresence>
          </div>
          <div style={{ display: "flex", flex: 1 }}>
            {xValues.map((xv, ci) => (
              <GridCell
                key={`${xAxis}-${xv}`}
                items={cellMap.get(cellKey(yv, xv)) ?? []}
                yAxis={yAxis}
                xAxis={xAxis}
                yValue={yv}
                xValue={xv}
                isLastRow={ri === yValues.length - 1}
                isLastCol={ci === xValues.length - 1}
                tile={tile}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
    </HoverProvider>
  );
}

/**
 * One year×axis cell. Tracks which tile inside it is hovered so that tile can
 * bloom to fill the cell while its neighbours fade. Empty cells stretch to the
 * row height (set by the fullest cell) so the grid lines stay aligned.
 */
function GridCell({
  items, yAxis, xAxis, yValue, xValue, isLastRow, isLastCol, tile,
}: {
  items: ProjectOrCluster[];
  yAxis: AxisKey;
  xAxis: AxisKey;
  yValue: string;
  xValue: string;
  isLastRow: boolean;
  isLastCol: boolean;
  tile: TileSize;
}) {
  const [hovered, setHovered] = useState<{ id: string; geom: CellGeom } | null>(null);
  const hoveredItem = hovered ? items.find((i) => i.id === hovered.id) : null;
  return (
    <div
      data-cell
      onMouseLeave={() => setHovered(null)}
      style={{
        position: "relative",
        flex: 1,
        padding: `14px ${CELL_PAD_X}px`,
        borderRight: !isLastCol ? "0.5px solid var(--grid-line)" : undefined,
        borderBottom: !isLastRow ? "0.5px solid var(--grid-line)" : undefined,
      }}
    >
      {/* The tile block starts at the cell's left padding. It was centred for
          a while, back when the cap could leave 50px over; now that the air
          is reserved before the count is picked, the leftover is a pixel or
          two and centring bought nothing but a floating look. The block still
          has an explicit width so a part-full last row lines up with the row
          above it. */}
      <div
        style={{
          width: blockWidthFor(tile, items.length),
          marginRight: "auto",
          display: "flex",
          flexWrap: "wrap",
          gap: `${TILE_GAP}px`,
          alignContent: "flex-start",
        }}
      >
        {items.map((item) => (
          <ProjectCell
            key={item.id}
            item={item}
            yAxis={yAxis}
            xAxis={xAxis}
            yValue={yValue}
            xValue={xValue}
            faded={hovered !== null && hovered.id !== item.id}
            tile={tile}
            onEnter={(geom) => setHovered({ id: item.id, geom })}
          />
        ))}
      </div>
      <AnimatePresence>
        {hovered && hoveredItem && (
          <CellFill key={hovered.id} item={hoveredItem} geom={hovered.geom} />
        )}
      </AnimatePresence>
    </div>
  );
}
