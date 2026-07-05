# TODO: Cluster view — proper redesign (attractor layout)

**Status:** parked / not started. Deferred deliberately (2026‑07‑06). The current
cluster view is in a "good direction but not there" state — see *Current state*
below. Pick this up as a fresh, focused task; don't bolt more tweaks onto the
existing force config.

## Why this exists

The homepage `cluster` view (grid / list / **cluster** toggle) is a force‑directed
"Venn" visualization: each axis value is an **attractor** at a hand‑placed
coordinate; projects link to every attractor they're tagged with and settle
between them; a dashed ellipse ("well") is fit around each attractor's members.

Chasing polish on it turned into whack‑a‑mole — every knob traded one problem for
another. The redesign below is the actual fix.

## Symptoms observed (what the user flagged)

- **Dead quadrants / stranded whitespace.** e.g. on `concern`, the four attractors
  sit top / left / center / bottom‑center / upper‑right, so the **bottom‑right
  quadrant is empty** — no data lives there. Looks like a big blank hole.
- **Adjacent attractors → circles overlap for no reason.** e.g. on `medium`, the
  **Web (220,200)** and **XR (480,200)** attractors are ~260px apart at the top;
  their wells balloon into each other.
- **Nodes appear in the wrong cluster.** Consequence of the above — `Callback`
  (pure‑web) visually lands in the web∩XR overlap and reads as "in XR."

## Root cause (the real tension)

1. **Attractor positions are hand‑placed per axis and don't evenly fill the
   canvas.** Some are too close together (Web/XR on `medium`); some quadrants have
   no attractor at all (bottom‑right on `concern`). See `ATTRACTOR_COORDS` in
   `components/ClusterView/ClusterView.tsx`.
2. **Circle sizing is a lose‑lose with the current attractor grid:** big circles
   enclose their members but overlap neighbors; small circles don't overlap but
   strand members outside. There's no single cap that wins while attractors are
   placed as they are.

## The redesign (do this)

1. **Re‑place every axis's attractors so they're spread evenly around the canvas
   — like points on a clock face / ring** — with roughly equal angular spacing and
   no two adjacent values crammed together. Goal: clusters separate, the canvas
   fills, no dead quadrants.
   - Do it **per axis**: `concern` (4), `medium` (7), `context` (4), `technology` (6).
     Value counts differ, so the ring spacing differs per axis.
   - Keep related‑ish values near each other only if it genuinely helps reading;
     otherwise even spacing wins.
2. **Then size the circles to that layout.** With attractors well‑separated, a
   moderate enclosing radius can both wrap members *and* avoid neighbor overlap.
   Re‑tune `fitBlob(tagged, padding, maxRadius)` and the force config against the
   new positions — don't reuse the current numbers blindly.
3. **Re‑verify labels + expansion against the new layout.** The radial label
   placement and the canvas‑fill expansion assume the layout centroid; both should
   still work but confirm with screenshots of **all four axes**, not just one.
4. **Screenshot every axis** (concern/medium/context/tech) before calling it done —
   the failures only show up on specific axes (Web/XR was `medium`; dead quadrant
   was `concern`).

## Current state (what's implemented right now, uncommitted)

The "good direction" state is in place on the branch (three files modified vs HEAD):
- `components/ClusterView/useForceLayout.ts` — added gentle centering (`forceX/Y`
  strength 0.04) + per‑tick canvas clamp (fixes the "flung to a corner" bug #1) +
  a post‑sim **uniform expansion** that scales the settled layout to fill the
  canvas. Charge is the **original −90**, collide **34** (a lower‑charge tweak was
  tried and reverted — it over‑tightened and made Web collide with XR).
- `components/ClusterView/fitBlob.ts` — ellipse radii now come from the **max point
  extent along each principal axis** (encloses members) instead of a σ‑based radius;
  `maxRadius` cap 300.
- `components/ClusterView/ClusterView.tsx` — ellipses are `pointer-events:none` and
  hover lives on the **label** (fixes the click‑dead‑zone bug #2); labels are
  auto‑placed **radially outward** past each circle with a **leader line** (fixes
  the ambiguous‑label bug #3); `fitBlob(tagged, 40, 300)`; empty `LABEL_COORDS`
  override map left in place for future hand‑pinning.

The three original bugs (flung node, click dead‑zones, ambiguous labels) **are
fixed** in this state — the redesign is only about the attractor grid / overlaps /
whitespace, so keep those fixes.

**Alternative if the redesign isn't worth it:** `git restore
components/ClusterView/` reverts to the original committed look (stable, but the 3
bugs come back).

## Files

- `components/ClusterView/ClusterView.tsx` — `ATTRACTOR_COORDS` (the thing to
  re‑place), blob rendering, labels.
- `components/ClusterView/useForceLayout.ts` — force sim + clamp + expansion.
- `components/ClusterView/fitBlob.ts` — ellipse fit.
- Data: `content/projects.json` + `content/clusters.json` axis tags; `content/axes.json`
  is the value vocabulary each axis's attractors must cover.
