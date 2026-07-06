"use client";

import { useEffect, useState } from "react";
import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force";

export type ProjectNode = SimulationNodeDatum & {
  id: string;
  kind: "project";
  payload: unknown;
};

export type AttractorNode = SimulationNodeDatum & {
  id: string;
  kind: "attractor";
  label: string;
  // Hand-placed coordinates. Pinned (fx/fy) so they don't move.
  fx: number;
  fy: number;
};

export type Node = ProjectNode | AttractorNode;
export type Link = SimulationLinkDatum<Node> & { source: string; target: string };

type Options = {
  width: number;
  height: number;
  iterations?: number;
};

/**
 * Runs a one-shot d3-force simulation and returns final node positions.
 * Attractors are pinned at their fx/fy. Projects get pulled toward each
 * attractor they're tagged with via link forces. Charge prevents overlap.
 *
 * The simulation runs for a fixed number of ticks rather than animating —
 * we want a stable layout, not a kinetic one. Animation is overkill here.
 */
export function useForceLayout(
  nodes: Node[],
  links: Link[],
  { width, height, iterations = 400 }: Options,
): Map<string, { x: number; y: number }> {
  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(
    new Map(),
  );

  useEffect(() => {
    if (nodes.length === 0) {
      setPositions(new Map());
      return;
    }

    // Clone so the simulation doesn't mutate the caller's nodes.
    const simNodes: Node[] = nodes.map((n) => ({ ...n }));
    const simLinks: Link[] = links.map((l) => ({ ...l }));

    const sim = forceSimulation(simNodes as SimulationNodeDatum[])
      .force(
        "link",
        forceLink<Node, Link>(simLinks)
          .id((n) => (n as Node).id)
          .distance(70)
          .strength(1),
      )
      .force("charge", forceManyBody().strength(-90))
      .force("collide", forceCollide(34))
      // Gentle pull toward canvas center. Attractors are pinned (fx/fy) so this
      // only affects project nodes: it arrests the charge-repulsion overshoot
      // that otherwise flings a single-link node (e.g. one tagged only with an
      // edge attractor) past its attractor into a canvas corner. Weak enough
      // that link forces still dominate the cluster shape.
      .force("x", forceX<Node>(width / 2).strength(0.04))
      .force("y", forceY<Node>(height / 2).strength(0.04))
      .stop();

    // Clamp project nodes to the canvas each tick so a single-link node can
    // never be flung past the edge; attractors are pinned so they're untouched.
    const PAD = 44;
    for (let i = 0; i < iterations; i++) {
      sim.tick();
      for (const n of simNodes) {
        if (n.kind !== "project") continue;
        n.x = Math.max(PAD, Math.min(width - PAD, n.x ?? width / 2));
        n.y = Math.max(PAD, Math.min(height - PAD, n.y ?? height / 2));
      }
    }

    // Gently expand the settled layout about its own center to fill the canvas.
    // With attractors now placed on an even ring that already spans the canvas,
    // the projects settle inside that ring — so only a mild expansion is wanted;
    // a large one would shove ring-edge clusters out onto/past the attractors and
    // under their outward labels. Uniform scale keeps cluster shapes and Venn
    // overlaps intact.
    const projNodes = simNodes.filter((n) => n.kind === "project");
    if (projNodes.length > 1) {
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (const n of projNodes) {
        const x = n.x ?? width / 2;
        const y = n.y ?? height / 2;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
      const bw = maxX - minX || 1;
      const bh = maxY - minY || 1;
      const MARGIN = 100;
      const scale = Math.max(
        1,
        Math.min((width - 2 * MARGIN) / bw, (height - 2 * MARGIN) / bh, 1.12),
      );
      const bcx = (minX + maxX) / 2;
      const bcy = (minY + maxY) / 2;
      for (const n of projNodes) {
        n.x = Math.max(MARGIN, Math.min(width - MARGIN, width / 2 + ((n.x ?? width / 2) - bcx) * scale));
        n.y = Math.max(MARGIN, Math.min(height - MARGIN, height / 2 + ((n.y ?? height / 2) - bcy) * scale));
      }
    }

    const next = new Map<string, { x: number; y: number }>();
    for (const n of simNodes) {
      next.set(n.id, { x: n.x ?? width / 2, y: n.y ?? height / 2 });
    }
    setPositions(next);
  }, [nodes, links, width, height, iterations]);

  return positions;
}
