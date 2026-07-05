# Assets & info still needed — site backfill tracker

Single source of truth for everything I need from you. Check items off (`- [x]`) and add a
note as you send them; I'll wire them in and strike them through on my side. Nothing here
blocks the site — every gap currently shows a clean placeholder.

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
- [x] **Dark Mofo** · `dark-mofo/` — visuals-on-screen photos, a 10–30s clip; concept/brief line *(framing note below)*

  https://www.youtube.com/watch?v=yBWf8GNHBCg, https://www.youtube.com/watch?v=UTMa9ZHaw5I, https://www.youtube.com/watch?v=J3Mairxj3sQ, https://youtu.be/ZcBdPPWzbXw, https://youtube.com/shorts/nmpogVoFhZM?feature=share, https://youtube.com/shorts/Rx2-Hel2sI4?feature=share, https://youtube.com/shorts/MNBnQytZ5dY, https://youtube.com/shorts/GJEEEG1b9NY, https://youtube.com/shorts/PqJ93xyo65M, https://youtube.com/shorts/_fsUANfhHwU,  https://youtube.com/shorts/cpZuTe4pZQw

- [x] **MUTEK.AE** · `mutek-ae/` — performance photos + short clip (Dubai 2024)

  https://www.youtube.com/watch?v=uF2sC6XT6y8, https://www.youtube.com/watch?v=SlFVfgXRGDA, https://www.youtube.com/watch?v=zh3cOPKlbI0, https://www.youtube.com/watch?v=rcUriqX-ZOU

- [x] **Spoon Spade Shovel** · `spoon-spade-shovel/` — performance photos + short clip (Jameel 2025)

  [Stream Jameel Set - corrupted mono bounce by Aakarsh Singh | Listen online for free on SoundCloud](https://soundcloud.com/aakarsh-singh-366199236/jameel-set-corrupted-mono), https://youtube.com/shorts/_oEpRbMNzPk, https://www.youtube.com/watch?v=o51oMs2oiZI, https://youtube.com/shorts/drRYhWZW0PY, https://youtube.com/shorts/l9rVuNifBu4, https://youtube.com/shorts/f8cuHkI51I0

- [x] **Climate Cartographies** · `aa-dubai/` — performance photos + short clip (Alserkal 2025)

- [x] **Date 0:0** · `date-0-0/` — **Blender pre-viz renders** (not the janky VR capture) *(decision below)*

  https://www.youtube.com/watch?v=e-B8h7euy9k, https://www.youtube.com/watch?v=gYjDDVOWS6U, https://www.youtube.com/watch?v=DdUWuK8UsmI

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
- [ ] **latent-space:** Cash's full name / handle (score credit) + runtime
- [ ] **Dark Mofo:** one line on the concept/brief + confirm hours-per-night × number of nights
- [ ] **Callback résumé:** what did "engagement" actually measure? (DAU / sessions / friend-adds) — to de-vague that bullet
- [ ] **Date 0:0:** OK to post pre-viz of an unannounced/canned collab? (courtesy check w/ Sara & Wafaa). *(Role end date resolved — ended Dec 2025; updated in résumé, CV, and site.)*

## Open decisions (pick when ready)
- [ ] **LaTeX rendering:** local `tectonic` is blocked by a Windows font bug. Render on **Overleaf**
  (paste/upload updated `.tex` → compile; reliable, zero setup) **or** have me install **MiKTeX**
  for one-command local render. Which?
- [ ] **Dark Mofo placement:** keep as a normal grid card (recommended) or de-emphasize?
