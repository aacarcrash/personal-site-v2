# Mare framing rules

Mare is the centerpiece of the portfolio. A hiring manager at Linear or
Vercel will spend more time on `/projects/mare` than anywhere else. The
framing below is **verified by the user** and survived honest pushback in
multiple long conversations. Don't embellish.

---

## Approved facts

| Fact | Source |
| --- | --- |
| Title: "Co-founder & Design Engineer" (also CTO; site currently uses "Co-founder, CTO & Design Engineer") | LinkedIn-ready Version D v2 |
| Dates: 2024 — Present | LinkedIn-ready Version D v2 |
| 100+ designers, artists, researchers in **closed** beta | Verified verbatim |
| 10,000+ reference items processed | Verified verbatim |
| Are.na + Pinterest integrations only | User explicitly corrected an earlier "8 platforms" framing |
| Supports images and links only (NOT PDFs / videos / text files) | User explicitly corrected this |
| Stack: Next.js + TypeScript frontend, Python backend, Firebase, custom ML pipelines | LinkedIn-ready Version D v2 |
| Live URL: https://mare.run | — |

---

## Things to NEVER claim

- "8+ platforms" or "many platforms" — only Are.na + Pinterest are live
- "Heterogeneous media" — overclaims format diversity
- "PDFs, videos, text files" — those format integrations don't ship yet
- New Inc membership — only applied, not accepted
- Specific clustering speed numbers (5s for 1000 items isn't brag-worthy)
- Generic startup-pitch language ("Mare is changing how creatives work")
- User testimonials / "what users say" framing
- Vanity metrics ("up X% in Y weeks")

---

## The three design decisions on `/projects/mare`

These are the slots in `components/MareCaseStudy.tsx`. They were chosen
after scanning the actual Mare Web UI Paper file (90 artboards). They're
real decisions visible in the product, not generic placeholders.

### 1. Three clustering modes, not a slider
Mare clusters the same library three ways — Balanced / Aesthetic / Semantic
— with a Recluster button. The temptation was a single similarity slider,
but a slider implies a smooth gradient between two ends. The actual modes
are different algorithms with different signals. Three buttons make that
honest. Smallest control surface that lets a user actively reshape what
"belongs together" means.

### 2. Surfacing ambiguity, not smoothing it over
Two related decisions follow from one principle: don't hide what the system
isn't sure about.
- **Always-visible "Unclustered" sidebar** — items the algorithm can't
  confidently place sit in a persistent right-rail with a count.
- **Hierarchical sub-collections** — clusters can nest into sub-collections
  (a 123-item collection might contain 7 sub-collections). Drill into a
  fuzzy boundary instead of treating every cluster as flat.

### 3. Item detail as side panel, not modal
Clicking any item opens a contextual side panel with themes, related items,
and an extracted color palette — without losing the cluster you came from.
A modal would force dismiss-and-return for every cross-reference. The color
palette doubles as the Aesthetic-mode clustering signal.

---

## Mare media still needed (placeholders in production)

The `MareCaseStudy` component renders these slots with elegant gradient
placeholders. When the user provides assets, drop them in:

### 1. Screen recording (60–90 seconds, no narration)
- Smooth screen capture (Loom / Cleanshot / Screen Studio)
- Walk through one realistic flow: import a small Are.na or Pinterest
  collection → see clusters appear → hover for metadata → click into a
  cluster → maybe one detail interaction
- No voiceover. Optional subtle music.
- Export as MP4 ~5–8MB, OR upload to Vimeo/YouTube and embed
- Why: shows the product is real and the interactions feel considered

### 2. Three annotated screenshots (one per design decision above)
- Annotated with arrows/circles in Figma or Cleanshot
- The body text is already written in `MareCaseStudy.tsx` — just need the
  visual to match each decision

### 3. Real Mare thumbnail
- Currently a gradient placeholder for the featured strip + grid cell
- Source artboard (from Mare Web UI Paper file): `3P-0` Collections Page —
  Dark Mode, OR `1UN-0` Layout V2: Light Mode Desktop

---

## Source artboards in Mare Web UI Paper file

The file isn't always available (Paper MCP comes and goes). When it's
mounted, these are the most useful artboards:

- `3P-0` Collections Page — Dark Mode (the main view, with 3 modes + Unclustered sidebar)
- `1UN-0` Layout V2: Light Mode Desktop (warm cream sidebar)
- `9R-0` Item Detail View — Dark Mode (side panel with color palette)
- `2A4-0` Ingestion Modal — Dark (Upload / URL / Platforms tabs)
- `DTQ-0` Collection Detail A: Editorial Scroll (hierarchical sub-collections)
- `1ZI-0` / `21M-0` Layout V2: Phone Dark / Light (mobile views)
