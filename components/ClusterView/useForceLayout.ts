"use client";

import { useEffect, useState } from "react";
import {
  forceCenter,
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
      .stop();

    for (let i = 0; i < iterations; i++) sim.tick();

    const next = new Map<string, { x: number; y: number }>();
    for (const n of simNodes) {
      next.set(n.id, { x: n.x ?? width / 2, y: n.y ?? height / 2 });
    }
    setPositions(next);
  }, [nodes, links, width, height, iterations]);

  return positions;
}
