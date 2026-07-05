# Session handoff — 2026-07-05

Written because the session ran long and context is degraded. This captures repo
state, the open task backlog, and — most importantly — the hard-won context on the
**Mare case-study layout** so the next session doesn't re-thrash it.

---

## 1. Repo / git state

- **Committed & pushed to `main`:** `cc65023` (`site: masonry gallery, copy/CV pass,
footer + docs`). This is safe/deployed-ready. Repo is **private** (`aacarcrash/personal-site-v2`).
- **Working branch: `mare-justified-decisions`** — has all the Mare case-study
  layout work, **uncommitted**. Decide: commit it, or `git checkout main` to discard.
  Uncommitted files:
  - `components/CaseStudy.tsx` — the decisions layout (see §3)
  - `app/globals.css` — `.cs-fullrow`, `.cs-jrow`, `.cs-fullrow-text` etc.
  - `content/projects.json` — Mare decisions now carry `ar` + `images[]`; caption em-dashes fixed
  - `data/types.ts` — added `ar` + `images[]` to `CaseStudyDecisionSchema`; **user also added `mediaColumns`** to ProjectSchema (leave it)
  - `components/MediaGallery.tsx` — **user added `maxCols` prop** (leave it)
  - `app/projects/[slug]/page.tsx`, `docs/ASSETS-NEEDED.md` — user edits (leave)
  - untracked: `public/images/mare/import-platforms.png`, `import-arena.png`, `public/images/mare-landing/` (user)

**Dev server** runs via `npm run admin` (`next dev -H 127.0.0.1`, port 3000). Was
running in background all session.

**Screenshot tooling:** Playwright is a devDependency (`npx playwright install chromium`
done). To screenshot, write a `.mjs` in the **project root** (not scratchpad — ESM
can't resolve `playwright` from scratchpad), run `node _shot.mjs <out.png>`, then delete
it. Scroll the page to bottom + back to top before shooting or lazy `next/image` tiles
capture as black (this is why the Are.na "arena" image looked black in my shots — **it
renders fine live**, confirmed by the user; don't "fix" it).

---

## 2. Task backlog

Tasks the user was tracking (via TaskCreate). Status as of handoff:

| #   | Task                                                                                            | Status      | Notes                                                                                                                                                                                                                           |
| --- | ----------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Cluster-view: Jameel node flung to bottom                                                       | **pending** | force-layout positioning; find the cluster/Venn component (uses d3-force/d3-polygon)                                                                                                                                            |
| 2   | Cluster-view: non-member nodes (Yeule game, Faceshopping) render inside a cluster + unclickable | **pending** | same component; likely z-index/pointer-events or layout placing non-members over the circle                                                                                                                                     |
| 3   | Decide: demote Yeule game to a sketch (THINK-ONLY)                                              | **pending** | it's old; evaluate moving from full project → a sketch cluster                                                                                                                                                                  |
| 4   | Insert Dark Mofo scale copy (no USD)                                                            | **pending** | copy already drafted + approved (below); just paste into `content/projects.json` dark-mofo body                                                                                                                                 |
| 5   | Image-treatment mockups                                                                         | **done**    | artifact made                                                                                                                                                                                                                   |
| 6   | Favicon (`app/icon.svg` monogram)                                                               | **pending** | replace default Vercel favicon; monochrome serif "A"/"as", theme-adaptive                                                                                                                                                       |
| 7   | Commit session changes                                                                          | **done**    | `cc65023`                                                                                                                                                                                                                       |
| 8   | Cluster-view: labels ambiguous (which circle is which)                                          | **pending** | same component as #1/#2 — **do #1/#2/#8 together**                                                                                                                                                                              |
| 9   | Mare justified layout prototype                                                                 | **done**    | on the branch                                                                                                                                                                                                                   |
| 10  | Mare polish: enrichment + high-res crops                                                        | **pending** | see §3; also `lenses.jpg` (839px) / `soft-membership.jpg` (728px) are soft — re-crop from the high-res **originals** in `assets/Mare/` (`full.png`, `itemDesc - use for soft clustering.png`) matching the current crop framing |

**Cluster-view bugs (#1, #2, #8) are the same component — fix together.** Find it via
the "cluster" view toggle on the homepage (`view grid list cluster`).

---

## 3. Mare case-study layout — READ BEFORE TOUCHING

This is what I thrashed on. The **"Six decisions inside Mare"** case study
(`content/projects.json`, `caseStudy.decisions`) renders via `components/CaseStudy.tsx`
→ `CaseStudyDecisions`. Rows are grouped by `span` sum ≤ 12.

**Three row types** (in `CaseStudyDecisions`, the `rows.map`):

1. **Multi-image full-width** (`row.length===1 && images?.length`) — the **import**
   decision. 3 images (`import-platforms` 1.28, `import-boards` 0.88, `import-arena` 0.80)
   in a justified strip (`.cs-jrow`, flex-grow = `--ar`), text beside in `.cs-fullrow-text`.
2. **Single-image full-width** (`row.length===1 && ar && image`) — the **enrichment**
   decision (`item-enrichment.jpg`, ar **2.04**, a wide panorama). Image beside text.
3. **Justified pair** (`row.every(ar && image)`) — lenses+soft, hierarchy+infra. Two
   images capped at `maxWidth: 62ch` so their right edge lands with the text.

**Layout rules I learned (the user's actual preferences — honor these):**

- `.cs-fullrow`: `display:flex; align-items:center; justify-content:space-between`.
  **`space-between` is load-bearing** — it keeps text flush-left and image flush-right so
  every row's edges align. Do NOT use `center` (indents row 2 → edges stop aligning, the
  user's last complaint) or `flex-start`.
- `.cs-fullrow-text { flex: 0 1 36ch }` — **narrow, non-growing**. Narrow text so the
  IMAGES get the reclaimed width. Do NOT give it `flex:1` + `max-width` (that reserves a
  wide column and leaves dead whitespace to the right of the capped text — the user's
  "we don't need whitespace, images bigger" complaint).
- **Import media** `flex: 1 1 0` (fills width; images big). It's not too tall so filling is fine.
- **Enrichment media** `flex: 0 1 50rem` (**capped**, does NOT grow). If it fills width it
  gets tall → text can't fill that height → whitespace returns (the user explicitly warned
  about this). Capped width + `space-between` = editorial spread with a middle gap.
- **The one open aesthetic question:** row 2 (enrichment) has a **gap between the narrow
  text and the capped image**. Edges align (good) but the middle gap is wide. Options the
  user is weighing: (a) bump enrichment media 50→58rem (smaller gap, slightly taller image),
  or (b) make enrichment **full-width with text above** (panoramas prefer full width, kills
  the gap). Left at 50rem. **Ask the user which before changing.**
- Mobile: `.cs-fullrow`/`--flip` stack to column at ≤820px. Verified working.
- `.cs-fullrow--flip` (row-reverse) alternates the side per row (`ri % 2`): import text-right,
  enrichment text-left. Zigplzag/serpentine.

**Image sizing is a MATH problem — never upscale:** display width ≤ native width (downscale
= sharp, upscale = blur). Every Mare decision image has `ar` (width/height). Native dims:
import-platforms 641×499, import-boards 636×722, import-arena **257×320 (the small one)**,
item-enrichment 1600×785, lenses 839×524, soft-membership 728×450, hierarchy 1262×817,
infra 1400×880.

**Do not re-run big multi-variable changes.** The user got (rightly) frustrated when I
changed align + text + media + dropped arena all at once. Change ONE variable, screenshot,
confirm.

---

## 4. Git identity / GitHub green squares (from §diagnosis)

User wants past + future commits to count under **aacarcrash**.

- **Done:** global git identity set to `Aakarsh Singh <as15037@nyu.edu>` (their real,
  account-linked email). Pinned credential helper to aacarcrash (`git config --global
credential.https://github.com.username aacarcrash`) to stop the account-picker popup.
- **User still needs to do (no code):**
  1. **Enable "Include private contributions on my profile"** in GitHub → Settings → Profile.
     This is almost certainly why the graph looks empty (repo is private).
  2. Verify `as15037@nyu.edu` is a verified email on the aacarcrash account.
  3. Optionally add `aakarsh@nyu.edu` too — **9 early commits used it** (a fake/unregistered
     email, so they currently count for nobody). Or rewrite those 9 commits' author + force-push
     (per-repo, destructive-but-fine-for-private-solo) to recover them.
- Global config affects **future commits, all repos**. It does **NOT** re-attribute past
  commits — that needs either the verified-email trick (universal, no rewrite) or a per-repo
  history rewrite.

---

## 5. Approved Dark Mofo copy (task #4 — ready to paste)

Replace the dark-mofo decision body in `content/projects.json` with (user approved the
numbers, wants **no USD figure**):

> Live visuals for _Night Mass: Dead End_, the after-dark stage of Dark Mofo in Hobart,
> Tasmania (11–22 June 2026). Dark Mofo is MONA's winter festival and one of Australia's
> largest — recent editions have drawn over 45,000 interstate visitors and more than 100,000
> ticketed entries. Night Mass is its late-night takeover of the city. I VJ'd four nights
> across the two weekends it ran, behind a lineup that included Kavari, DJ Love, EQ, and Skin
> on Skin, driving the room's visuals across 14 screens in TouchDesigner, Unreal Engine, and
> Resolume.

(Numbers are 2023-sourced festival scale — Wikipedia + smartcompany. The current body already
has everything except the scale sentence.)

---

## 6. Conventions / gotchas learned this session

- **`content/*.json` is the source of truth** for all copy; `data/*.ts` are Zod shims. Edit content/.
- After editing `content/*.json`, validate: `node -e "JSON.parse(require('fs').readFileSync('content/projects.json','utf8'))"`.
- **Em-dash policy** (user cares a lot): keep structural dashes (dates, `Work — Artist` labels,
  résumé results); rewrite prose/caption dashes. When swapping, check the replacement isn't
  worse (comma-collision → use parens; elaboration → colon). Rule is codified in the humanizer
  skill's §14.
- **Never name Mare's model (Qwen) publicly.** Infra names (Modal/Supabase/pgvector) are fine.
- **`assets/` is gitignored raw source**; optimized copies live in `public/images/`. Bundle-in
  pipeline: resize ≤1920 + optimize (PIL) → `public/images/<slug>/` → reference in content.
- Padding on `.project-main` is now fluid: `clamp(64px, 7vw, 180px)` (scales on XL).
- Selection highlight softened to a translucent tint (`app/globals.css`).
