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

## Layout invariants
- No horizontal scroll at any viewport — enforced as a global backstop (`body { overflow-x: hidden }`) in addition to fixing root causes per-component.
- Page gutter: `64px` desktop, `20px` mobile (below 820px), applied via `.page-gutter` / equivalent per-section padding, not ad hoc inline values.
- Project detail main column widens further on large screens via `clamp(64px, 7vw, 180px)` horizontal padding, capping at `180px` on ultrawide rather than the content going edge-to-edge.
- Grids collapse to single column below 820px (`.cs-row`, `.featured-grid`, `.mcs-onboard`); rows that are `flex-direction: row` on desktop stack to `column` on mobile.
- Reduced motion respected globally (`prefers-reduced-motion: reduce` collapses all animation/transition durations to ~0).
- Scrollbar space reserved (`scrollbar-gutter: stable`) so modals/lightboxes never shift layout on open.
