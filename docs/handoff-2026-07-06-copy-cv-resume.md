# Handoff: portfolio copy / CV / résumé decisions (2026-07-06)

## Goal
`personal-site-v2` = Aakarsh Singh's portfolio (aakarsh.dev, Next 16 / React 19 / TS).
This session ran a copy + CV correctness pass and shipped it. A batch of higher-judgment
work was **parked** because Aakarsh was tired. This packet lets a fresh agent evaluate the
parked **decisions** and execute the **queued fixes**. The site is LIVE — `main` @ `205f07e`,
`npm run build` green. Deep detail: `docs/cv-restructure-plan.md` (web /cv) and
`docs/resume-reframe-notes.md` (tech résumé).

## Current state
**DONE + verified, on `main` @ 205f07e (pushed; build exit 0; PDFs re-rendered & viewed):**
- `/about` bio sharpened — names what Mare is; voice tightened. (`app/about/page.tsx`)
- "Sound & Music / Sound-Music Computing" → **"Sound Computing"** everywhere (cv.json + all .tex).
- Press links added to `content/cv.json` (Dazed, e-flux, Khaleej Times, WAM); Dazed date→May 14;
  stale WAM/Khaleej URLs refreshed in `artist-cv.tex`.
- **Magzoid cut** from cv.json + artist-cv.tex + reference (verified pay-to-feature, WAM repost).
- Email → **aakarsh@nyu.edu** everywhere (resume.tex was last holdout).
- **Artist-CV 3-page bad break FIXED** → clean 2 pages (`needspace` + reduced a stray `\vspace{1 cm}`).
- Both PDFs re-rendered → `public/Aakarsh_Singh_{Resume_2026,Artist_CV}.pdf`.
- `/about` bottom padding fixed (was touching footer rule).
- **OG image disabled** (`app/opengraph-image.tsx` → `.disabled`) + meta description →
  "Design engineer and new media artist. Co-founder of Mare." (old line kept as `//` comment).

**NOT STARTED:** everything under "Open decisions" and "Queued fixes" below.

## Decisions made (do NOT re-litigate)
- Keep `/about` and `/cv` **separate** pages; URL stays `/about`; no redirects.
- **Artist statement stays verbatim** (Aakarsh's explicit instruction — do not touch that copy).
- Email is **aakarsh@nyu.edu** by choice (yes it's a student address that may expire — his call).
- **Magzoid cut**; **Dazed kept** even though the article doesn't name him (he wants it as show coverage).
- **AA Warsaw title stays "Instructor & Curriculum Developer"** — e-flux lists him as "Teaching
  Assistant" but he says the TA label undersells his actual role. Keep Instructor.
- **OG image disabled, not deleted** — reversible by renaming `.disabled` back.
- **Headshot optional** — launch without; a B&W in-performance/studio shot would fit the locked
  monochrome design better than a corporate headshot. Not a blocker.
- LinkedIn leads engineer-first, site leads artist+engineer — **deliberately different openers**, fine.

## Open decisions (NEED AAKARSH — cannot default)
1. **`/cv` restructure shape.** CV mixes tech jobs + exhibitions in one scroll. Options:
   **B) combined page + sticky right rail w/ jump-nav** (my rec — keeps range visible) vs
   **A) Engineering/Art toggle** (hides the other track). See cv-restructure-plan.md.
2. **Résumé art-trim level** (tech résumé "Selected Projects"): **minimal** (2 eng projects + 1
   exhibitions line) vs **fuller** art presence. Gates the headline-reframe work.
3. **CV Mare title:** keep "Co-founder, CTO & Design Engineer" or trim to **"Co-founder & CTO"**
   (my rec — triple-stack reads as padding at his own company).
4. **LinkedIn ↔ site fact reconciliation** (pick canonical): venue list (site adds Sydney Opera
   House + Dark Mofo, LinkedIn doesn't) and Mare start date (LinkedIn 2024 vs site Jan 2026).

## Queued fixes (direction clear; needs green-light / wording OK)
- **NEEEU bullet** — replace vague "20% customer engagement" (resume.tex ~L249, cv.json ~L74).
  Proposed: *"Built and shipped an AR filter for a BMW × Fischersund magazine campaign in Meta
  Spark Studio, faking volumetric 3D under a tight filter memory budget with custom
  rotation-tracking billboard and refraction shaders."*
- **Reorder résumé "Selected Projects"** reverse-chron (latent-space May 2026 → AA July 2025 →
  LAND Nov 2024–Apr 2025). Currently out of order.
- **Fix LAND outlink** resume.tex ~L276: `aakarsh.dev/work/LAND` → `aakarsh.dev/projects/land`.
- **Résumé section spacing** — more breathing room under `\section` rules
  (`\titlespacing*{\section}{0pt}{1em}{0.5em}`); keep it 1 page.
- **Reframe the two résumé film headlines engineering-first** (depends on decision #2).
- **Slim header** on `/about` + `/cv` — drop the tagline that repeats the page intro
  (`components/Header.tsx`, add `slim?` prop).

## Gotchas discovered
- **PDFs are hand-rendered.** After ANY `.tex` edit, re-render + copy to `public/` or the
  download goes stale. MiKTeX via scoop; command block in resume-reframe-notes.md.
- `paracol` (twocolentry) **splits entries across page breaks** — `needspace` before each entry is
  the fix (already applied in artist-cv.tex).
- **OG / link previews cache hard** (Telegram etc.) — won't reflect the new copy immediately;
  not a bug.
- **Edit `content/*.json`, NOT `data/*.ts`** — the data files are Zod-validating shims.
- **Guardrails (from CLAUDE.md + memory):** don't reframe LAND/NEEEU/To Water/Faceshopping as
  "design engineering" (they're art); keep AI stack vague publicly and **never name Mare's model
  publicly**; pure monochrome (thumbnails are the only color); flag web-researched facts as a
  claims sheet before publishing; run copy through `/humanizer`, model voice on his 2024 entries.

## Next steps (ordered)
1. Get Aakarsh's answers to Open decisions #1–4.
2. Green-light the Queued fixes (esp. NEEEU wording).
3. Execute in `latex-src/*.tex`, `content/cv.json`, `app/cv/page.tsx`, `components/Header.tsx`.
4. **Re-render both PDFs → copy to `public/`** (verify with `pdftoppm` + Read the PNGs).
5. `npm run build` (must be exit 0), commit, fast-forward `main`, push.

## Key files
- `app/about/page.tsx` — bio + verbatim artist statement + contact
- `app/cv/page.tsx` — the /cv page (restructure target, decision #1)
- `content/cv.json` — CV data source of truth (experience, shows, press, etc.)
- `latex-src/resume.tex` — tech résumé PDF source (decisions #2/#3, most queued fixes)
- `latex-src/artist-cv.tex` — artist CV PDF source
- `app/layout.tsx` — site metadata / OG description
- `app/opengraph-image.tsx.disabled` — the disabled OG card (rename back to re-enable)
- `docs/cv-restructure-plan.md`, `docs/resume-reframe-notes.md` — full parked detail
- `components/Header.tsx` — needs `slim?` prop for interior pages
