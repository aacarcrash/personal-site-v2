"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import type { AxisKey, ProjectOrCluster } from "@/data/types";
import { AxisSwitcher } from "./AxisSwitcher";
import { ProjectCell } from "./ProjectCell";
import { buildCellMap, getAxisValues, cellKey } from "./axisGridUtils";

const VALID_AXES: AxisKey[] = ["year", "medium", "concern", "technology", "context"];

function isAxisKey(value: string | null): value is AxisKey {
  return value !== null && (VALID_AXES as string[]).includes(value);
}

type Props = {
  projects: ProjectOrCluster[];
  defaultY?: AxisKey;
  defaultX?: AxisKey;
};

export function AxisGrid({ projects, defaultY = "year", defaultX = "medium" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialise from URL if present
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
      // Don't allow same axis on both sides
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

  const yValues = useMemo(() => getAxisValues(yAxis), [yAxis]);
  const xValues = useMemo(() => getAxisValues(xAxis), [xAxis]);
  const cellMap = useMemo(() => buildCellMap(projects, yAxis, xAxis), [projects, yAxis, xAxis]);

  return (
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
          paddingBottom: "16px",
        }}
      >
        <AxisSwitcher side="y" active={yAxis} onChange={handleY} disabled={xAxis} />
        <AxisSwitcher side="x" active={xAxis} onChange={handleX} disabled={yAxis} />
      </div>

      {/* Column headers */}
      <div style={{ display: "flex" }}>
        <div style={{ width: "80px" }} />
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
                    fontSize: "12px",
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
      <LayoutGroup>
        {yValues.map((yv, ri) => (
          <div key={`${yAxis}-${yv}`} style={{ display: "flex", minHeight: "160px" }}>
            <div
              style={{
                width: "80px",
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
                    fontSize: "13px",
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
      </LayoutGroup>
    </section>
  );
}
