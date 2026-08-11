# Handoff — Sheet U cleanup + open queue

Rewritten 2026-08-12. Branch `review/all`. Read with `CLAUDE.md` and
`AGENTS.md`.

**Read `AGENTS.md` first.** This is Next.js 16 — read
`node_modules/next/dist/docs/` before writing framework code.

**Two rules that governed this session and should govern the next:**

1. **Every request goes into the Task tools on arrival** (`CLAUDE.md` HARD
   RULE), before work starts, so the queue renders in the user's terminal.
2. **Mock in Paper before coding anything visual.** Set explicitly after I
   coded a spacing change he had asked to see mocked first. Design decisions
   are his; my job is to show options with real values and name the tradeoff.

---

## 1. What shipped this session

All verified in-browser and gated. Commits `7b17b01` … `a7d9b9a`.

### Search
Merged the stranded worktree. `lib/searchIndex.ts` never imported `shows`
from `cv.ts`, so "Sydney" existed nowhere in the corpus. Keyword tier
**5/9 → 9/9**, corpus 77 items. Kept main's underline match-highlight — the
worktree's version still used `fontWeight: 600`, which renders as nothing
under `font-synthesis: none`.

### Type + colour
- Four-tier grey scale had collapsed to three (`--text-secondary` #555555 sat
  9 hex from `--text-muted` #5E5E5E). Secondary → **#444444**, new
  **`--text-disabled`**, and every token now carries a **role and a minimum
  size** in `globals.css`. `--text-subtle` is **never text** — the only
  remaining uses are `·` and `/` separator glyphs.
- 13 dead `fontWeight: 500` and 6 dead `fontStyle: italic` removed. Captions
  had used italic as their ONLY separator from body copy, so they were
  silently body copy — re-encoded as a family change (`.caption`, mono).
- Sub-floor sizes raised: a 7px badge, an 8.5px label, three 9px labels.
- One `.rule` hairline, one `.link-underline` (offset had drifted across 2px,
  3px and unset over 13 call sites), one `.eyebrow`.

### Controls
- **Four** hand-rolled copies of the same segmented control collapsed into one
  generic `components/Picker.tsx` (grid Y, grid X, cluster "cluster by", list
  sort). Selected = `[ brackets ]` + `--surface`, no outline. Disabled = dashed
  outline, because it means "already on the other axis", not "broken".
- View bar: glass only (`?bar=ink` removed), and the selected pill got a
  **contrast floor** — it had no background of its own, so contrast moved with
  the page and hit 4.2:1 over blank gutter.
- Keys: **←/→ switch view globally** (safe — they scroll horizontally and this
  page has none). **W/S and A/D move the axes.** The old code captured all four
  arrows on `window`, which stole arrow-key page scrolling and collided with
  the bar.
- Key hints are **tooltips on hover**, matching between the bar and the
  pickers. See §4 for why in-row keycaps failed.

### Pages
- `/cv` rebuilt as the dated rail: 200px mono rail, three steps of hierarchy
  (title 24 display > company 16 sans > rail 13 mono), centred 1080 column,
  compact display dates via a formatter that leaves `cv.json` long-form.
- Grid cluster tiles are a **deck stack** — two ghosts offset +4/+8 down-right,
  digit badge gone. The count was already spoken in the hover caption.
- `design.md` rewritten: it still named Instrument Serif / Inter / JetBrains
  Mono, the old `--text-muted`, a 6-step scale, and "Active: weight 700".

---

## 2. Open queue

### Decided, not built
**Grid cells waste 46% of their width.** Measured at 1440: cell inner 148px,
tile hardcoded 80px, `justifyContent: normal` — so one tile fits per row and
68px of leftover stacks entirely on the right (left gap 10px, right gap 78px).
That is both the "uneven padding" and the "doesn't use the grid" complaint.

**Do not hardcode 2-per-row.** Cell width varies with the number of X values,
so a fixed count shrinks tiles in narrow configs and stretches them in wide
ones. Use the pattern `MediaGallery.tsx` already has: a **target width**, with
`perRow = floor((inner + gap) / (target + gap))`, tiles then growing to fill
exactly. Board: **"Grid cell · fixed 80px tile vs filling the column"**.

### Not started
- **Task 12** — favicon, `app/icon.svg`, `opengraph-image`, `twitter-image` in
  Aujournuit. **Check the wordmark at 16px** — a high-contrast display serif
  can disintegrate.
- **Task 17** — `/about` variants in Paper. The statement stacks **three**
  emphasis signals at once (1.5× size jump, family change, left rule), so it
  reads as a second headline. Most fixes remove signals rather than tune them.
  His least favourite page; open to full layout changes.
- **Cluster picker consistency** — now uses the shared `Picker`, but the
  cluster page itself is under a standing "do not change without asking".
- **ViewBar overlaps the cluster plot** — it is fixed bottom-centre over the
  canvas, covering nodes and crowding the `WORLDBUILDING` label.

### Shelved deliberately
- **Adjacent work** — everything banked in `docs/adjacent-work-shelved.md`:
  audit numbers, a 31-project shortlist with a reason per pairing, the
  rejected candidates, and the settled design directions. Live outcome is just
  two `See also` pairs: `mare ↔ mare-landing` and `land ↔ latent-space`.
  **First task when it comes off the shelf:** `relatedSlugs` is `string[]`, so
  reasons and scores need a schema change to `{ slug, reason, score }` in
  `data/types.ts` and the Zod schema.
- **⌘K** — staying as it ships. Four boards exist; nothing was built.

---

## 3. Decisions he made this session

- Grid is the default view (changed to list, then back).
- Featured strip is 4-up; titles nowrap with ellipsis to hold the baseline.
- Byline/controls spacing **64 above / 36 below**, controls at `--step-meta`.
- Picker selected state: bracketed chip, **no outline**.
- Disabled option: dashed outline, **no "on X" label**.
- `/ara` stays public — already shared with the Ara people.
- `scaleY(1.05)` stays. Verified at 375/390 across pages; the feared overpaint
  does not show.
- Scores would be shown on adjacent work, labelled **"cosine similarity"** in
  full, if it ships.

---

## 4. Things that cost time — read before repeating them

- **A keycap cannot read as a key on this site by styling alone.** The
  convention needs mono type + a border + a shadow + a verb. Mono is the whole
  UI, hairlines are on every chip, and shadows are banned by `design.md` — so
  three of the four signals were already spent. The fix was a tooltip with a
  verb, which is also what the shortcut literature recommends.
- **`overflow-wrap: anywhere` also collapses min-content width to one
  character.** It let flex squeeze mobile row titles to nothing, so long names
  rendered one letter per line. Use `break-word`.
- **A focus ring on a button next to an animated pill separates mid-flight.**
  The ring moves instantly, the pill takes 0.32s. Draw the ring on the pill and
  use a roving tabindex so focus and selection cannot diverge.
- **`:focus-within` never releases after a mouse click.** Use `:focus-visible`.
- **Vimeo embeds 401 on localhost by design** (domain-restricted). They play
  fine on the real domain. Allowlisted in `.verify.config.json` — do not
  "fix" them.
- **Never build regex or escapes through a Python heredoc.** `\b` became a
  literal backspace inside a shipped regex. Use the Edit tool for anything with
  backslashes.
- Stale `.next` produces a hard 500 on `/projects/[slug]`. Stop dev, delete
  `.next`, rebuild. **Never `rm -rf` a directory holding a Windows junction.**
- `capture.mjs` needs `MSYS2_ARG_CONV_EXCL='--paths'`.

---

## 5. Verification

```bash
MSYS2_ARG_CONV_EXCL='--paths' node ~/.claude/skills/web-verify/scripts/capture.mjs \
  http://127.0.0.1:3000 "--paths=/,/cv,/about,/projects/land"
node ~/.claude/skills/web-verify/scripts/gate.mjs
```

Gate is **PASS**. `npm run build` clean. `npm run search:test` 9/9.

**The gate is not enough on its own.** Three regressions this session
(unreachable grid view, a permanently-stuck hint, one-letter-per-line titles)
all passed the gate and were caught by the user. Drive the actual UI —
Playwright clicking and pressing keys — before reporting frontend work done.

---

## 6. Uncommitted, not mine

Another session has in-flight work in the tree: `FeaturedStrip` (4-up),
`HeaderSearchTrigger`, `MareCaseStudy`, `MediaCarousel`, `MediaGallery`,
`MobileGroupedList` (a `<select>` → custom listbox rewrite), `ViewBar`
proximity reveal, radius tokens in `globals.css`, `content/featured.json`.
Leave them alone; commit only your own files by name. I swept two of these
into a commit by accident and had to split it back out.

The search worktree `.claude/worktrees/agent-a123394c1ac027326` is still on
disk. Everything is extracted and committed; it can be removed.
