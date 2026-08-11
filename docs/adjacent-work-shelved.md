# Adjacent work — SHELVED, not abandoned

**Status: parked 2026-08-12.** Nothing here is live. The research, the
shortlist and the design directions are banked so the decision can be made
later without redoing any of it. This file travels to `main` with the rest of
the branch.

What IS live: `relatedSlugs` renders as an inline `See also:` line at the top
of the prose column on a project page. Two pairs are set — `mare ↔
mare-landing`, and `land ↔ latent-space`.

---

## 1. The two things that kept getting confused

They are not the same feature, and conflating them is what stalled this.

| | What it is | State |
|---|---|---|
| **See also** | `relatedSlugs`, a manual field set by hand. Inline line in the sidebar column. | **Live.** 4 of 31 projects |
| **Adjacent work** | A proposed page-footer section, embedding-driven, showing a reason and a similarity score per pairing | **Never built.** Board on Paper page 1: *"Idea 5 — Adjacent Work (project page footer)"* |

The proposal below is neither cleanly: it is **manual pairs drafted with the
embeddings as a tool**. The audit generates candidates; a human rejects most
on evidence. That distinction is the whole point — see §4.

---

## 2. Audit state (re-run 2026-08-12, post-search-merge corpus)

`node scripts/adjacent-audit.mjs 3`

- 31 / 31 projects have vectors, model `@cf/baai/bge-m3`
- Median neighbour similarity **0.615**
- Projects whose best neighbour is under 0.50: **0**
- Hub distribution, far flatter than the previous run: LAND 8 of 93 candidate
  slots, `latent-space` 7, Genesis 6, Abandoned Hotels 6
- The previously-flagged bad pairing `Date 0:0 → aloegarten` is **gone**

**Re-run this after any change to the embedding corpus.** Every number moves.

---

## 3. The curated shortlist

Two is the maximum per project. Zero is a valid answer — better empty than
wrong. Every reason traces to a field in `content/projects.json`.

| slug | related | reason |
|---|---|---|
| `mare` | `mare-landing`, `callback` | same product · same role and Next.js/TS + Cloud Run + Stripe stack |
| `mare-landing` | `mare` | same product |
| `date-0-0` | `land` | both rebuild a contested border landscape from site data. **One-way on purpose — Date 0:0 is incomplete, so LAND must not point back at it** |
| `aa-warsaw` | `aa-dubai` | same AA Visiting School series, 2025 |
| `aa-dubai` | `aa-warsaw`, `spoon-spade-shovel` | same series · both live A/V built in TouchDesigner + Ableton from material gathered on site |
| `dark-mofo` | `mutek-ae` | live A/V sets for electronic-music festivals, visuals from TouchDesigner |
| `latent-space` | `land`, `fat32-loss-protocol` | states it reworks LAND footage · both degrade his own childhood footage as method |
| `land` | `latent-space`, `abandoned-hotels-of-zangsti` | direct rework of this film's footage · shared photogrammetry + mocap into Unreal / Niagara |
| `callback` | `mare` | same role and stack |
| `nyu-tandon-the-yard` | `land` | shared photogrammetry, motion capture, Unreal + Niagara |
| `neeeu` | `faceshopping` | both Meta Spark filters faking volume inside the platform's filter memory budget |
| `to-water-a-dying-garden` | `communication-plateau`, `fat32-loss-protocol` | TouchDesigner point-cloud installations on live sensors · both 2023, Arduino as the only control surface |
| `fat32-loss-protocol` | `to-water-a-dying-garden`, `latent-space` | Arduino → TouchDesigner, physical action as input · both degrade his own childhood footage |
| `synapse` | `in-loving-memory-of` | both late-2023 live A/V performances of his own track |
| `abandoned-hotels-of-zangsti` | `in-loving-memory-of`, `land` | both autumn-2023 Unreal + Niagara pieces built to a music track · shared toolchain |
| `in-loving-memory-of` | `abandoned-hotels-of-zangsti`, `synapse` | shared Unreal + Niagara, same months · both live A/V of his own material |
| `pxe` | `aloegarten`, `is-it-cold-in-the-water` | both built on Ecco2k · both Maya + Arnold films to a track, Oct–Dec 2023 |
| `is-it-cold-in-the-water` | `faceshopping`, `pxe` | both built on SOPHIE · both Maya + Arnold films to a track |
| `faceshopping` | `neeeu`, `is-it-cold-in-the-water` | both Meta Spark shader workarounds · both built on SOPHIE |
| `aloegarten` | `pxe` | both built on Ecco2k |
| `real-art` | `displacement-map` | both take canonical museum artworks as raw material and question the institutional frame |
| `cryoponics` | `displacement-map` | both 2023 standalone 3D render series |
| `camjam` | `genesis` | both 2022 browser music experiences with custom real-time input over WebSockets |
| `genesis` | `camjam`, `glitch-princess` | WebSockets + custom input, 2022 · same `aacarcrash/IntroToIM` repo |
| `displacement-map` | `cryoponics`, `real-art` | both 2023 independent 3D render series · both work over existing artworks |
| `communication-plateau` | `to-water-a-dying-garden` | TouchDesigner point-cloud installations on live sensors |
| `glitch-princess` | `genesis` | same `IntroToIM` repo, 2022, both audio-reactive web pieces set to a track |
| `mutek-ae` | `dark-mofo`, `spoon-spade-shovel` | Alserkal Avenue Dubai TD + Ableton live sets |
| `spoon-spade-shovel` | `mutek-ae`, `aa-dubai` | Dubai TD + Ableton live sets · both built from material gathered on site |
| `electronicos-fantasticos` | *(none)* | no shared tool, venue, series or collaborator with anything else |
| `komposition` | *(none)* | only link is "Unity + AR"; no shared subject, venue or series |

**Asymmetry is free and intended.** `relatedSlugs` is a per-project array with
no reciprocity enforcement, so A can point at B without B pointing back. That
is exactly what `date-0-0 → land` needs.

---

## 4. Rejected candidates — the most valuable part

Pairings a naive similarity cut would have shipped:

| pair (score) | why rejected |
|---|---|
| `"Real" Art ↔ LAND` (0.60), `↔ latent-space` (0.60) | the only overlap is the word "AI". A DALL·E museum quiz is not related to a custom LoRA film |
| `Komposition ↔ NEEEU` (0.60) | pure "AR/Unity" vocabulary. One is a brand filter, one is a German-compound-word toy |
| `Callback ↔ "Real" Art` (0.55) | Next.js + Firebase coincidence, and it would frame a Louvre installation as product work |
| `Mare — Landing ↔ Genesis` (0.61), `CamJam ↔ Mare — Landing` (0.58) | "particles / spiral / browser" across a 2022 student piece and a 2026 product page |
| `Dark Mofo ↔ latent-space` (0.60) | both 2026, both involve screens. No shared venue, tool or material |
| `Dark Mofo ↔ NYU Tandon` (0.59) | "Unreal Engine" appears in both. Nothing else |
| `PXE ↔ Faceshopping` (0.62) | different musicians, different media; similarity is hyperpop-adjacent language |
| `Is It Cold ↔ Cryoponics` (0.64) | "organic matter / fluid / dissolution" vocabulary, unrelated subjects |
| `Synapse ↔ Genesis` (0.64) | both say "particles" and "tunnels". Different years, engines, contexts |
| `Date 0:0 ↔ AA Warsaw` (0.62) | a commissioned XR artwork vs a teaching programme |
| `Communication Plateau ↔ AA Dubai` (0.62) | TouchDesigner + sound, no shared venue, year or series |
| `aloegarten ↔ latent-space` (0.62) | shared themes wording only |
| `Glitch Princess ↔ Synapse / CamJam` (0.53) | weakest tail; only "p5 / game / audio" |

**This is the argument for keeping the field manual.** A purely computed
section would have shipped `"Real" Art ↔ LAND` because both mention AI.

### On the hub cap

An earlier draft capped how often a project could appear elsewhere at 3, and
that rule was wrong — it vetoed `land ↔ abandoned-hotels`, the audit's single
highest pair at 0.72, on a quota rather than on evidence. **A cap is a
judgement about candidate noise, not about a specific pairing.** The real hub
signal was LAND sitting in 8 of 93 *candidate* slots; four *justified*
appearances out of 31 projects is not a hub.

---

## 5. Design directions (Paper, page 1)

Boards, in the order they were made:

- **"Related work · display options (with / without scores)"** — inline (what
  ships) / rows with reasons / rows with scores
- **"Adjacent work in page flow · project page (desktop 1440)"** — the whole
  LAND page, showing the section after MEDIA and before the footer
- **"Adjacent work in the side rail · 280px (real width)"** — four variants:
  rail without thumbnails, end-of-page typographic rows, end-of-page rows with
  thumbnails, rail with thumbnails

### What was settled before parking

- **Placement: end of page**, after MEDIA. By then the reader has finished the
  work, so "where next" is the right question. The current `See also` asks it
  at the *top* of the prose, before anything has been read.
- **Do not mirror the media grid.** A 3-up card grid under a 3-up media grid
  ends the page with the same object twice. Keep thumbnails — they are what
  make it a place you want to go — but change the SHAPE: media is a grid of
  large stills, adjacent work is a row of small ones, the 80×54 tile the list
  view already uses.
- **Scores shown**, ordered by score so the number is consistent with the
  sequence. Label them **"cosine similarity"** in full — "cosine" alone means
  nothing to a reader.
- **One system, not two.** Fill `relatedSlugs`, relabel the section "Adjacent
  work", drop the separate computed-footer idea. Embeddings stay a drafting
  tool, never the live source.

### The blocker that remains

The reasons and scores have nowhere to live. `relatedSlugs` is `string[]`
today, so shipping this needs a schema change to `{ slug, reason, score }` in
`data/types.ts` and the matching Zod schema. That is the first task when this
comes off the shelf.
