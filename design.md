# Design spec — personal-site-v2

## Colors
Pure monochrome — no accent colors anywhere (the project thumbnails are the only color on the page). Tokens defined as CSS custom properties in `app/globals.css`, remapped through Tailwind v4 `@theme inline` (`--color-bg`, `--color-text`, etc.), theme switched via `next-themes` using `[data-theme="dark"]`.

| Token | Light | Dark |
|---|---|---|
| `--bg` | `#FAFAFA` | `#0F0F0F` |
| `--text` | `#111111` | `#F0F0F0` |
| `--text-secondary` | `#555555` | `#A0A0A0` |
| `--text-muted` | `#999999` | `#666666` |
| `--text-subtle` | `#BBBBBB` | `#444444` |
| `--surface` | `#F0F0F0` | `#1A1A1A` |
| `--border` | `#E5E5E5` | `#2A2A2A` |
| `--grid-line` | `#E8E8E8` | `#222222` |
| `--hairline` | `#F0F0F0` | `#1A1A1A` |

Rule: never introduce a hue. Selection tint and focus rings derive from `--text` via `color-mix`, not a new color.

## Typography
Three-font system, each with a distinct role — do not blend them:
- **Instrument Serif** (`--font-serif`) — display, headings, large numbers, project/case-study names.
- **Inter** (`--font-sans` / `--font-inter`) — body text, paragraphs, nav, UI labels. Default `body` font.
- **JetBrains Mono** (`--font-mono`) — axis labels, dates, metadata, all-caps section eyebrows, technical tags, view-switcher controls.

Scale (validated, treat as canonical): 48px display / 28px heading / 20px subhead / 16px body / 14px label / 12px caption. Observed in practice: nav/body links 14–15px, header name 28px serif, featured project name 20px serif, list-row title 28px serif (22px on mobile), eyebrow/mono labels 11–12px with 0.3–1.5px letter-spacing and often uppercase.

## Spacing
Tailwind v4 default 4px base scale, used consistently in multiples of 4: 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 40, 56, 64px. Dominant gaps: `24px` (grid gaps, footer nav), `40px` (case-study row gaps), `56px` (full-row/sidebar gaps). Dominant page padding: desktop gutter `64px` horizontal, mobile gutter `20px` horizontal (`.page-gutter`, breakpoint 820px). Section vertical padding commonly 32–48px desktop, 20–32px mobile.

## Breakpoints
Tailwind defaults, but the one custom breakpoint actually driving the layout is `max-width: 820px` (used repeatedly across `globals.css` for gutter/grid/row collapses — treat this as the real mobile/desktop split, not Tailwind's `md`/`lg`). A secondary `max-width: 640px` exists for the footer only. Cluster view is desktop-only, gated at `>=1024px` (falls back to a notice below that).

## Component rules
- **Radius:** small and consistent — `6px` for media/thumbnail containers (`.mcs-thumb`, featured thumbnails), `2px` for small UI chrome (focus outline, view-switcher active pill). No large/pill radii observed.
- **Borders:** hairline, `0.5px solid var(--border)` — used for card thumbnails, row dividers (`.pr-row`), footer top rule. Never a heavier border weight.
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
  SVG icon `fill="currentColor"` + label, gap 6px. Active: `--surface` bg, `--text`,
  weight 700. Inactive: transparent, `--text-muted`. Icons: grid = four 5×5 squares,
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
  light / `0.12` dark; a single soft drop shadow `0 8px 24px rgba(17,17,17,0.10)` is
  permitted on this floating element only (it detaches from the page, so it needs depth).
  Inside glass, controls drop their own borders; active segment = `color-mix(in srgb,
  var(--bg) 62%, transparent)`, radius 4px. Distance from viewport bottom: 24px.
- **Contrast floor:** any interactive or inactive-but-clickable text ≥ 4.5:1 against its
  ground. (Current `--text-muted` values fail this — pending token fix to `#707070` light
  / `#8A8A8A` dark.)
- **Motion:** floating chrome may translate/fade on scroll (0.25s ease); all of it
  collapses to instant under `prefers-reduced-motion`.

## Layout invariants
- No horizontal scroll at any viewport — enforced as a global backstop (`body { overflow-x: hidden }`) in addition to fixing root causes per-component.
- Page gutter: `64px` desktop, `20px` mobile (below 820px), applied via `.page-gutter` / equivalent per-section padding, not ad hoc inline values.
- Project detail main column widens further on large screens via `clamp(64px, 7vw, 180px)` horizontal padding, capping at `180px` on ultrawide rather than the content going edge-to-edge.
- Grids collapse to single column below 820px (`.cs-row`, `.featured-grid`, `.mcs-onboard`); rows that are `flex-direction: row` on desktop stack to `column` on mobile.
- Reduced motion respected globally (`prefers-reduced-motion: reduce` collapses all animation/transition durations to ~0).
- Scrollbar space reserved (`scrollbar-gutter: stable`) so modals/lightboxes never shift layout on open.
