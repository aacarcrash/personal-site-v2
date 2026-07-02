"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { ProjectOrCluster } from "@/data/types";
import { AxisGrid } from "./AxisGrid/AxisGrid";
import { MobileGroupedList } from "./MobileGroupedList";
import { FacetedListView } from "./FacetedListView/FacetedListView";
import { ClusterView } from "./ClusterView/ClusterView";
import { ViewSwitcher, isViewMode, type ViewMode } from "./ViewSwitcher";

type Props = {
  projects: ProjectOrCluster[];
};

export function ResponsiveGrid({ projects }: Props) {
  return (
    <Suspense fallback={null}>
      <ResponsiveGridInner projects={projects} />
    </Suspense>
  );
}

function ResponsiveGridInner({ projects }: Props) {
  const searchParams = useSearchParams();
  const param = searchParams.get("view");
  const view: ViewMode = isViewMode(param) ? param : "grid";

  return (
    <>
      <ViewSwitcher current={view} />
      {/* Grid is the one mode with a dedicated mobile layout: the 2D axis
          field needs pointer + width, so phones get the grouped list. List
          and cluster render on all sizes (cluster pans horizontally). */}
      {view === "grid" && (
        <>
          <div className="rg-desktop">
            <AxisGrid projects={projects} />
          </div>
          <div className="rg-mobile">
            <MobileGroupedList projects={projects} />
          </div>
        </>
      )}
      {view === "list" && <FacetedListView projects={projects} />}
      {view === "cluster" && (
        <div className="cluster-pan">
          <ClusterView projects={projects} />
        </div>
      )}

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
