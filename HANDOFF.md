# Handoff — personal-site-v2

> **2026-07-06 addendum — web-verify harness + 2 open responsive defects.**
> A global autonomous-verification harness now exists and this project was its
> pilot. What changed here:
> - playwright pinned to `1.61.1` + `@playwright/test` added (devDeps);
>   `design.md` created at repo root (design-spec oracle derived from
>   `app/globals.css` + `docs/decisions.md`); `.verify/` gitignored.
> - **Workflow for any UI change**: use the global `web-verify` skill
>   (`~/.claude/skills/web-verify/`) — run `capture.mjs` from the repo root
>   against the dev server (6 viewports 375/390/768/1280/1440/1920 →
>   `.verify/<ts>/` PNGs + console/network logs), then `gate.mjs` (hard-fails
>   on console errors / same-origin ≥400s), then spawn the `evaluator` agent
>   (opus, vision) on the PNGs + `design.md`. Max 3 fix↔evaluate iterations.
>   A global Stop hook BLOCKS ending a session with frontend changes but no
>   fresh `.verify/last-run.json` — run web-verify before wrapping up.
> - **Two REAL defects found by the pilot evaluator, still open (not fixed):**
>   1. **[768×1024] project grid doesn't collapse.** The 7-column medium×year
>      matrix stays 7-wide at 768 even though design.md/docs say grids
>      collapse below 820px (featured cards above it DO stack). Columns are
>      crushed; "Performance"/"Installation" headers collide. Likely fix:
>      `ResponsiveGrid.tsx` switches AxisGrid↔MobileGroupedList at 768px —
>      the threshold/behavior needs to match the documented 820px collapse.
>   2. **[390×844] fixed circular "N" badge overlaps content** (the "Callback"
>      heading / LAND thumbnail) because the badge is wider than the 20px
>      mobile gutter. Fix: inset/shrink it to respect the gutter, or hide
>      below 820px. Fine on desktop widths.
>   ~~Evidence PNGs: `.verify/1783333334653/`~~ (pruned — both defects were fixed
>   and re-verified later on 2026-07-06; `.verify` now auto-prunes to the newest
>   3 runs via the global gate.mjs).
>   After fixing, re-run web-verify to confirm PASS — don't eyeball it.

> **2026-07-02 addendum — job-search sprint session.** Much below is stale
> (admin panel, 3 view modes, content/*.json layer all exist now). That
> session's changes, committed on `main`:
> - **Mobile works**: header/featured/project pages responsive; view switcher
>   on mobile (list = collapsible filters, cluster = horizontal pan).
> - **Mare case study**: overview now renders BEFORE the six decisions
>   (`CaseStudyHero`/`CaseStudyDecisions` split); equal-width decision rows.
> - **Security**: Next 16.2.10 (proxy-bypass CVEs); dev binds 127.0.0.1
>   (`npm run dev:lan` for LAN); admin audit passed otherwise.
> - **Resume**: `latex-src/resume.tex` rebuilt to ONE page and compiled
>   locally (Tectonic at `C:\Users\Aakarsh\tools\tectonic.exe`); both
>   `public/Aakarsh_Singh_Resume*.pdf` replaced (old ones had NO Mare).
> - **Rule**: never name Mare's model (Qwen) in public copy — grep before
>   publishing. `content/cv.json` Mare stack corrected.
> - **The job-search state lives in `../career-ops/HANDOFF-JOBSEARCH-2026-07-02.md`**
>   (+ `reports/003` channels strategy, `reports/004` market research,
>   `linkedin-profile-v2-lean.md`, `auto/` application tooling).
> - Still on the user: ~~deploy to Vercel~~ (done — live at aakarsh.dev as of 2026-08-10), launch LinkedIn, recompile artist CV.

---

## TL;DR

The new site is **complete and pushed** to the private repo
`aacarcrash/personal-site-v2` on GitHub (default branch `main`). It builds
clean (`npm run build` passes; 31 static pages). It runs at
`http://localhost:3000` via `npm run dev`. **DEPLOYED — live at aakarsh.dev (verified 2026-08-10; Mare, LAND, Callback featured).**

The rebuild moved a CRA-based portfolio to a Next.js App Router site with an
"axis-label grid" homepage (the original portfolio specification lives in
`../personal-site/Aakarsh_Portfolio_Site_Specification.md`). Mare is the
centerpiece; product engineer roles + the artist practice both surface
honestly. (Identity relabel 2026-07-06: "design engineer" → "Product Engineer"
site-wide; rationale in career-ops/POSITIONING.md.)

---

## What's done (phases 1–4)

### Phase 1 — Foundation
- Next.js 16 + React 19 + Tailwind v4 scaffold at `/personal-site-v2`
- 3-font system via `next/font`: Instrument Serif (display) / Inter (body) /
  JetBrains Mono (UI labels, axis values, dates)
- Monochrome design tokens with light + dark mode (CSS custom props,
  `next-themes`)
- Unified data schema in `data/types.ts` and `data/projects.ts`
- One-off Python migration script consolidates the 4 old CRA JSON files into
  one TS array (`scripts/migrate-data.py` writes to
  `_projects.regenerated.ts`; `data/projects.ts` is the hand-tuned final)
- Mare added with verified framing (see `docs/mare-framing.md`)
- Routes: `/`, `/projects/[slug]`, `/about`, `/cv` + `loading.tsx` +
  `not-found.tsx`

### Phase 2 — AxisGrid
- 2D spatial field with switchable axes (year × medium default)
- 5 axis options per side: time, medium, concern, technology, context
- URL state sync (`?y=time&x=medium`) via `useSearchParams`
- Framer Motion `<motion.div layoutId>` reanimates thumbnails on axis change
- AnimatePresence on labels for fade-and-replace transitions
- Hover scales thumbnails 1.4× with z-index bump

### Phase 3 — Detail pages, Mare case study, mobile, lightbox
- Project detail template at `app/projects/[slug]/page.tsx`
- `MareCaseStudy` component renders only when `slug === "mare"` (screen
  recording placeholder + 3 design decision cards with placeholder gradients)
- `ResponsiveGrid` swaps between `AxisGrid` (≥768px) and `MobileGroupedList`
  (<768px) via CSS-only switch
- `ClusterLightbox` for sketch clusters (Shaders, TD, Unreal Engine, Live
  sets, Live coding, AR experiments)
- `MediaCarousel`: natural aspect ratios, ←/→ keys, click thumbnails or
  prev/next buttons, click image for full-screen zoom; supports local MP4
  (autoplay/loop/muted), local images (Next/Image), and external iframes
  (vimeo/youtube)

### Phase 4 — Polish, image optimization, deploy prep
- About page rewritten as short personal + verbatim artist statement quote
- `/cv` rebuilt to comprehensive unified format with sections: Experience,
  Selected Exhibitions/Performances/Screenings, Teaching, Residencies, Press,
  Education, Honors & Awards, Skills. Two PDF download buttons (Resume tech
  + Artist CV)
- Image optimization: 291MB → 106MB total (-64%)
  - `optimize-images.py`: in-place resize to 1920px max + re-encode JPEG/PNG
  - GIF → MP4 conversion via ffmpeg for the heaviest content (CamJam GIFs:
    18-22MB → ~1MB each, Genesis GIF: 9MB → 634KB)
  - `.poster.webp` first frames generated for MP4 carousel thumbs
- Accessibility: `:focus-visible` outline, `::selection` styling, all buttons
  audited for `aria-label`/`aria-pressed`
- Production build clean (`npm run build`); 31 static pages
- Pushed to private GitHub repo `aacarcrash/personal-site-v2`

---

## What's NOT done

### Vercel deploy
The repo is on GitHub but not yet wired to Vercel. Cleanest path:
1. Open https://vercel.com/new
2. Import `aacarcrash/personal-site-v2` (Vercel sees private repos via
   GitHub auth)
3. Framework: Next.js (auto-detected), no env vars needed
4. Deploy → ~2 min → `*.vercel.app` URL
5. Once verified, add `aakarsh.dev` in Vercel project Domains and update DNS

### Mare media
The `MareCaseStudy` component renders elegant gradient placeholders for:
- 60–90s screen recording (Vimeo embed slot)
- 3 design decision screenshots (one per decision: clustering modes,
  Unclustered sidebar + sub-collections, side-panel item detail)

User needs to capture and drop in. The capture brief is preserved in the
plan file (`~/.claude/plans/wondrous-rolling-dawn.md` if you have it; also
summarised in `docs/mare-framing.md`).

### Mare project thumbnail (featured strip + grid)
Currently a gradient placeholder. Needs a real screenshot from the product —
ideally the Collections page from the Mare Web UI Paper file
(see `docs/mare-framing.md` for which artboard).

### Date 0:0 + AA Warsaw thumbnails
Both placeholder gradients. User to provide.

### Misc-vs-featured grid hierarchy (deferred)
We deliberately deferred this. Three options were on the table; user said
"figure out later":
1. Opacity-based hierarchy (case-study 100%, light 80%, sketches 60%)
2. Three explicit thumbnail sizes
3. Pinned indicator (tiny dot on strongest 6–8)

When picking up, see `HANDOFF.md` history below for the full analysis.

### User's manual edit
The user commented out the "Honors & Awards" section in `app/cv/page.tsx`
(lines 192-204). Intentional — the awards data still exists in `data/cv.ts`
but isn't rendered. Don't re-enable without an explicit ask.

---

## Open questions (none blocking, asked across the session)

- **Future open-source piece** — the career strategy doc recommends shipping
  one polished public component (a "Sonner moment") to break into Linear /
  Vercel. Not the site's job, but worth surfacing when you next think about
  "what to ship."
- **PDFs are stale-ish** — the `Aakarsh_Singh_Resume_090525.pdf` and
  `Aakarsh_Singh_Artist_CV.pdf` in `/public` are snapshots. The HTML `/cv`
  page is data-driven and will drift if the user adds an entry only to one
  place. No automation here yet.

---

## Key local commands

```bash
# Dev (note: dev server auto-fixes the lockfile root warning via
# next.config.ts turbopack.root)
npm run dev

# Production build
npm run build

# Image optimization (in-place; commit before running so you can revert)
python scripts/optimize-images.py

# GIF first-frame extraction (idempotent, skips existing .thumb.webp)
python scripts/extract-gif-thumbs.py

# Re-migrate from old CRA JSON (writes _projects.regenerated.ts; merge by hand)
python scripts/migrate-data.py
```

---

## Key facts NOT to forget

- **Mare framing is verified** — see `docs/mare-framing.md`. 100+ beta users,
  10,000+ items processed, Are.na + Pinterest only (NOT 8 platforms),
  images + links only (NOT PDFs/videos/text). Don't say "heterogeneous
  media." Don't mention New Inc (only applied, not accepted).
- **The artist statement on `/about` is verbatim** from the user's exhibition
  CV. Don't paraphrase it.
- **The site IS the application** for product engineer roles. Every craft
  detail matters because the site itself is being evaluated.
- **Two audiences, one site, no toggles** — hiring managers and curators both
  see everything. The axis grid lets each audience navigate their part. The
  CV is unified, not tabbed.
- **Old repo is archive** — `../personal-site` (the original CRA) stays
  untouched. Don't sync changes back.

---

## File-by-file quick map

See `CLAUDE.md` for the structure. The files most likely to need editing:

- **Add a project**: append to `data/projects.ts` (see Mare entry as template)
- **Add a CV entry**: append to relevant array in `data/cv.ts`
- **Tweak Mare design decisions**: `components/MareCaseStudy.tsx`
- **Change tagline**: `components/Header.tsx` (the `Product Engineer. New
  media artist. Co-founder of Mare.` string)
- **Change the about prose**: `app/about/page.tsx`
- **Change axis values**: `data/types.ts` (the YEARS / MEDIUMS / CONCERNS /
  TECHNOLOGIES / CONTEXTS const arrays)
- **Add a new font weight**: `app/layout.tsx` (the `next/font` config)
