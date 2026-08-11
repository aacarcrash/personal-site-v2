# Design spec — personal-site-v2

## Colors
Pure monochrome — no accent colors anywhere (the project thumbnails are the only color on the page). Tokens defined as CSS custom properties in `app/globals.css`, remapped through Tailwind v4 `@theme inline` (`--color-bg`, `--color-text`, etc.), theme switched via `next-themes` using `[data-theme="dark"]`.

Every text grey carries a **role and a minimum size**, and both are binding. Pick the token by role; if the result looks too loud, the block is on the wrong size step, not the wrong grey.

| Token | Light | Dark | Role | Min size |
|---|---|---|---|---|
| `--bg` | `#FAFAFA` | `#0F0F0F` | page ground | — |
| `--text` | `#111111` | `#F0F0F0` | primary copy, titles | any |
| `--text-secondary` | `#444444` | `#C8C8C8` | sustained reading copy that is not primary — project prose, CV bullets | 15px |
| `--text-muted` | `#5E5E5E` | `#9A9A9A` | short metadata: eyebrows, dates, tags — **and anything inactive-but-clickable** | 11px |
| `--text-disabled` | `#8A8A8A` | `#6A6A6A` | genuinely non-interactive disabled options. Never a live control | 11px |
| `--text-subtle` | `#BBBBBB` | `#444444` | **never text.** Hairlines, dividers, placeholder fills, `·` and `/` separator glyphs | n/a |
| `--surface` | `#F0F0F0` | `#1A1A1A` | quiet fill, active chip | — |
| `--border` | `#E5E5E5` | `#2A2A2A` | every rule and divider | — |
| `--grid-line` | `#E8E8E8` | `#222222` | axis-grid cell lines | — |
| `--hairline` | `#F0F0F0` | `#1A1A1A` | legacy; prefer `--border` | — |

`--text-secondary` and `--text-muted` were `#555555`/`#5E5E5E` — nine hex apart in light, six in dark. A documented four-tier scale that painted as three. The gap is the whole point of having two tokens; do not close it again.

`--text-subtle` is 1.75:1 on `--bg`. That is a hairline value, not an ink. Three separate contrast bugs came from it landing on text a reader had to read, which is why the "never text" line above exists.

Rule: never introduce a hue. Selection tint and focus rings derive from `--text` via `color-mix`, not a new color.

## Typography

Three self-hosted Collletttivo faces (the "Sheet U" system), all OFL-1.1, in `app/fonts/` with their licences beside them — the OFL requires the notice to travel with the files, so do not delete them. The **role** variable names are kept deliberately: 45 call sites read them, so the next family swap is one edit in `globals.css`.

- **Aujournuit** (`--font-display` → `--font-serif`) — display, headings, project and case-study names.
- **Absans** (`--font-text` → `--font-sans`) — body text, paragraphs, nav, UI labels. Default `body` font.
- **Necto Mono** (`--font-data` → `--font-mono`) — axis labels, dates, metadata, all-caps eyebrows, captions, technical tags, controls.

### No bold. No italic. This is a hard constraint.

Every face ships **one style: weight 400, upright**. `html` sets `font-synthesis: none`, so the browser cannot fake the missing ones. Any `fontWeight: 500/600/700` or `fontStyle: italic` renders as plain regular — **silently**, which is the dangerous part: the rule looks applied in devtools and does nothing to the pixels.

Emphasis must therefore be re-encoded as **size, colour, family, or a rule**. Two canonical cases:

- **Captions** — italic used to be the only thing separating a caption from body copy. Now a family change: `.caption` is mono at `--step-data`.
- **Eyebrows** — `.eyebrow` drops the weight entirely and keeps mono + uppercase + `0.08em` tracking + `--text-muted`, which was already more signal than half a weight step.

Letter-spacing on tracked labels is **em, not px**. It had drifted across 0.3/0.4/0.5/1/1.5px, and at 11–13px that is the difference between a tracked label and a broken word.

### Type ramp

Nine steps in `:root`, each `--step-*` with a matching `--lh-*`. Sizes are a ratio ramp; the **line-heights** are what sit on the 4px grid, which is what actually keeps blocks aligned.

| Step | Size / leading | Role |
|---|---|---|
| `--step-label` | 11 / 16 | mono eyebrows, section labels — **ramp floor** |
| `--step-meta` | 12 / 16 | mono chrome, badges, kbd |
| `--step-data` | 13 / 20 | dates, locations, tags, captions |
| `--step-sm` | 15 / 24 | CV bullets, skills, card titles |
| `--step-base` | 16 / 28 | body prose (1.75 leading) |
| `--step-lead` | 20 / 32 | About prose |
| `--step-title` | 24 / 32 | CV entry titles, statement |
| `--step-display` | 32 / 40 | section display |
| `--step-h1` | 48 / 52 | page titles |

**Do not add sizes between steps** — if a size feels wrong the block is on the wrong step. Nothing may render below 11px.

Deliberately **not** exposed as Tailwind `text-*` utilities: that namespace is font-size and this file already uses `--text-*` for colour, so a `text-muted` class would silently become a font size. Components read `var(--step-*)` directly.

### Measure

Absans has a small x-height with long ascenders (x/ascender 0.61 vs Inter's 0.73) — it is stretched, not compressed. It wants a long leading **and** a short line; either alone reads badly. Body prose is 16/28 against a **660–680px measure** (~78 characters), from the validated specimen. An 840px measure runs ~93 characters and was the actual problem the last time this looked wrong — the size was never it.

## Spacing
Tailwind v4 default 4px base scale, used consistently in multiples of 4: 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 40, 56, 64px. Dominant gaps: `24px` (grid gaps, footer nav), `40px` (case-study row gaps), `56px` (full-row/sidebar gaps). Dominant page padding: desktop gutter `64px` horizontal, mobile gutter `20px` horizontal (`.page-gutter`, breakpoint 820px). Section vertical padding commonly 32–48px desktop, 20–32px mobile.

## Breakpoints
Tailwind defaults, but the one custom breakpoint actually driving the layout is `max-width: 820px` (used repeatedly across `globals.css` for gutter/grid/row collapses — treat this as the real mobile/desktop split, not Tailwind's `md`/`lg`). A secondary `max-width: 640px` exists for the footer only. Cluster view is desktop-only, gated at `>=1024px` (falls back to a notice below that).

## Component rules
- **Radius:** small and consistent — `6px` for media/thumbnail containers (`.mcs-thumb`, featured thumbnails), `2px` for small UI chrome (focus outline, view-switcher active pill). No large/pill radii observed.
- **Borders:** hairline, `0.5px solid var(--border)` — card thumbnails, row dividers (`.pr-row`), footer top rule, the statement's left rule. **One weight and one colour for every rule on the site**, no exceptions: the statement rule was 1.5px of `--text` and read as a different kind of mark entirely. `.rule` / `.rule--v` are the canonical classes.
- **Links:** one treatment, `.link-underline` — `--text` (or the caller's own colour), 1px thickness, 3px offset. Offset is what the eye reads as "same treatment"; it had drifted across 2px, 3px and unset over 13 call sites.
- **Shadows:** none. Depth is conveyed via `--surface` background and hairline borders, not box-shadow. The one "elevation" cue is a soft `box-shadow` focus ring (`color-mix(in srgb, var(--text-muted) 70%, transparent)`) for keyboard focus only — never on hover/click.
- **Buttons:** unstyled by default (`background: transparent; border: none; padding: 0; font: inherit; color: inherit`) — button styling is applied ad hoc per use (e.g. view-switcher: mono 12px, `padding: 6px 8px`, active state = `--surface` background + `--text` color, inactive = transparent + `--text-muted`).
- **Nav/links:** `Inter` 14px, `--text-secondary` default, `--text-muted` for less-emphasized/breadcrumb items, `--text` for the active/current crumb. Links inherit color (`a { color: inherit }`), no underlines by default.
- **Focus:** visible only for keyboard users — `:focus { outline: none }`, `:focus-visible { outline: 2px solid var(--text); outline-offset: 2px; border-radius: 2px }`.

## Controls & floating chrome (added 2026-08-09)

Specs for interactive control surfaces (view switcher, search, any future toolbar). These
inherit every rule above — monochrome, hairlines, no shadows — plus:

- **Control height:** 30px desktop (7px vertical padding + 12px mono label), minimum 44px
  touch target below 820px (pad the hit area, not the visual).
- **Segmented control** (view switcher): container `0.5px solid var(--border)`, radius
  `2px`, overflow hidden. Segments: `padding 7px 12px`, JetBrains Mono 12px, 12×12 inline
  SVG icon `fill="currentColor"` + label, gap 6px. Active: `--surface` bg + `--text`
  (**no weight change — there is no bold**). Inactive: transparent, `--text-muted`;
  disabled, `--text-disabled`. Icons: grid = four 5×5 squares,
  list = three 12×1.4 bars, cluster = four scattered dots.
- **Search input / trigger:** hairline border, radius `2px`, `padding 7px 10px`, search
  icon (stroked circle+line, 1.3px, `--text-muted`), mono 12px `--text-muted` placeholder,
  right-aligned `⌘K` kbd pill (mono 10px, `--surface` bg, radius 2px). Fixed 220px in a
  toolbar; in the header it spans the empty title-row space (fluid width, 40px min margins
  to the name block and nav).
- **Floating glass bar — the ONE material exception.** Allowed only for a single floating
  control bar. Radius **6px** (the media radius — pill/capsule radii stay banned, per
  Component rules). `background: color-mix(in srgb, var(--bg) 35%, transparent)`;
  `backdrop-filter: blur(20px) saturate(1.6)`; border `0.5px solid color-mix(in srgb,
  var(--text) 12%, transparent)`; inset specular top highlight `rgba(255,255,255,0.55)`
  light / `0.12` dark. **No drop shadow** — the lifted-card look was rejected as
  incoherent with a site built on hairlines; the earlier `0 8px 24px` allowance is
  withdrawn. Inside glass, controls drop their own borders; active segment =
  `color-mix(in srgb, var(--bg) 62%, transparent)`, radius 4px. Distance from viewport
  bottom: 24px.
- **Glass is built as sibling layers, and this is load-bearing.** `backdrop-filter` on a
  container makes it a backdrop *root*, and Chromium then ignores the filter on any
  descendant — the computed style applies and the pixels never move. So the panel and the
  selected-item pill are siblings, each with its own filter, with the labels in a third
  unfiltered layer. Both filters are set **inline**: LightningCSS strips `backdrop-filter`
  out of stylesheets, so a rule in `globals.css` computes to `none`.
- **Known limitation, not a bug:** `backdrop-filter` only samples what is directly behind
  the element. A bar over blank gutter has nothing to transmit, so it reads as glass near
  imagery and as a solid pill otherwise.
- **Contrast floor:** any interactive or inactive-but-clickable text ≥ 4.5:1 against its
  ground — that is why inactive-but-clickable rides `--text-muted` (6.3:1) and only a
  genuinely disabled option may drop to `--text-disabled` (3.4:1, still clear of the 3:1
  non-text floor). See the Colors table for the full role/size scale.
- **Text over imagery:** a scrim, never inversion. `mix-blend-mode: difference` inverts
  against the backdrop, so it is excellent on black and white and **fails on mid-grey** —
  and mid-grey (ice, fog, concrete, skin) is the common case for photographic thumbnails,
  not the edge case. Card overlays use `linear-gradient(to top, rgba(0,0,0,0.88),
  rgba(0,0,0,0.62) 55%, transparent)` with full-white text.
- **Chosen glass-bar radius (2026-08-10):** the homepage ViewBar ships at **12px**, not the
  6px default above — picked from mockups over the generic media radius.
- **Motion:** floating chrome may translate/fade on scroll (0.25s ease); all of it
  collapses to instant under `prefers-reduced-motion`.

## Layout invariants
- No horizontal scroll at any viewport — enforced as a global backstop (`body { overflow-x: hidden }`) in addition to fixing root causes per-component.
- Page gutter: `64px` desktop, `20px` mobile (below 820px), applied via `.page-gutter` / equivalent per-section padding, not ad hoc inline values.
- Project detail main column widens further on large screens via `clamp(64px, 7vw, 180px)` horizontal padding, capping at `180px` on ultrawide rather than the content going edge-to-edge.
- Grids collapse to single column below 820px (`.cs-row`, `.featured-grid`, `.mcs-onboard`); rows that are `flex-direction: row` on desktop stack to `column` on mobile.
- Reduced motion respected globally (`prefers-reduced-motion: reduce` collapses all animation/transition durations to ~0).
- Scrollbar space reserved (`scrollbar-gutter: stable`) so modals/lightboxes never shift layout on open.
