# Locked design decisions

These were settled in the rebuild session and shouldn't be relitigated
without an explicit ask. Each entry has the *why* so future-you can judge
edge cases.

---

## Visual system

### Color: pure monochrome
- Light: `#FAFAFA` bg, `#111` text, `#999` muted, `#F0F0F0` surface, `#E5E5E5` border, `#E8E8E8` grid lines
- Dark: `#0F0F0F` bg, `#F0F0F0` text, `#A0A0A0` muted, `#1A1A1A` surface, `#2A2A2A` border
- **Why:** Explored warm neutrals + sage, cool stone + lavender, cool teal +
  cerulean. User chose monochrome. The thumbnails are the only color on the
  page — that's the point. Don't add accents.

### Typography: 3-font system
- **Instrument Serif** (display, headings, large numbers, project names)
- **Inter** (body text, paragraphs, descriptions, navigation)
- **JetBrains Mono** (axis labels, dates, metadata, all-caps section labels,
  technical tags)
- **Why:** Each font has a clear role. Mono on axis labels reinforces the
  "drafting table" metaphor of the grid. Three is not overkill — it's
  what well-designed editorial sites do.

### Type scale (validated in Paper mockups)
- 48px display / 28px heading / 20px subhead / 16px body / 14px label / 12px caption

---

## Information architecture

### One unified site, no toggles
- Hiring managers and curators both land on the same homepage and see the
  same axis grid.
- The axis switcher lets each audience navigate to what's relevant to them.
- **Why:** A toggle ("show me the engineer / show me the artist") would
  undermine the central thesis: "I am one person doing both."

### Axis grid as homepage centerpiece
- Default view: time × medium (most intuitive)
- 5 axis options per side: time, medium, concern, technology, context
- Both axes switchable; URL state synced via `?y=time&x=medium`
- **Why:** Matches the original portfolio site spec. The animation when axes
  change is itself an engineering-craft signal. (Identity is now "Product
  Engineer" — 2026-07-06 relabel, see career-ops/POSITIONING.md — the craft
  argument stands.)

### Featured strip above the grid
- 3 pinned projects, immune to axis state, controlled by `featured: boolean`
  on each project
- Currently: Mare, Callback, NEEEU (all professional product/client work)
- LAND deliberately NOT featured — it surfaces strongly in the grid; the
  featured strip serves the 10-second hiring manager view
- **Why:** All three featured slots = professional product/client work
  maximises the product-engineer signal (relabel 2026-07-06). The grid
  handles the art surfacing.

### Sketch clusters
- Smaller thumbnails with count badge (e.g. "11" for shaders)
- Click → `ClusterLightbox` modal with the items list
- **Why:** First-class citizens of the grid (not on a "Miscellaneous" page).
  Switching to the technology axis should reveal "11 shader pieces" and make
  the resume line tangible.

### Project framing tiers
- **Tier 1 — Full case study** (case-study tier, role + company badge):
  Mare, Callback, NEEEU, Date 0:0, NYU Tandon
- **Tier 2 — Light framing** (light tier): Synapse, "Real" Art, AA Warsaw
- **Tier 3 — Stay as art** (art tier): LAND, To Water, FAT32, Cryoponics,
  aloegarten, Genesis, Faceshopping, Communication Plateau, etc.
- Currently `tier` only changes detail-page rendering (Mare gets the bespoke
  case study). Optional future use: drives thumbnail size or opacity in the
  grid (deferred).

---

## Data architecture

### Single typed source of truth
- `data/projects.ts` and `data/cv.ts` are the only places to edit content
- Types in `data/types.ts` enforce axis values at compile time
- No CMS, no headless backend — content changes are git commits

### `featured` boolean per project
- Toggle without code changes, just edit data
- **Why:** User wanted to A/B which projects sit in the featured strip
  without touching the component.

### `tier: "case-study" | "light" | "art"` per project
- Drives detail-page rendering (Mare gets the bespoke `MareCaseStudy`
  component); could later drive thumbnail prominence

### CV data is data, not markup
- `data/cv.ts` exports typed arrays for each section (experience, shows,
  press, etc.)
- Adding a new entry = appending one TS object to the relevant array
- **Why:** Easier to maintain than the PDF. The PDF in `/public` is a
  downloadable snapshot; the HTML page is the live version.

---

## Image strategy

### `next/image` for everything serveable
- Automatic resize via `sizes` prop → smallest WebP/AVIF served
- AVIF preferred over WebP via `next.config.ts`

### Offline pass for source files
- `scripts/optimize-images.py` resizes everything to 1920px max + recompresses
- `scripts/extract-gif-thumbs.py` makes static `.thumb.webp` for grid use
- GIFs >5MB converted to MP4 manually via ffmpeg (88% size reduction)
- **Why:** Even with `next/image`, source files ship with the build and cost
  Vercel bandwidth/transformations. Pre-optimizing once saves recurring cost.

### `lib/thumb.ts` redirects to optimized variants
- `.gif` → `.thumb.webp` for grid/featured/mobile rendering
- External URLs (vimeo embeds) skipped (treated as placeholder)

---

## Carousel + media decisions

### Natural aspect ratios in `MediaCarousel`
- No forced 16:10 crop — mobile screenshots (9:19) display at full ratio
- ←/→ keys, click thumbs, click prev/next, click image to zoom
- **Why:** The previous grid forced every image into 16:10 and brutally
  cropped mobile screenshots. User flagged it; this is the fix.

### Three video kinds, three renderers
- **Local `.mp4`/`.webm`**: `<video autoPlay loop muted playsInline>` — for
  converted GIFs (CamJam, Genesis)
- **External vimeo/youtube**: `<iframe>` at 16:9
- **Local images**: `<Image>` with intrinsic sizing + click-to-zoom

---

## Anti-patterns to avoid

- **Don't write three-paragraph "About" copy.** The /about page leads with a
  short personal first-person paragraph and ends with the user's verbatim
  artist statement in a serif italic quote block. The CV holds the long form.
- **Don't add accent colors.** Even subtle ones break the monochrome thesis.
- **Don't reframe art as engineering.** LAND, To Water, FAT32 etc. are art
  pieces — the curator audience will smell forced framing. The site already
  signals engineering through Mare/Callback/NEEEU as case studies.
- **Don't add CMS overhead.** Content lives in TypeScript files. Edits are
  PRs (or pushes to main).


---

## Media presentation

### Project media: masonry gallery, not a carousel (2026-07-04)
- Project detail pages render `project.media` as a columnar masonry gallery
  (`components/MediaGallery.tsx`) — all media visible at once, natural aspect
  ratios, click any tile for a full-screen lightbox with arrow/Esc nav.
  Columns collapse 3 -> 2 -> 1 (`.media-gallery` in `globals.css`).
- Replaced the old one-at-a-time `MediaCarousel` (still in the tree, now unused
  on project pages).
- **Why:** User wanted people to see all media at once, cosmos.so / Pinterest
  style, rather than clicking through a stage one image at a time. It also fits
  the art-portfolio idiom and pairs each still with a "source" link (e.g. AAVS
  process stills each link to their moment in the performance video). Tiles stay
  light: YouTube tiles show a poster + play badge; the iframe only mounts in the
  lightbox, so the grid never loads N iframes.
- Admin: thumbnails can be set by picking from a project's existing media
  (`components/admin/ThumbnailPicker.tsx`), not only by upload/path.

---

## Controls & floating chrome

### Placement D shipped: filled header search + glass ViewBar (2026-08-10)
- Search trigger lives in the header, spanning the empty title-row space
  between the name block and the About/CV nav (`components/Header/HeaderSearchTrigger.tsx`,
  filled treatment — `--surface` background, no border). Collapses to a
  44px icon-only hit area below 820px.
- The homepage-only floating glass bar (`components/ViewBar.tsx`) now carries
  just the grid/list/cluster segmented picker — search doesn't duplicate into
  it. Replaces the four-variant A/B/C/D prototype (`components/proto/`,
  deleted) and the old inline `ViewSwitcher` row (component file kept for its
  `isViewMode`/`ViewMode` exports; no longer rendered).
- Glass bar radius shipped at **12px**, not the 6px default documented in
  `design.md`'s Controls section — picked from mockups.
- `--text-muted` moved `#999999` -> `#707070` (light) and `#666666` -> `#8A8A8A`
  (dark) to clear the 4.5:1 contrast floor called out when the Controls spec
  was written (2026-08-09).
