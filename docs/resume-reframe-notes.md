# Tech résumé reframe — parked for tomorrow

**Status:** discussion parked (user tired, 2026-07-06 night). Nothing below is done
yet. This is the pickup list. File: `latex-src/resume.tex` (→ PDF).

## The question we were on

"How much of the *Selected Projects & Presentations* section does a tech recruiter
actually care about?" Honest read:

- **The engineering inside the projects = a lot** (esp. for AI/creative-tool and
  design-eng roles). "Built a video pipeline conditioning diffusion models on
  depth, optical flow, and attention" is probably the single most differentiated
  line on the résumé.
- **Festival/exhibition names = almost nothing** to a tech recruiter. "screened at
  Ars Electronica" reads as mild "huh, interesting" at best.
- **The "Exhibitions & performances:" list line = ~zero** for tech. That's the
  artist CV's job.

The problem isn't the content, it's the **framing**: it's written in art voice
("Unreal Engine **Film**", "screened at…") on a tech résumé, so a skimming
recruiter misses the actual engineering. Fix = re-aim engineering-first, don't
delete.

**User's clarification:** the résumé's project entries are **repurposed from
existing project entries** — so this is rewording, not writing new content.

## Pending decisions / tasks for tomorrow

1. **Art-trim level (UNDECIDED — needs user call):** trim to the two
   engineering-heavy projects + one compressed exhibitions line, OR keep a fuller
   art presence because he's specifically chasing creative-tech roles.
2. **Reframe the two film headlines engineering-first** — lead with the
   system/pipeline, demote "film" + festival to a short credibility tag.
3. **Reorder Selected Projects reverse-chronological.** Currently out of order:
   LAND (Nov 2024–Apr 2025) → latent-space (May 2026) → AA (July 2025). Should be
   **latent-space (May 2026) → AA (July 2025) → LAND (Nov 2024–Apr 2025).**
4. **NEEEU bullet** — replace the vague "20% increase in customer engagement"
   (weakest line; identical in the previous résumé, so nothing better to pull).
   Proposed replacement (concrete, no fake metric):
   > Built and shipped an AR filter for a BMW × Fischersund magazine campaign in
   > Meta Spark Studio, faking volumetric 3D under a tight filter memory budget
   > with custom rotation-tracking billboard and refraction shaders.
   Lives in `resume.tex` (~line 249) and `content/cv.json` (NEEEU experience,
   line ~74). resume.reference.tex has the same old bullet if syncing.
5. **Fix LAND outlink** in `resume.tex` (~line 276): `aakarsh.dev/work/LAND` →
   `aakarsh.dev/projects/land` (wrong path + case; site uses `/projects/[slug]`).
6. **Résumé section-header spacing** (user's earlier image): wants more breathing
   room under the section rules; the one-page résumé has headroom at the bottom.
   Adjust `\titlespacing*{\section}{0pt}{1em}{0.5em}` — bump the trailing (after-
   rule) value; watch it stays 1 page.

## Already DONE tonight (don't redo)

- Email → `aakarsh@nyu.edu` everywhere (`resume.tex` was the last holdout).
- Magzoid cut from `cv.json`, `artist-cv.tex`, `artist-cv.reference.tex` (verified
  low-prestige, pay-to-feature, and a WAM repost).
- Press links added to `cv.json` (Dazed, e-flux, Khaleej Times, WAM); Dazed date
  fixed to May 14; stale WAM + Khaleej URLs refreshed in `artist-cv.tex`.
- Artist CV 3-page bad break FIXED: added `\usepackage{needspace}` +
  `\needspace{4\baselineskip}` in the `twocolentry` env (stops paracol splitting
  an entry across a page), and reduced the anomalous `\vspace{1 cm}` before
  Teaching → `0.2 cm`. Now a clean **2 pages**.
- Both PDFs re-rendered and copied into `public/`.

## Re-render command (after any .tex edit)

```bash
BUILD=<scratch>/lx
pdflatex -interaction=nonstopmode -output-directory="$BUILD" latex-src/resume.tex
pdflatex -interaction=nonstopmode -output-directory="$BUILD" latex-src/artist-cv.tex
cp "$BUILD/resume.pdf"    public/Aakarsh_Singh_Resume_2026.pdf
cp "$BUILD/artist-cv.pdf" public/Aakarsh_Singh_Artist_CV.pdf
```
(pdflatex = MiKTeX via scoop; `pdftoppm -png` to rasterize for visual check.)
