"use client";

import Link from "next/link";
import Image from "next/image";
import { useId, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { AxisKey, ProjectOrCluster } from "@/data/types";
import { thumbFor } from "@/lib/thumb";
import { getProjectAxisValues } from "@/lib/axes";
import { getCardSummary, clusterSlug } from "./axisGridUtils";
import { useHoveredProject } from "./HoverContext";

const PLACEHOLDER_GRADIENTS: Record<string, string> = {
  mare: "linear-gradient(135deg, #1a1a1a 0%, #333 50%, #1f1f1f 100%)",
  "date-0-0": "linear-gradient(135deg, #1a1a2e 0%, #2a2a4e 50%, #1a1a3e 100%)",
  "aa-warsaw": "linear-gradient(135deg, #2a2a1a 0%, #3a3a2a 50%, #2a2a1a 100%)",
};

const PLACEHOLDER_INITIALS: Record<string, string> = {
  mare: "Mare",
  "date-0-0": "0:0",
  "aa-warsaw": "AA",
};

function isPlaceholder(thumbnail: string): boolean {
  if (thumbnail === "" || thumbnail.includes("/placeholder.")) return true;
  if (/^https?:\/\//i.test(thumbnail)) return true;
  return false;
}

type Props = {
  item: ProjectOrCluster;
  // Active grid axes + the cell's own values. When provided, the cell
  // can show a "+ otherValue" chip if the project has more values on
  // either axis (i.e. also lives in another cell).
  yAxis?: AxisKey;
  xAxis?: AxisKey;
  yValue?: string;
  xValue?: string;
};

export function ProjectCell({ item, yAxis, xAxis, yValue, xValue }: Props) {
  const isCluster = item.type === "cluster";
  const placeholder = isPlaceholder(item.thumbnail);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const [showCard, setShowCard] = useState(false);
  const [flipLeft, setFlipLeft] = useState(false);
  const enterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const summaryId = useId();
  const { hoveredId, setHoveredId } = useHoveredProject();

  // Clusters render at the same tile size as projects.
  const width = 80;
  const height = 54;

  const summary = getCardSummary(item);

  // Compute extra values this project has on the active axes (for the
  // multi-tag affordance chip). Only meaningful when axes context is
  // passed in.
  const extraValues: string[] = [];
  if (yAxis && yValue) {
    for (const v of getProjectAxisValues(item, yAxis)) {
      if (v !== yValue) extraValues.push(v);
    }
  }
  if (xAxis && xValue) {
    for (const v of getProjectAxisValues(item, xAxis)) {
      if (v !== xValue) extraValues.push(v);
    }
  }

  const isLinked = hoveredId === item.id;

  function open() {
    setHoveredId(item.id);
    if (enterTimer.current) clearTimeout(enterTimer.current);
    enterTimer.current = setTimeout(() => {
      // Decide which side to flip the card to before showing it.
      const rect = wrapperRef.current?.getBoundingClientRect();
      if (rect) {
        const spaceRight = window.innerWidth - rect.right;
        setFlipLeft(spaceRight < 280);
      }
      setShowCard(true);
    }, 120);
  }
  function close() {
    setHoveredId(null);
    if (enterTimer.current) clearTimeout(enterTimer.current);
    setShowCard(false);
  }

  // The hover-scaled wrapper has overflow:hidden for the image.
  // Cluster count badge lives OUTSIDE this wrapper so it isn't clipped.
  const inner = (
    <motion.span
      animate={{ scale: isLinked ? 1.04 : 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      style={{
        position: "relative",
        display: "block",
        width,
        height,
      }}
    >
      <span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "3px",
          overflow: "hidden",
          background: placeholder
            ? PLACEHOLDER_GRADIENTS[item.id] ?? "var(--surface)"
            : "var(--surface)",
          outline: isLinked ? "1px solid var(--text)" : "none",
          outlineOffset: "1px",
          transition: "outline 0.15s ease",
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
      {extraValues.length > 0 && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            bottom: -4,
            left: 2,
            padding: "1px 4px",
            borderRadius: "2px",
            background: "var(--bg)",
            border: "0.5px solid var(--border)",
            fontFamily: "var(--font-mono)",
            fontSize: "8.5px",
            letterSpacing: "0.3px",
            color: "var(--text-muted)",
            whiteSpace: "nowrap",
            maxWidth: width + 20,
            overflow: "hidden",
            textOverflow: "ellipsis",
            zIndex: 2,
          }}
        >
          {extraValues.length === 1
            ? `+${extraValues[0]}`
            : `+${extraValues.length}`}
        </span>
      )}
    </motion.span>
  );

  const href = isCluster
    ? `/sketches/${clusterSlug(item)}`
    : `/projects/${(item as Extract<ProjectOrCluster, { type: "project" }>).slug}`;

  return (
    <span
      ref={wrapperRef}
      style={{ position: "relative", display: "inline-block", lineHeight: 0 }}
      onMouseEnter={open}
      onMouseLeave={close}
    >
      <Link
        href={href}
        aria-label={item.name}
        aria-describedby={summaryId}
        onFocus={open}
        onBlur={close}
        style={{ display: "block", lineHeight: 0 }}
      >
        {inner}
      </Link>
      {/* Visually-hidden summary for screen readers */}
      <span
        id={summaryId}
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          whiteSpace: "nowrap",
          borderWidth: 0,
        }}
      >
        {summary}
      </span>
      {showCard && (
        <span
          aria-hidden
          className="axis-cell-hovercard"
          style={{
            position: "absolute",
            top: "50%",
            ...(flipLeft
              ? { right: "calc(100% + 10px)" }
              : { left: "calc(100% + 10px)" }),
            transform: "translateY(-50%)",
            width: 240,
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
              display: "flex",
              alignItems: "baseline",
              gap: 8,
              flexWrap: "wrap",
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
              {item.name}
            </span>
            {isCluster && (
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  fontWeight: 500,
                  color: "var(--text-muted)",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                Sketches
              </span>
            )}
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
        </span>
      )}
    </span>
  );
}
