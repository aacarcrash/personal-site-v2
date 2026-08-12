"use client";

import { useCallback, useLayoutEffect } from "react";

/** The element whose height swings when the view or the axes change. */
const REGION_ID = "work-region";

/** Longest a programmatic smooth scroll is allowed to take before we release
 *  the height lock anyway. `scrollend` covers the normal path; this is the
 *  belt-and-braces for browsers that fire it late or not at all. */
const SETTLE_TIMEOUT_MS = 900;

/** How long an unconsumed pin is allowed to live. A switch that does not
 *  actually change the deps (re-picking the mode you are already on) never
 *  reaches the layout effect, and a pin left behind would freeze the region at
 *  a stale height. */
const ORPHAN_PIN_MS = 250;

type Armed = {
  /** Absolute document offset of the region's top edge, pre-switch. */
  regionTop: number;
  /** Where the user actually was, pre-switch. */
  scrollY: number;
  /** Height we pinned the region to for the duration of the switch. */
  lockedHeight: number;
};

/**
 * `preserve`   — hold the reader's place. Right for the axis grid, where the
 *                content is the same set of works in a different arrangement,
 *                so the row you were looking at is still meaningful.
 * `region-top` — put the top of the region at the top of the viewport. Right
 *                for switching between grid, list and cluster, where the same
 *                pixel offset lands somewhere arbitrary because the views have
 *                nothing structurally in common.
 */
export type AnchorMode = "preserve" | "region-top";

/**
 * Keeps the reader's place across a layout that changes height under them.
 *
 * The problem this solves, measured on production: the axis grid is a
 * different height for every axis pair (medium x year is 1405px, concern x
 * year is 1013px). Switch from the tall one to the short one while scrolled
 * into the grid and the document becomes shorter than your scroll offset, so
 * the browser clamps scrollY to the new maximum. That clamp lands in a single
 * frame with no animation — it reads as being thrown up the page, and it only
 * happens on the switches that shrink, which is why it felt random.
 *
 * `scroll: false` on the router call does not help: the navigation is not what
 * moves you, the height change is. Neither does correcting the scroll
 * afterwards — by the time any effect runs, the clamp has already happened and
 * the position it would restore from is the clamped one.
 *
 * So the fix has to be in two halves, around the commit:
 *
 *   arm()  — called in the event handler, BEFORE the state change. Records
 *            where the region was and pins its height, so the document cannot
 *            get shorter mid-commit and the browser has nothing to clamp.
 *   effect — after the new layout is in, measures what the region actually
 *            wants to be, works out the best position still available, moves
 *            there deliberately (smooth, unless the user asked for less
 *            motion), and only then releases the pin.
 *
 * The target keeps the region's top edge visually fixed, so a switch that fits
 * costs no movement at all. When the new layout genuinely cannot hold the old
 * offset, the move is unavoidable — but it is eased and bounded instead of
 * instant.
 *
 * @param deps       the values whose change means a switch has landed
 * @param reduceMotion  jump instead of animating
 * @param mode       where to land — see {@link AnchorMode}
 */
/* Module scope, deliberately, not a ref on the component.
 *
 * The handoff has to outlive the component that armed it. Updating the axis
 * query params re-renders the grid's subtree, and the instance that armed the
 * switch is not guaranteed to be the instance whose layout effect runs after
 * it — anything stored per-instance is simply gone by then, which is exactly
 * why the first version of this pinned the region and then dropped the pin
 * 21ms later without ever scrolling. One region, one switch in flight at a
 * time, so one module-level slot is the honest model of it. */
let pending: (Armed & { mode: AnchorMode }) | null = null;
let orphanTimer = 0;
/** Undoes whatever the in-flight switch set up. Replaced each time one starts. */
let settle: (() => void) | null = null;

function unpin() {
  const region = document.getElementById(REGION_ID);
  if (region) region.style.minHeight = "";
}

function abandon() {
  window.clearTimeout(orphanTimer);
  settle?.();
  settle = null;
  pending = null;
  unpin();
}

export function useSwitchAnchor(
  deps: unknown[],
  reduceMotion: boolean | null,
  mode: AnchorMode = "preserve",
) {
  const arm = useCallback(() => {
    // A switch fired while the last one was still settling. Drop the old pin
    // first, otherwise we would measure the pinned height as if it were real.
    abandon();
    const region = document.getElementById(REGION_ID);
    if (!region) return;
    const rect = region.getBoundingClientRect();
    pending = {
      regionTop: rect.top + window.scrollY,
      scrollY: window.scrollY,
      lockedHeight: rect.height,
      mode,
    };
    region.style.minHeight = `${rect.height}px`;

    // If the switch turns out to be a no-op — re-picking the mode you are
    // already on — no layout effect runs and nothing would take the pin off.
    orphanTimer = window.setTimeout(() => {
      if (!pending) return;
      pending = null;
      unpin();
    }, ORPHAN_PIN_MS);
  }, [mode]);

  useLayoutEffect(() => {
    if (!pending) return;
    // Whoever armed it chose the landing mode, which may not be this
    // instance's — the grid re-renders on a view switch too, so its effect can
    // be the one that consumes a view switch's token.
    const armed = pending;
    pending = null;
    window.clearTimeout(orphanTimer);

    const region = document.getElementById(REGION_ID);
    if (!region) return;

    /* How tall the region wants to be with the pin off — measured from the
       children, NOT by clearing min-height and reading offsetHeight.
       Clearing it, even for one statement, lets the document collapse for one
       synchronous layout, and the browser clamps scrollY right there. The pin
       then goes back on with the scroll position already lost, which defeats
       the entire mechanism. (This was the bug: the pin held, the effect ran,
       and scrollY had still moved 1155 -> 873 by the time we read it.)
       region.scrollHeight is no use either — with min-height larger than the
       content it reports the pinned height back to us. */
    const regionRect = region.getBoundingClientRect();
    let contentBottom = regionRect.top;
    for (const child of region.children) {
      contentBottom = Math.max(contentBottom, child.getBoundingClientRect().bottom);
    }
    const style = getComputedStyle(region);
    const naturalHeight =
      contentBottom - regionRect.top + parseFloat(style.paddingBottom || "0");

    const doc = document.documentElement;
    const regionTop = regionRect.top + window.scrollY;
    // Document height as it will be once the pin comes off.
    const naturalDocHeight =
      doc.scrollHeight - (armed.lockedHeight - naturalHeight);
    const maxY = Math.max(0, naturalDocHeight - window.innerHeight);

    // Someone still reading above the work region is not switching to change
    // where they are looking. Leave them alone in both modes.
    if (armed.scrollY <= armed.regionTop) {
      unpin();
      return;
    }

    // preserve:   hold the region's top edge where it was on screen. Anything
    //             above the region can have changed height too, so this is a
    //             delta rather than the raw old offset.
    // region-top: bring the region's top edge to the top of the viewport.
    const desired =
      armed.mode === "region-top"
        ? regionTop
        : armed.scrollY + (regionTop - armed.regionTop);
    const target = Math.min(Math.max(desired, 0), maxY);

    // Already where we want to be — the common case for switches that grow or
    // barely change. Unpin and leave the page alone.
    if (Math.abs(target - window.scrollY) < 2) {
      unpin();
      return;
    }

    if (reduceMotion) {
      window.scrollTo({ top: target, behavior: "auto" });
      unpin();
      return;
    }

    window.scrollTo({ top: target, behavior: "smooth" });

    // Unpin once the animation lands. Releasing early would shorten the
    // document mid-flight and reintroduce the clamp we are here to prevent.
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      window.removeEventListener("scrollend", finish);
      window.clearTimeout(timer);
      settle = null;
      unpin();
    };
    const timer = window.setTimeout(finish, SETTLE_TIMEOUT_MS);
    window.addEventListener("scrollend", finish, { once: true });
    settle = finish;
    // deps are the caller's switch signals; the hook re-runs per switch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reduceMotion]);

  return arm;
}
