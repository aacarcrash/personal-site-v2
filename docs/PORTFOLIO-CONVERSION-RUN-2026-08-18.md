# Portfolio conversion — mission run doc (2026-08-18)

State source of truth for the autopilot mission. Sessions resume from THIS
file plus the handoff, never from a transcript. Plan:
`~/.claude/plans/i-think-one-of-squishy-kite.md`.

---

## Mission

Make aakarsh.dev convert for hiring. Clear the April blocking gate (Mare front
and centre), build the applied-AI/interaction-systems craft surface, deepen
case studies, and fix the résumé's machine-readable surface.

## Non-negotiables (never amend without founder sign-off)

1. **Monochrome lock.** No accent colours. Thumbnails are the only colour.
2. **No Mare embellishment.** Facts verbatim from
   `career-ops/mare-tech-summary.md`: closed beta, 100+ creatives, ~10,000
   items, Are.na + Pinterest + Chrome extension, images and links only.
   Never: Firebase, New Inc, heterogeneous media, "8+ platforms".
3. **Never name the model (Qwen)** anywhere public. Infra names (Modal,
   Supabase, pgvector) are fine. Grep before every publish.
4. **Art stays art.** Never reframe LAND, To Water, NEEEU, Faceshopping etc.
   as design engineering. Make their *engineering legible*; do not relabel
   the work.
5. **Never `git push` career-ops.** Origin is santifer's public upstream and
   the folder holds private data. Edit on disk only. personal-site-v2 pushes
   normally. Always `cd` into the repo being committed.
6. **Canonical Mare line:** Co-founder & Product Engineer · January 2026 –
   Present. Any 2024 start date is a factual error.
7. **Voice:** model on his 2024 entries (`nyu-tandon`, `callback`), not the
   2022–23 art voice. Run all copy through the `humanizer` skill. No clipped
   parallel fragments as closers.
8. **Never self-label a level** (not senior, mid, or junior) anywhere.

## Headless safety

- **Headless-safe:** Stream 1 (homepage), Stream 2 (`/lab`), Stream 4a
  (résumé Skills block + padding + overclaims), Intervention D.
- **NOT headless-safe — founder interview required:** Stream 3 (case-study
  writing). Draft questions and skeletons headlessly; never invent facts or
  ship prose about decisions that were not verified with him.
- No `--update-snapshots` to make a visual test pass, ever.

---

## Phase state

| # | Phase | Stream | Status |
|---|---|---|---|
| P0 | Run doc + handoff + autopilot armed | — | DONE |
| P1 | Homepage gate: intro block, credential line, Mare-first ordering | 1 | DONE |
| P2 | Depth badges, metrics row, tools line, `nyu-tandon` tier fix | 1 | DONE |
| P3 | Live/source links, footer résumé link, Product entry point | 1/D | DONE |
| P4 | `/lab` scaffold + semantic-search demo + cluster/axis demos | 2 | NOT STARTED |
| P5 | Résumé: Skills block from `cv-v2-ai.md`, padding, overclaims | 4 | NOT STARTED |
| P6 | Explorations dig — git history + Figma, report what's recoverable | 3 | NOT STARTED |
| P7 | Case-study schema extension + Mare arc (interview-gated) | 3 | BLOCKED |
| P8 | Callback arc, then NEEEU + NYU Tandon | 3 | BLOCKED |
| P9 | Presentation/compositing pass on product shots | E | NOT STARTED |

**Write `.claude/autopilot.done` only when P1–P9 are all complete and
verified.** Interview-gated phases do not block the rest — skip forward.

---

## BLOCKED FOR FOUNDER

1. **Date 0:0 dates.** `career-ops/cv.md` says "August 2025 – Present";
   `POSITIONING.md` timeline says Aug–Dec 2025. Which is true? Conservative
   path until answered: leave `cv.md` untouched on this line.
2. **Callback title.** `cv.md` says "Fullstack Software Engineer";
   the portfolio says "Product Engineer". POSITIONING says past roles use the
   real historical title. Which was it? Conservative path: leave both, flag.
3. **`/ara` de-noindex.** `app/ara/page.tsx` is `robots: { index: false }`.
   It may have been written for one specific company. Do not publish or link
   it without an explicit yes.
4. **Paper sketches.** He says the early paper explorations "kinda look AI
   gen". Must be eyeballed before any of them are published — if they read as
   AI-generated to him, they will to a reviewer. Conservative path: exclude.
5. **Private repos.** (Added cycle 3.) Every *public* repo that matches a
   listed project is already linked, so 20 of 31 projects stay bare for want
   of anything to point at. Two questions only he can answer: may any private
   repo be made public (Mare's is company code, so probably not), and is there
   a recording, festival page or archive entry for the film and live-A/V work
   that should sit on a `liveLink`? Conservative path taken: nothing added,
   nothing invented.

## Amendments log

### 2026-08-18, cycle 2 (P1 evidence + P2)

**P1 was already built by cycle 1 but never banked** — the cycle exited without
touching the phase table, so the table said NOT STARTED while the work sat in
`076562b`. Evidence, re-checked against disk this cycle:

- `components/IntroBlock.tsx` (51 lines) + `app/page.tsx` + 38 lines of
  `app/globals.css`, commit `076562b`.
- Credential line venues all verified present in `content/cv.json` and
  `content/projects.json` (Sydney Opera House, Ars Electronica, Louvre Abu
  Dhabi, Dark Mofo, NYU Abu Dhabi).
- Mare copy matches `career-ops/mare-tech-summary.md` line 169 almost verbatim
  ("closed beta with 100+ creatives ... around 10,000").
- Mare-first ordering already true: `content/featured.json` slugs start `mare`.
- Verified run `.verify/1786996575541`, gate PASS, 2026-08-17T19:56:29Z.

Cycle 1 also left uncommitted work on disk (a real axe fix: `role="combobox"`
on the mobile group selector had no accessible name). Committed as `2b99a8c`.

**P2 decisions taken this cycle:**

- **`nyu-tandon-the-yard` retagged `case-study` → `light`.** It had the tier
  with no `caseStudy` object behind it. Writing the case study is P7/P8 and
  interview-gated, so the honest headless move was to drop the false claim.
  `light` is a depth label, not a domain label, so this does not reframe the
  work (non-negotiable 4 holds).
- **`metrics` added to `ProjectSchema`**, capped at 3 entries. Populated for
  `callback` (25 → 250 WAU in three months; +200% partner activity — both
  already stated in its own `description`) and `mare` (100+ creatives; ~10,000
  items — `mare-tech-summary.md` lines 124–125). No figure was invented.
- **Depth marker**: a 4px dot on the grid tile (tiles are 64×43px, a word does
  not fit), the words CASE STUDY in the hover fill and on the mobile row, and
  in the tile link's `aria-label`.
- Grepped for `Qwen` across `app components content lib latex-src` before
  committing: zero hits.

### 2026-08-18, cycle 3 (P3)

Commit `7f9c97e`. Verified run `.verify/p3`, 18 shots, 3 routes × 6 viewports,
gate PASS (`.verify/last-run.json`), `npm run build` green, `npx tsc --noEmit`
clean, evaluator (opus) PASS on the first round.

**The live/source-link half of P3 produced no code change, and that is the
finding, not a skipped task.** The 20 bare projects were checked against the
full public GitHub account, not guessed at:

- Fetched all 44 repos under `github.com/aacarcrash` from the API. 34 are
  non-forks. Every non-fork was matched by name, description, language and
  push date against the 31 entries in `content/projects.json`.
- **Every public repo that corresponds to a listed project is already linked.**
  The 20 bare projects are films, installations, live A/V sets, residencies
  and teaching programmes. They have no repo because there is no repo, or the
  repo is private (`mare`, `callback` — company code).
- The one near-match, `genesis-vr`, is not a gap: `genesis` already links
  `IntroToIM/tree/main/finalProject`.
- All 12 existing `liveLink`/`sourceCode` URLs were re-checked with curl.
  **All 12 return HTTP 200.** No dead links to fix.
- Founder question added below: which private repos may be made public.

**What did ship:**

- **Linkable list filters.** `FacetedListView` seeds its filter state from the
  query string on mount and writes it back with `history.replaceState` — the
  same call `AxisGrid` settled on, for the same reason (`router.replace` hands
  the page to Next's `ScrollAndFocusHandler`, which resets `scrollTop`).
  Unknown values are dropped rather than kept, so a mistyped link shows the
  full list instead of an empty portfolio. Verified: `?context=Bogus` renders
  all 37 items and cleans itself to `?view=list`.
- **Product entry point.** The intro block's new inline `product` link points
  at `/?view=list&context=Product`. Chosen over the axis grid's `?y=context`
  because list view renders at every width, while the axis grid is replaced by
  `MobileGroupedList` below 821px. Verified in Playwright at 1440 and 375:
  both render "3 of 37 — filtered by Product" with exactly Mare, Mare landing,
  Callback.
- **Résumé in the footer.** New first nav item, `Résumé (PDF)` →
  `/Aakarsh_Singh_Resume_2026.pdf`. Filename re-checked on disk: the file is
  `Aakarsh_Singh_Resume_2026.pdf`, **not** the `Aakarsh_Singh_Resume_090525.pdf`
  that `CLAUDE.md` still names. `app/cv/page.tsx:76` already used the 2026 name,
  so `CLAUDE.md` is the stale one.
- Grepped `Qwen` across `app components content lib latex-src` before
  committing: zero hits.

**Carried forward (evaluator finding, out of P3 scope, not yet a defect
report):** the list-view toolbar search input renders as an empty grey rounded
rectangle in several captures, and its position moves per viewport. Probably
the input mounting mid-capture rather than a layout bug, and it has no
placeholder text when empty. It touches none of the files changed this cycle.
Worth one dedicated look at the list toolbar search placeholder.

### Known gaps and harness caveats (do not re-derive)

1. **The desktop hover "CASE STUDY" chip is NOT visually verified.** `CellFill`
   never mounts under Playwright — `page.mouse.move`, `locator.hover()` and a
   dispatched `mouseover` all failed to grow the fill, headed and headless.
   Confirmed by counting chips in the DOM before and after hover: 3 both times,
   and all 3 are the mobile-list copies. The mobile chip WAS verified exactly
   (11px, uppercase, 0.88px tracking, `#5E5E5E` = `--text-muted`). A future
   cycle should verify the hover chip with claude-in-chrome or by hand.
2. **Home-page captures show the axis grid AND the mobile list stacked at
   desktop widths.** This is a capture-harness artifact — styled-jsx display
   rules are absent in the capture, so `.rg-desktop{display:none}` never
   applies. It is identical in captures taken BEFORE any change this cycle
   (`.verify/1786996575541/home-1440x900.png`), so it is pre-existing and not a
   regression. Do not chase it as a defect; it may still be worth one dedicated
   check that it is only a harness effect.
3. **`capture.mjs --paths=/` breaks under Git Bash.** Path conversion rewrites
   the lone `/` into `C:/Program Files/Git/`, the browser loads a local
   directory listing, and the gate then fails with 16 phantom `ReferenceError`s.
   Prefix the command with `MSYS_NO_PATHCONV=1` and call the script by its full
   Windows path (`~` stops expanding under that flag).
4. Python on this machine defaults to cp1252. Read and write `content/*.json`
   with an explicit `encoding='utf-8'` or the copy appears mojibaked when it is
   not, and a `print()` of a `→` will abort the script before it writes.

**The verify loop earned its keep this cycle.** The evaluator caught a real
shipping blocker: the first `SeparatedList` put the inter-item space inside the
`nowrap` span, so the 9-item stack became one unbreakable run that overprinted
the description column on desktop and clipped off-screen at 375px. Three
evaluator rounds; final state confirmed clean.

---

## Key findings carried in (do not re-derive)

- **Lane order (career-ops POSITIONING.md, amended 2026-08-10):** 1 Applied AI
  / AI Product Engineer · 2 Product Engineer at small/AI startups · 3 FDE /
  Solutions · 4 DevRel · 5 Design Engineer (opportunistic). `/lab` is built
  as an applied-AI + interaction-systems surface for lanes 1–2, not a
  motion-craft playground for lane 5.
- **The April gate** (`career-ops/reports/002-lovable-2026-04-28.md`): "Do not
  apply until aakarsh.dev is redesigned with Mare front and center." Bar as
  written: "clustering UI interactions, micro-animations, dense visual
  collection browsing."
- **`/lab` backlog, pre-verified** (`reports/017-cardboard-2026-08-17.md`):
  no WebGPU, no OPFS/Cache Storage, no Rive/Lottie, no SVG-animation-
  performance evidence, no browser-profiling language in his own words.
- **Who reads the portfolio:** funded companies open it post-triage; seed
  founders screen portfolio-first (`POSITIONING-RELITIGATION.md`). Lanes 1–2
  live at seed, so the portfolio is a primary screen for the main pool.
- **Site inventory:** 3 of 31 projects have a `caseStudy` object;
  `nyu-tandon-the-yard` is tagged `tier: "case-study"` with no data; 20 of 31
  have no `liveLink` and no `sourceCode`.
- **Calibration:** Mare's existing case study already carries more stated
  tradeoffs and more honest outcomes than the competitor portfolios he
  benchmarked against. The gap is narrow: no explorations, outcomes not in
  past tense, product shots raw, credential line buried. Do not relitigate.

## Verification contract

Every UI change runs the `web-verify` skill before its phase is marked done:
`~/.claude/skills/web-verify/scripts/capture.mjs` from the repo root against a
dev server on 127.0.0.1 → `gate.mjs` → `evaluator` (opus) judging against
`design.md`. No phase is completed without a fresh `.verify/last-run.json`.
`npm run build` must stay green — `data/*.ts` Zod-validates `content/*.json`
at module load, so a schema change that content does not satisfy fails the
build. That is the intended safety net, not an obstacle to route around.

## Session contract (or autopilot loops uselessly)

Before exiting ANY session: run doc + handoff updated, everything committed
(and pushed, personal-site-v2 only), phase table statuses accurate. Founder-
only decisions go to BLOCKED FOR FOUNDER above and the session takes the
conservative continuable path. Done-file only at true completion.
