"use client";

import { Suspense } from "react";
import type { ProjectOrCluster } from "@/data/types";
import { AxisGrid } from "./AxisGrid/AxisGrid";
import { MobileGroupedList } from "./MobileGroupedList";

type Props = {
  projects: ProjectOrCluster[];
};

/**
 * Picks the right surface for the current viewport:
 *  - Desktop / tablet (>= 768px): the 2D AxisGrid
 *  - Mobile (< 768px): the 1D MobileGroupedList
 *
 * Both render but only one is visible at a time. CSS-only switch keeps
 * client-side bundle simple and avoids hydration mismatch.
 */
export function ResponsiveGrid({ projects }: Props) {
  return (
    <>
      <div className="rg-desktop">
        <Suspense fallback={null}>
          <AxisGrid projects={projects} />
        </Suspense>
      </div>
      <div className="rg-mobile">
        <Suspense fallback={null}>
          <MobileGroupedList projects={projects} />
        </Suspense>
      </div>

      <style jsx>{`
        .rg-desktop {
          display: none;
        }
        .rg-mobile {
          display: block;
        }
        @media (min-width: 768px) {
          .rg-desktop {
            display: block;
          }
          .rg-mobile {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
