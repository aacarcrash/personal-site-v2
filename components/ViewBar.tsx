"use client";

// Floating glass control bar — homepage only, placement D. Search lives in
// the header (HeaderSearchTrigger); this bar carries only the segmented
// grid/list/cluster picker. Same URL-switching logic as the old
// ViewSwitcher.tsx (router.replace, delete `view` for grid, scroll:false) —
// that component's isViewMode/ViewMode helpers are reused here, but its own
// row is no longer rendered anywhere.

import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { DEFAULT_VIEW, isViewMode, type ViewMode } from "./ViewSwitcher";
import { useCycleKeys } from "./useCycleKeys";
import { useSwitchAnchor } from "@/lib/useSwitchAnchor";

// GLASS IS THE DEFAULT: a light frosted panel in light mode, inverting to a
// dark frosted panel under [data-theme="dark"]. The SELECTED segment is the
// only dark-glass element — it dims its own backdrop with brightness(),
// which is what makes the panel/selection relationship read as one material
// at two values rather than a pill stuck onto a bar.
// Selection has to carry on value alone: this type system has no bold.
// The ?bar=ink comparison material is gone — glass is the shipped choice.

// How much of the bar stays visible while it is resting. The bar is never
// fully hidden: a control the page depends on should be discoverable without
// the user first guessing that scrolling reveals it.
// 12px measured fine in a headless viewport and was invisible on an actual
// phone: the browser's bottom chrome and the home indicator sit in exactly
// that band, so the sliver had nothing left to show. 22px clears both and is
// still a peek rather than a half-open bar.
const PEEK_VISIBLE_PX = 22;

// The bar opens when the region it CONTROLS comes into view, not at a fixed
// scroll offset. A hardcoded threshold was wrong at every viewport it had not
// been tuned for — on a phone the three featured cards stack, so 160px was
// still inside the first card. Observing the element means the trigger
// adapts to viewport height, featured-strip height and layout for free.
// Two conditions, AND'd. Either alone is wrong:
//
//   region visible  — the grid has started entering the screen. Alone this
//     opens the bar at scroll 0 on desktop, where the grid already sits
//     above the fold, so it never peeks.
//   user has scrolled — alone this is just the old fixed threshold with a
//     smaller number, and says nothing about where the work actually is.
//
// The midpoint rule I tried before ("top crosses 50% of the viewport")
// failed on SHORT viewports: at 446x483 the user is looking at grid rows
// while the region's top is still below the midpoint, so the bar stayed
// peeking with the work plainly on screen. -10% opens as the grid arrives.
const WORK_REGION_ID = "work-region";
const OPEN_MARGIN = "0px 0px -10% 0px";
const SCROLLED_PX = 40;

// How close the pointer has to get before the bar rises to meet it. The zone
// is generous on purpose: the bar is a small target at the bottom edge, and
// asking someone to land on a 12px sliver is a worse interaction than opening
// slightly early.
const PROXIMITY_PX = 120;

const VIEW_KEYS: ViewMode[] = ["grid", "list", "cluster"];

const VIEWS: { key: ViewMode; label: string }[] = [
  { key: "grid", label: "grid" },
  { key: "list", label: "list" },
  { key: "cluster", label: "cluster" },
];

// All three icons share a 12×12 viewBox and fill="currentColor" so their
// optical weight and vertical centering match exactly — verified by
// screenshot per the build spec (design engineers notice icon drift first).
function GridIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
      <rect x="0" y="0" width="5" height="5" />
      <rect x="7" y="0" width="5" height="5" />
      <rect x="0" y="7" width="5" height="5" />
      <rect x="7" y="7" width="5" height="5" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
      <rect x="0" y="1" width="12" height="1.4" />
      <rect x="0" y="5.3" width="12" height="1.4" />
      <rect x="0" y="9.6" width="12" height="1.4" />
    </svg>
  );
}

// Radii nudged up from the initial spec (2.2/1.6/1.6/1.1 -> 2.6/1.9/1.9/1.3):
// the smaller circles left the icon's ink area and bounding box visibly
// short of grid/list's, reading as faint punctuation next to them in a
// side-by-side check. Centers unchanged.
function ClusterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
      <circle cx="3.2" cy="3.4" r="2.6" />
      <circle cx="9" cy="4.4" r="1.9" />
      <circle cx="5" cy="9" r="1.9" />
      <circle cx="10" cy="9.6" r="1.3" />
    </svg>
  );
}

function ViewIcon({ view }: { view: ViewMode }) {
  if (view === "grid") return <GridIcon />;
  if (view === "list") return <ListIcon />;
  return <ClusterIcon />;
}

function ViewBarInner() {
  const searchParams = useSearchParams();
  const param = searchParams.get("view");
  const current: ViewMode = isViewMode(param) ? param : DEFAULT_VIEW;


  const reduceMotion = useReducedMotion();


  /* Armed on a user-initiated switch only, so it never fires on first mount or
     on a back/forward navigation. The hook pins the region's height across the
     commit — without that, a switch to a shorter view lets the browser clamp
     scrollY before any effect of ours can run, and the realign below then sees
     the clamped position and decides there is nothing to do. That is why this
     used to leave you somewhere arbitrary despite the code that was meant to
     prevent exactly that. */
  const armRealign = useSwitchAnchor([current], reduceMotion, "region-top");

  const setView = useCallback(
    (view: ViewMode) => {
      // window.location.search, not the useSearchParams snapshot. The grid
      // writes y and x with history.replaceState (see AxisGrid), which the
      // router never sees — so the snapshot is missing them, and building the
      // next URL from it would drop the axis pair every time the view changed.
      // The address bar is the truth here.
      const params = new URLSearchParams(window.location.search);
      // Omit the param for whatever the DEFAULT is, not for a hardcoded
      // mode. This used to test `view === "grid"`, so the moment the default
      // moved to list, clicking grid deleted the param and the page fell
      // straight back to list — grid was unreachable from the bar.
      if (view === DEFAULT_VIEW) {
        params.delete("view");
      } else {
        params.set("view", view);
      }
      const qs = params.toString();
      armRealign();
      // Same reason as the axes (see AxisGrid): router.replace runs Next's
      // ScrollAndFocusHandler on the first client navigation after a page load,
      // which resets the document to the top, and `scroll: false` does not stop
      // it. The view is client state too — nothing on the server reads it — so
      // there is nothing to navigate to. Shallow routing is a supported API and
      // keeps useSearchParams in sync, which is what re-renders the view.
      window.history.replaceState(null, "", qs ? `/?${qs}` : "/");
    },
    [armRealign],
  );

  // Left/right switch view, GLOBALLY — no focus required. This was scoped
  // to focus inside the bar, which meant they did nothing on a fresh load
  // until you had tabbed to the bar, and nobody tabs to a bar they have not
  // noticed.
  //
  // Global is safe for these two specifically: left/right scroll a page
  // HORIZONTALLY, and this page has none (body sets overflow-x: hidden), so
  // capturing them takes nothing away. Up/down are deliberately untouched —
  // those are real vertical scrolling and stealing them was the bug that
  // sent the axes to WASD in the first place.
  useCycleKeys<ViewMode>([
    {
      back: "arrowleft",
      fwd: "arrowright",
      options: VIEW_KEYS,
      current,
      onChange: setView,
    },
  ]);

  // Two independent reasons to be open, OR'd together:
  //   inView  — the work region is on screen (the automatic, intelligent one)
  //   invited — the user hovered, focused or tapped the peeking bar
  const [inView, setInView] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [invited, setInvited] = useState(false);
  const open = (inView && scrolled) || invited;

  // Show the key hint once, unprompted, the first time the bar rises.
  // Discovery cannot depend on hovering a control the user has not noticed
  // yet — and this bar spends most of its life peeking off-screen. It runs
  // once per mount and then never again, so it stays an introduction rather
  // than a recurring nag.
  const [introducing, setIntroducing] = useState(false);
  const hasIntroduced = useRef(false);
  useEffect(() => {
    if (!open || hasIntroduced.current) return;
    hasIntroduced.current = true;
    // Wait for the bar's own spring to finish arriving, or the hint slides
    // up with it and reads as part of the bar rather than a note about it.
    const show = window.setTimeout(() => setIntroducing(true), 420);
    const hide = window.setTimeout(() => setIntroducing(false), 3600);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [open]);

  // Pointer PROXIMITY, not element hover. Hovering the element itself is a
  // feedback loop: hover opens the bar, opening moves the bar out from under
  // the cursor, mouseleave fires, it closes, the cursor is over it again —
  // so it oscillates. The hit region here is derived from where the bar sits
  // when OPEN, so the target never moves as the state changes.
  useEffect(() => {
    if (!window.matchMedia?.("(hover: hover) and (pointer: fine)").matches) return;
    let frame = 0;
    const onMove = (e: MouseEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const el = barRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const bottomOffset = parseFloat(getComputedStyle(el).bottom) || 24;
        // Open-state box, independent of the current animated position.
        const openTop = window.innerHeight - bottomOffset - r.height;
        const centreX = r.left + r.width / 2;
        const near =
          e.clientY >= openTop - PROXIMITY_PX &&
          Math.abs(e.clientX - centreX) <= r.width / 2 + PROXIMITY_PX;
        setInvited(near);
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLLED_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const target = document.getElementById(WORK_REGION_ID);
    // No region on this page, or no observer support: fail OPEN. A visible
    // control is the safe failure, an invisible one is not.
    if (!target || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: OPEN_MARGIN },
    );
    io.observe(target);
    return () => io.disconnect();
  }, []);



  // The selected pill is a separate LAYER, not a background on the button.
  // Reason (researched, then verified in the browser): backdrop-filter makes
  // an element a "backdrop root" for its descendants, so a filter on a child
  // of the frosted panel is ignored by Chromium — the computed style applies
  // and the pixels never change. The pill therefore has to be a SIBLING of
  // the panel so it samples the page itself. That means its position has to
  // be measured rather than inherited from the button box.
  const barRef = useRef<HTMLDivElement>(null);
  const segRefs = useRef<Partial<Record<ViewMode, HTMLButtonElement | null>>>({});
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);

  // Resting offset: enough to leave PEEK_VISIBLE_PX of the bar showing above
  // the viewport edge. Measured rather than hardcoded, since the bar's height
  // changes with the type ramp and with mobile padding.
  const [peekY, setPeekY] = useState(0);
  useLayoutEffect(() => {
    const measurePeek = () => {
      const el = barRef.current;
      if (!el) return;
      const h = el.getBoundingClientRect().height;
      const bottomOffset = parseFloat(getComputedStyle(el).bottom) || 24;
      setPeekY(h + bottomOffset - PEEK_VISIBLE_PX);
    };
    measurePeek();
    window.addEventListener("resize", measurePeek);
    return () => window.removeEventListener("resize", measurePeek);
  }, []);

  useLayoutEffect(() => {
    const measure = () => {
      const bar = barRef.current;
      const seg = segRefs.current[current];
      if (!bar || !seg) return;
      const b = bar.getBoundingClientRect();
      const s = seg.getBoundingClientRect();
      setPill({ left: s.left - b.left, width: s.width });
    };
    measure();
    // Web fonts change segment widths after first paint, and Necto Mono is
    // loaded with display:swap — without this the pill sits at fallback-font
    // widths until the next resize.
    document.fonts?.ready.then(measure).catch(() => {});
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [current]);

  return (
    <motion.div
      ref={barRef}
      className={`view-bar view-bar--glass${open ? "" : " is-peek"}${introducing ? " is-introducing" : ""}`}
      role="group"
      aria-label="View"
      // `inert`, not `aria-hidden`. aria-hidden on a container of focusable
      // buttons is itself an axe "serious" violation (aria-hidden-focus): the
      // buttons stay tabbable, so a keyboard user lands on a control that is
      // hidden from screen readers and off-screen. inert removes it from the
      // a11y tree AND the tab order together, which is the actual intent.
      // While resting, the bar is a single affordance: hovering, focusing or
      // tapping it opens it. `inert` on the SEGMENTS (below) stops that first
      // tap from also switching view, which would be a mis-click every time.
      onFocusCapture={() => setInvited(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setInvited(false);
      }}
      onClick={() => {
        if (!open) setInvited(true);
      }}
      style={{ cursor: open ? undefined : "pointer" }}
      initial={false}
      // x:"-50%" is the horizontal centring, and it MUST live here rather
      // than as translateX in CSS: motion writes the whole transform when
      // it animates y, so a CSS translateX gets overwritten and the bar
      // hangs off to the right of centre.
      // NO opacity in this animation. An ancestor with opacity < 1 becomes a
      // backdrop ROOT, which switches off backdrop-filter on every
      // descendant — so while the bar faded in, the frosted panel and the
      // selected pill both rendered unfiltered and then snapped into glass
      // the instant opacity reached exactly 1. Translation alone hides it:
      // the bar sits 24px from the bottom, so y:140 puts it fully
      // off-viewport with nothing peeking.
      animate={{ x: "-50%", y: open ? 0 : peekY }}
      // Mirror of the entrance, which reads well because MOVEMENT LEADS and
      // the text arrives during its tail: the spring starts at 0ms, the
      // labels fade in from 80ms over 180ms, and settle just before the
      // spring finishes at ~320ms.
      // Leaving has to run the other way round — text out FIRST, then the
      // drop — otherwise the bar is already sliding while the labels are
      // still legible, which is what read as out of sync. The 0.18s delay
      // here is exactly the CSS fade-out duration, so the descent begins on
      // the frame the labels finish disappearing.
      transition={
        reduceMotion
          ? { duration: 0 }
          : {
              type: "spring",
              stiffness: 420,
              damping: 30,
              mass: 0.7,
              // 0.07 against a 0.22s fade — the descent starts once the
              // labels are ~30% gone, so roughly two thirds of the fade
              // happens WHILE the bar is already moving. A near-zero
              // overlap still read as two events; the motion has to begin
              // during the fade for the two to feel like one gesture.
              delay: open ? 0 : 0.07,
            }
      }
      // NO backdrop-filter on this container. It would make the whole bar a
      // backdrop root and neutralise the pill's own filter. The frosted
      // panel is a child layer instead, and the pill is its SIBLING, so the
      // two sample the page independently.
    >
      <span
        className="view-bar__panel"
        aria-hidden
        // Inline for the same reason as the pill: LightningCSS strips
        // backdrop-filter out of stylesheets, so a rule in globals.css
        // computes to "none" at runtime (verified).
        style={{
          backdropFilter: "blur(14px) saturate(1.25)",
          WebkitBackdropFilter: "blur(14px) saturate(1.25)",
        }}
      />
      {pill && (
        <span
          className="view-bar__pill"
          aria-hidden
          style={{
            transform: `translateX(${pill.left}px)`,
            width: pill.width,
            // Inline because LightningCSS strips backdrop-filter out of
            // stylesheets. brightness() below 1 is what makes it DARK glass:
            // it dims the real pixels behind rather than covering them.
            // The tone comes from a CSS VARIABLE, not from reading the
            // theme in JS. backdrop-filter has to be inline (LightningCSS
            // strips it from stylesheets), but an inline value may still
            // reference a var — so the light/dark swap stays in CSS where
            // [data-theme] already lives. No useTheme, no mounted guard, no
            // hydration flash, and nothing to desync from the stylesheet.
            backdropFilter: "blur(12px) var(--pill-tone)",
            WebkitBackdropFilter: "blur(12px) var(--pill-tone)",
            transition: reduceMotion
              ? "none"
              : "transform 0.32s cubic-bezier(0.32,0.72,0,1), width 0.32s cubic-bezier(0.32,0.72,0,1)",
          }}
        />
      )}
      {VIEWS.map((v) => {
        const active = v.key === current;
        return (
          <button
            key={v.key}
            type="button"
            ref={(el) => {
              segRefs.current[v.key] = el;
            }}
            onClick={() => setView(v.key)}
            aria-pressed={active}
            /* Roving tabindex: only the selected segment is tabbable, so Tab
               lands on the one the pill is under and focus can never point
               at a different segment than the selection. */
            tabIndex={active ? 0 : -1}
            inert={!open}
            className={`view-bar-seg${active ? " active" : ""}`}
          >
            <ViewIcon view={v.key} />
            {v.label}
          </button>
        );
      })}
      {/* Discovery hint. Hidden until the bar is hovered or something inside
          it holds focus, and hidden outright on touch — see globals.css. */}
      <span className="view-bar-keyhint" aria-hidden>
        <span className="view-bar-keycap">←</span>
        <span className="view-bar-keycap">→</span>
        switch view
      </span>
    </motion.div>
  );
}

export function ViewBar() {
  return (
    <Suspense fallback={null}>
      <ViewBarInner />
    </Suspense>
  );
}
