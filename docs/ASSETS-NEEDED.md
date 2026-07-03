# Assets & info still needed — site backfill tracker

Single source of truth for everything I need from you. Check items off (`- [x]`) and add a
note as you send them; I'll wire them in and strike them through on my side. Nothing here
blocks the site — every gap currently shows a clean placeholder.

> **Wired 2026-07-04:** Project media now renders as a masonry gallery (all media at
> once, click for lightbox), not the old carousel. All dropped folders wired into
> `public/images/`: **aa-dubai** (6 process stills each linked to their moment in the
> AAVS video `pQ794NRBrF0`, + full video + 2 photos), **date-0-0** (renders + satellite),
> **aa-warsaw**, **mutek-ae** (3 photos + 4 clips), **spoon-spade-shovel** (2 photos + 5
> clips + SoundCloud), **latent-space** (cover + 9 stills + 5 clips), **dark-mofo** (1 photo).
> Copy enriched from event sources (flagged + approved). Two corrections: AAVS date was
> the app deadline → now **May 2025**; the Jameel piece is **"Synthesizing Landscapes"**
> within the **"Spoon Spade Shovel"** Takeover (kept card venue-framed).
> **Still open:** a one-line description of what *Synthesizing Landscapes* does; more
> Dark Mofo visuals if you have them.

## How to hand off media
- **Folder:** drop files in `public/images/<project-id>/` (exact id listed per item). Make the
  folder if it doesn't exist.
- **Naming:** name the strongest landscape image **`thumb.jpg`** (becomes the grid thumbnail);
  name the rest `1.jpg`, `2.jpg`, … (that's the carousel order).
- **Images:** JPG/PNG, landscape where possible, ideally ≥1600px wide. Don't pre-compress —
  the `optimize-images.py` pass handles that.
- **Video:** easiest is a **link** (YouTube/Vimeo/IG) — just paste it under the item. Local file
  is fine too: `.mp4` (H.264, ≤1080p) named `1.mp4`; I'll compress + generate a poster.
- **Text/info:** type it right under the item.

---

## Priority 1 — Mare (featured) · `public/images/mare/`
Reframed case study = 3 pillars (**Ingest → Understand → Organize**) + infra.

**Stills — RECEIVED ✅** (in `assets/Mare/` — I'll optimize + move to `public/images/mare/` + wire to each card once the copy is locked):
- [x] Hero / Collections + Unclustered rail — `full.png`
- [x] Ingest — `Import1.png` (platform modal), `import2.png` (Pinterest boards); extension `mare button on arena.png` *(rough — optional cleaner recapture)*
- [x] Understand (enrichment) — `itemDesc2.png` (beauty shot), `itemDesc - use for soft clustering.png`
- [x] Three lenses — `mode switcher.png` (+ tabs in `full.png`)
- [x] Hierarchy / sub-collections — `collection expaned-open.png`, `hierarchy.png`
- [x] Soft membership — `itemDesc - use for soft clustering.png`

**Videos — worth recording (two, different jobs):**
- [ ] **Site:** short *silent, looping* screen-capture of the reclustering (switch Balanced→Aesthetic→Semantic, watch it regroup) — the one thing stills can't show; muted autoplay, on-brand
- [ ] **Cold email:** *narrated* 60–90s walkthrough (script in `job-search/cold-emails.md`)

**Infra** — *diagrams I generate as monochrome SVG; no files from you, just sanity-check*
- Before → after migration diagram (always-on Celery + Redis → Cloud Tasks + scale-to-zero worker)
- System-topology diagram — for the "How it works" section

## Priority 2 — empty project cards
Each needs **1 `thumb.jpg` + 3–6 stills/clips**.
- [x] **Dark Mofo** · `dark-mofo/` — wired 1 photo + copy from festival sources (4 nights). *More visuals-on-screen photos / a clip still welcome.*

- [x] **MUTEK.AE** · `mutek-ae/` — performance photos + short clip (Dubai 2024)

  https://www.youtube.com/watch?v=uF2sC6XT6y8, https://www.youtube.com/watch?v=SlFVfgXRGDA, https://www.youtube.com/watch?v=zh3cOPKlbI0, https://www.youtube.com/watch?v=rcUriqX-ZOU

- [x] **Spoon Spade Shovel** · `spoon-spade-shovel/` — performance photos + short clip (Jameel 2025)

  [Stream Jameel Set - corrupted mono bounce by Aakarsh Singh | Listen online for free on SoundCloud](https://soundcloud.com/aakarsh-singh-366199236/jameel-set-corrupted-mono), https://youtube.com/shorts/_oEpRbMNzPk, https://www.youtube.com/watch?v=o51oMs2oiZI, https://youtube.com/shorts/drRYhWZW0PY, https://youtube.com/shorts/l9rVuNifBu4, https://youtube.com/shorts/f8cuHkI51I0

- [x] **Climate Cartographies** · `aa-dubai/` — performance photos + short clip (Alserkal 2025)

- [x] **Date 0:0** · `date-0-0/` — Blender pre-viz renders + satellite reference wired.

- [x] **AA Warsaw** · `aa-warsaw/` — workshop photos, student work, or a group shot

- [x] **latent-space** · `latent-space/` — video embedded ✓; just a `thumb.jpg` still (or I grab a frame)

​	https://www.youtube.com/watch?v=quBT92g8lNM , https://www.youtube.com/watch?v=AL6J8ZqX5Jo, https://www.youtube.com/watch?v=QOACCIudkG4, https://www.youtube.com/watch?v=Mi9uFXwB32g, https://www.youtube.com/watch?v=xphJ81i8jnw

## Priority 3 — cluster lightboxes
Drop 2–5 stills / short clips / links per cluster in `public/images/clusters/` (or paste links):
- [ ] TouchDesigner (5 works)
- [ ] Unreal Engine (4)
- [ ] Live sets (3)
- [ ] Augmented reality (3)
- [ ] Live coding (2)

---

## Text / info needed
- [x] **latent-space:** score credit is "Cash" (goes by Cash); runtime 6:06 — both wired.
- [x] **Dark Mofo:** 4 nights (both festival weekends, Fri/Sat ×2), 10pm–4am; concept wired from festival copy.
- [ ] **Callback résumé:** what did "engagement" actually measure? (DAU / sessions / friend-adds) — to de-vague that bullet
- [x] **Date 0:0:** WIP, not canned (confirmed w/ Sara) — pre-viz posted; site date set to "August 2025 — present".
- [ ] **Synthesizing Landscapes (spoon-spade-shovel):** one line on what the piece itself does (I won't invent it).

## Open decisions (pick when ready)
- [ ] **LaTeX rendering:** local `tectonic` is blocked by a Windows font bug. Render on **Overleaf**
  (paste/upload updated `.tex` → compile; reliable, zero setup) **or** have me install **MiKTeX**
  for one-command local render. Which?
- [ ] **Dark Mofo placement:** keep as a normal grid card (recommended) or de-emphasize?
