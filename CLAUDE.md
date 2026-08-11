# Claude Code project notes

This repo is `personal-site-v2` — Aakarsh Singh's portfolio site rebuild. The
old CRA project lives in the sibling `personal-site/` folder and is preserved
as archive — do not modify it.

## HARD RULE — keep a visible task queue (added 2026-08-11)

**Every request the user makes goes into the task list, immediately, before
any work starts.** Use the Task tools (`TaskCreate` / `TaskUpdate` /
`TaskList`) so the queue renders in the user's terminal — the point is that
he can see and re-order the backlog, so a queue that lives only in your head
or in prose breaks the rule.

Non-negotiables:

- **Capture on arrival.** The user works in fast bursts and sends several
  requests before the first one is answered. Each one becomes a task the
  moment it lands, even mid-tool-call. Nothing is held in working memory.
- **One task per request.** Do not silently merge two asks into one entry,
  and do not drop the small ones (copy tweaks, size bumps) because they feel
  trivial — those are the ones that get lost.
- **Status is live.** Mark `in_progress` before starting and `completed` only
  when actually verified. A half-done task stays `in_progress`.
- **Findings become tasks too.** Defects from the `evaluator`, review agents,
  or your own investigation get queued, not just narrated in a reply.
- **Record dependencies** with `addBlockedBy` when one task genuinely cannot
  start before another. Blocked work should be visibly blocked, not silently
  skipped.

Why: this session lost track of several requests across rapid-fire messages,
and the user had to ask where things stood. The queue is the coordination
surface between him and the session — treat it as part of the deliverable.

## Read first

If this is a fresh session, read these in order:

1. **`HANDOFF.md`** — exhaustive status, what's done, what's pending, open
   questions. Single source of truth for project state.
2. **`docs/decisions.md`** — locked design decisions (font system, colors,
   data schema, etc.) with the reasoning behind each. Don't relitigate these
   without an explicit ask.
3. **`docs/mare-framing.md`** — the verified framing for Mare on the site.
   Strict — don't embellish or invent features.
4. **`docs/source-of-truth.md`** — where every CV/role/exhibition fact comes
   from, so future updates can cite their origin.

## Stack

- Next.js 16.2 (App Router) + React 19 + TypeScript + Tailwind v4
- `framer-motion` for the axis grid animations and lightboxes
- `next-themes` for light/dark mode (CSS custom properties via `data-theme`)
- 3-font system via `next/font`: Instrument Serif / Inter / JetBrains Mono
- Image optimization via Next.js `<Image>` + an offline pass for source assets

## Structure

```
app/
  layout.tsx            ThemeProvider + font loading + metadata
  page.tsx              Homepage: Header → FeaturedStrip → ResponsiveGrid → Footer
  projects/[slug]/      Project detail page (SSG, generateStaticParams)
  about/, cv/           Static pages
  loading.tsx, not-found.tsx

components/
  AxisGrid/             AxisGrid.tsx + AxisSwitcher + ProjectCell + axisGridUtils
  ResponsiveGrid.tsx    Picks AxisGrid (≥768px) or MobileGroupedList (<768px)
  MobileGroupedList.tsx
  FeaturedStrip.tsx
  ClusterLightbox.tsx   Modal for sketch clusters
  MareCaseStudy.tsx     Special slot rendered inside /projects/mare
  MediaCarousel.tsx     Natural-aspect-ratio carousel with ←/→ keys
  Header.tsx, Footer.tsx, ThemeProvider.tsx, ThemeToggle.tsx

data/                   Thin Zod-validating shims — NOT where the copy lives.
  types.ts              AxisKey, Project, Cluster, ProjectOrCluster, Zod schemas
  projects.ts           Re-exports content/projects.json + clusters.json (validated)
  cv.ts                 Re-exports content/cv.json (validated)

content/                SOURCE OF TRUTH for all site copy. Edit HERE (or via the
  projects.json         local admin), not data/*.ts. The admin (npm run admin)
  clusters.json         writes back to these files + public/images/, so it only
  cv.json               runs locally — it can't work on Vercel (filesystem writes).
  axes.json, featured.json, notes/

# CV has TWO sources: content/cv.json (the /cv web page) and latex-src/*.tex
# (the downloadable PDF). They are synced by hand — after editing cv.json,
# re-render the PDF (pdflatex) or it goes stale. Resume PDF: latex-src/resume.tex.

lib/
  thumb.ts              Maps .gif paths → .thumb.webp siblings

scripts/
  migrate-data.py       (one-off) regenerates _projects.regenerated.ts
  extract-gif-thumbs.py Convert first frame of each GIF → .thumb.webp
  optimize-images.py    In-place resize + recompress all /public images

public/
  images/               ~106MB after optimization (was 291MB)
  Aakarsh_Singh_Resume_090525.pdf
  Aakarsh_Singh_Artist_CV.pdf
```

## Verification (added 2026-07-06)

Any UI change must pass the global `web-verify` skill before you report it
done: multi-viewport capture (`~/.claude/skills/web-verify/scripts/capture.mjs`
from the repo root, dev server on 127.0.0.1) → `gate.mjs` → `evaluator` agent
(opus) judging the screenshots against `design.md`. A global Stop hook blocks
ending a session with frontend edits but no fresh `.verify/last-run.json`.
`design.md` at the repo root is the design-spec oracle — keep it in sync with
`docs/decisions.md` if tokens change. Two known open responsive defects are
listed in the 2026-07-06 HANDOFF.md addendum.

## Commit style

Follow what's already in `git log` — lowercase imperative, scoped to a phase
or fix. Co-author with Claude when you commit. User wants commits at every
phase boundary, not buffered.

## Don't

- Don't embellish Mare's metrics or features. See `docs/mare-framing.md`.
- Don't reframe LAND, To Water, NEEEU, Faceshopping etc. as "design
  engineering" — they're art and should stay framed as art.
- Don't reintroduce `unrealEngineData.json` / `touchDesignerData.json` data —
  those were class-internal and never publicly linked. The "Unreal Engine" and
  "TouchDesigner" clusters in `data/projects.ts` come from the public
  `renderData.json` only.
- Don't add accent colors. Locked: pure monochrome. Thumbnails are the only
  color on the page.
- Don't write three-paragraph "About" copy. The /about page is short personal
  + verbatim artist statement under a Statement quote block.

## Linked repo: career-ops

Sibling at `../career-ops` (Aakarsh's private AI job-search pipeline). Sessions here
have full access to it via `additionalDirectories` in `.claude/settings.local.json`.
The two are often worked together: job search ↔ portfolio. Rules when touching it
from here:

- Its git is **fully independent** and it must NEVER be pushed (origin is a public
  upstream fork; the folder holds private data). This repo pushes normally. Always
  `cd` into the repo you are committing in.
- Read its `START-HERE.md` and `CLAUDE.md` before changing anything there — it has
  strict data-contract and tracker rules.
- Its `cv.md` and this repo's `content/cv.json` + `latex-src/*.tex` are SEPARATE CV
  sources — if a fact changes, update every affected source, don't assume one feeds
  the other.
- Joint job-search sessions usually launch from career-ops (its memory holds the
  outreach doctrine and candidate context).

@AGENTS.md
