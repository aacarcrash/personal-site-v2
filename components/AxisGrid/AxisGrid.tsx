"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { AxisKey, ProjectOrCluster } from "@/data/types";
import { AxisSwitcher } from "./AxisSwitcher";
import { ProjectCell } from "./ProjectCell";
import { buildCellMap, getAxisValues, cellKey } from "./axisGridUtils";

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

const Y_LABEL_WIDTH = 160;

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

  // Arrow keys: ↑↓ cycle Y axis, ←→ cycle X axis. Skips inputs.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          handleY(cycleAxis(yAxis, -1, xAxis));
          break;
        case "ArrowDown":
          e.preventDefault();
          handleY(cycleAxis(yAxis, 1, xAxis));
          break;
        case "ArrowLeft":
          e.preventDefault();
          handleX(cycleAxis(xAxis, -1, yAxis));
          break;
        case "ArrowRight":
          e.preventDefault();
          handleX(cycleAxis(xAxis, 1, yAxis));
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [yAxis, xAxis, handleY, handleX]);

  const yValues = useMemo(() => getAxisValues(yAxis), [yAxis]);
  const xValues = useMemo(() => getAxisValues(xAxis), [xAxis]);
  const cellMap = useMemo(() => buildCellMap(projects, yAxis, xAxis), [projects, yAxis, xAxis]);

  return (
    <section
      style={{
        padding: "0 64px 64px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        maxWidth: "1280px",
        width: "100%",
        margin: "0 auto",
      }}
    >
      {/* Top row — Y switcher on the left, X switcher on the right */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "32px",
          flexWrap: "wrap",
        }}
      >
        <AxisSwitcher side="y" active={yAxis} onChange={handleY} disabled={xAxis} />
        <AxisSwitcher side="x" active={xAxis} onChange={handleX} disabled={yAxis} />
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
                padding: "10px 0",
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
                    fontSize: "14px",
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
        <div key={`${yAxis}-${yv}`} style={{ display: "flex", minHeight: "120px" }}>
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
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "var(--text-muted)",
                }}
              >
                {yv}
              </motion.span>
            </AnimatePresence>
          </div>
          <div style={{ display: "flex", flex: 1 }}>
            {xValues.map((xv, ci) => {
              const items = cellMap.get(cellKey(yv, xv)) ?? [];
              const isLastRow = ri === yValues.length - 1;
              const isLastCol = ci === xValues.length - 1;
              return (
                <div
                  key={`${xAxis}-${xv}`}
                  style={{
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
                    <ProjectCell key={item.id} item={item} />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
