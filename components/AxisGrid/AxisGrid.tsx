"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

const Y_LABEL_WIDTH = 112;

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

  return (
    <HoverProvider>
    <section
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
        />
        <AxisSwitcher
          label="X"
          takenOn="Y"
          active={xAxis}
          onChange={handleX}
          disabled={yAxis}
          keys={["A", "D"]}
          keysLabel="change columns"
          align="end"
        />
      </div>

      {/* Column headers */}
      <div style={{ display: "flex" }}>
        <div style={{ width: Y_LABEL_WIDTH }} />
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
        <div key={`${yAxis}-${yv}`} style={{ display: "flex", minHeight: "160px" }}>
          <div
            style={{
              width: Y_LABEL_WIDTH,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              paddingRight: "14px",
              borderRight: "0.5px solid var(--grid-line)",
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
                  // Narrow gutter (112px): short years sit tight, but long axis
                  // labels ("Interactive Installation") wrap to 2 lines, right-
                  // aligned. break-word saves the one unbreakable token
                  // ("Commission/Exhibition") from overflowing.
                  textAlign: "right",
                  overflowWrap: "break-word",
                  lineHeight: 1.25,
                }}
              >
                {yv}
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
  items, yAxis, xAxis, yValue, xValue, isLastRow, isLastCol,
}: {
  items: ProjectOrCluster[];
  yAxis: AxisKey;
  xAxis: AxisKey;
  yValue: string;
  xValue: string;
  isLastRow: boolean;
  isLastCol: boolean;
}) {
  const [hovered, setHovered] = useState<{ id: string; geom: CellGeom } | null>(null);
  const hoveredItem = hovered ? items.find((i) => i.id === hovered.id) : null;
  return (
    <div
      onMouseLeave={() => setHovered(null)}
      style={{
        position: "relative",
        flex: 1,
        padding: "14px 10px",
        borderRight: !isLastCol ? "0.5px solid var(--grid-line)" : undefined,
        borderBottom: !isLastRow ? "0.5px solid var(--grid-line)" : undefined,
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
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
          onEnter={(geom) => setHovered({ id: item.id, geom })}
        />
      ))}
      <AnimatePresence>
        {hovered && hoveredItem && (
          <CellFill key={hovered.id} item={hoveredItem} geom={hovered.geom} />
        )}
      </AnimatePresence>
    </div>
  );
}
