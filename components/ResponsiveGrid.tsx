"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ProjectOrCluster } from "@/data/types";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { AxisGrid } from "./AxisGrid/AxisGrid";
import { MobileGroupedList } from "./MobileGroupedList";
import { FacetedListView } from "./FacetedListView/FacetedListView";
import { ClusterView } from "./ClusterView/ClusterView";
import { DEFAULT_VIEW, isViewMode, type ViewMode } from "./ViewSwitcher";

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
  const view: ViewMode = isViewMode(param) ? param : DEFAULT_VIEW;
  // The cluster force field needs real width (its canvas is ~1280px). Below
  // 1024px we skip mounting it entirely — no force sim, no oversized canvas —
  // and show a notice instead. `null` while unmeasured (pre-mount).
  const isWide = useMediaQuery("(min-width: 1024px)");

  return (
    <>
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
      {view === "cluster" &&
        (isWide === true ? (
          <div className="cluster-pan">
            <ClusterView projects={projects} />
          </div>
        ) : isWide === false ? (
          <ClusterNotice />
        ) : null)}

      <style jsx>{`
        .rg-desktop {
          display: none;
        }
        .rg-mobile {
          display: block;
        }
        /* 821px = complement of the site-wide max-width:820px mobile
           breakpoint (see globals.css). Below/at 820px the axis grid's
           7 columns crush, so tablets get the grouped list too. */
        @media (min-width: 821px) {
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

/** Shown in place of the cluster canvas below 1024px — it can't fit on a phone,
 *  so we point people to a desktop and to the two views that do work small. */
function ClusterNotice() {
  return (
    <div
      className="page-gutter"
      style={{
        paddingTop: "4px",
        paddingBottom: "48px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        maxWidth: "520px",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(20px, 5.5vw, 24px)",
          color: "var(--text)",
          letterSpacing: "-0.3px",
          lineHeight: 1.2,
          overflowWrap: "break-word",
        }}
      >
        The cluster view needs a wider screen.
      </span>
      <span
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "15px",
          color: "var(--text-muted)",
          lineHeight: 1.6,
        }}
      >
        It plots every project across the concerns and mediums they share, which
        takes more room than a phone has. Open this page on a desktop to explore
        it. The{" "}
        <Link href="/?view=grid" className="link-underline">
          grid
        </Link>{" "}
        and{" "}
        <Link href="/?view=list" className="link-underline">
          list
        </Link>{" "}
        views work well here in the meantime.
      </span>
    </div>
  );
}
