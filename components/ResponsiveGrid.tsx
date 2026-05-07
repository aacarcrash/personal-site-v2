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
      <div className="rg-desktop">
        <ViewSwitcher current={view} />
        {view === "grid" && <AxisGrid projects={projects} />}
        {view === "list" && <FacetedListView projects={projects} />}
        {view === "cluster" && <ClusterView projects={projects} />}
      </div>
      <div className="rg-mobile">
        <MobileGroupedList projects={projects} />
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
