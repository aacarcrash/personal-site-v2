# Mare framing rules

Mare is the centerpiece of the portfolio. A hiring manager at an AI
creative-tool startup (Krea, Recraft, Spline, Rive, Tldraw, Runway,
Magic Patterns, Lovable, v0, etc.), or a founder considering Aakarsh
for a small-team product engineering role, will spend more time on
`/projects/mare` than anywhere else. Linear / Vercel-tier pure-craft
companies are NOT the target anymore — see `portfolio-site-brief.md`
for the positioning history.

The framing below is **verified by the user** and survived honest
pushback in multiple long conversations. Don't embellish.

---

## Approved facts

| Fact | Source |
| --- | --- |
| Title: "Co-founder & Product Engineer" (2026-07-06 canonical — dropped the CTO / Design-Engineer stack) | user decision 2026-07-06 |
| Dates: January 2026 — Present (started after the Date 0:0 gig; the "2024" in career-ops / LinkedIn is an error to correct down) | user decision 2026-07-06 |
| 100+ designers, artists, researchers in **closed** beta | Verified verbatim |
| 10,000+ reference items processed | Verified verbatim |
| Are.na + Pinterest integrations only | User explicitly corrected an earlier "8 platforms" framing |
| Supports images and links only (NOT PDFs / videos / text files) | User explicitly corrected this |
| Stack: Next.js + TypeScript frontend, FastAPI/Python backend, Supabase (auth + relational + pgvector), self-hosted Qwen on Modal (embeddings + LLM serving), Cloudflare R2 (assets), Stripe (billing) | mare-monorepo (verified by user) |
| Deployment: Cloud Run for Web + API, Cloud Tasks for async, Cloud Scheduler for periodic, Secret Manager for secrets, all on GCP | mare-monorepo (verified by user) |
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

## The two design decisions on `/projects/mare`

These are the slots in `components/MareCaseStudy.tsx`. They're real
decisions visible in the product, picked from a wider set after scanning
the Mare Web UI Paper file. The earlier "side panel vs modal" item was
dropped — too small a UI choice to flex as a centerpiece.

### 1. Three clustering modes side by side
Mare clusters the same library three ways at once — Balanced / Aesthetic
/ Semantic — with a Recluster button. A single similarity slider was
considered and rejected: a slider implies one smooth signal, but the
modes are actually different algorithms reading different things. Three
labels make that honest, and let users reshape what "belongs together"
on purpose.

### 2. Showing what the system isn't sure about
Two related interactions follow from one principle. Items the algorithm
can't confidently place sit in a persistent **Unclustered** rail with a
count, instead of being pushed into the nearest cluster. And clusters
can hold **sub-collections** — a 123-item collection might contain seven
of them. The unsure piles and the nested edges are where most of the
interesting cross-references live.

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

### 2. Two annotated screenshots (one per design decision above)
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
