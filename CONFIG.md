# CONFIG — how to update this site without re-reading the codebase

A practical reference for editing the site's content yourself. Sections are
ordered by how often they change.

If you're stuck, ask Claude with `/init` to re-read `CLAUDE.md`, `HANDOFF.md`,
and `docs/mare-framing.md` before making changes.

---

## 1. Editing the Featured strip on the homepage

Open **`data/featured.ts`**. Two values to edit:

```ts
export const featuredSlugs = ["mare", "callback", "land"];
export const featuredColumns = 3;
```

- `featuredSlugs` is the ordered list of project slugs to feature, by their
  `slug` field in `data/projects.ts`. Add, remove, or reorder freely.
- `featuredColumns` controls how many tiles per row on a wide screen. Use 2
  for two big tiles. Use 4 for a denser strip. Tiles wrap to fewer columns
  on narrower screens.

Unknown slugs are skipped at render time.

---

## 2. Adding a new project

Append a new object to the `projects` array in **`data/projects.ts`**. Easiest
approach: copy an existing entry (e.g. `callback`) and edit the fields.

Required fields:

```ts
{
  id: 'unique-id',                  // matches slug; used as a stable React key
  slug: 'unique-id',                // URL → /projects/<slug>
  name: 'Display Name',
  type: 'project',
  axes: { year: '2025', medium: 'Web', concern: 'Interface',
          technology: 'Web', context: 'Product' },
  thumbnail: '/images/<slug>/cover.jpg',
  subtitle: 'One-line pitch for the Featured strip.',
  date: 'Month YYYY — Month YYYY',
  technology: 'Comma, separated, list',
  description: [
    { text: 'Plain paragraph or paragraph with <a href="...">inline link</a>.' },
    { header: 'Optional section header', text: '...' },
  ],
  media: [
    { link: '/images/<slug>/1.jpg', type: 'image', caption: 'Caption' },
    { link: 'https://www.youtube.com/embed/<id>', type: 'video', caption: 'Caption' },
  ],
}
```

Optional fields:

- `role` — your role on the project (rendered next to company in the hero)
- `company` — client/employer
- `location` — city or "Remote"
- `liveLink` — published URL
- `sourceCode` — GitHub URL
- `tier` — `'case-study' | 'light' | 'art'`. Used by tier-based hierarchy logic.

Allowed axis values are declared in `data/types.ts` (`MEDIUMS`, `CONCERNS`,
`TECHNOLOGIES`, `CONTEXTS`, `YEARS`). Add a new value there before assigning it.

---

## 3. Adding a sketch cluster (group of sketches)

Append to `projects` array with `type: 'cluster'`:

```ts
{
  id: 'cluster-slug',
  name: 'Cluster Name',
  type: 'cluster',
  axes: { ... },
  thumbnail: '',                   // leave empty — script will derive it
  date: '2024',
  technology: 'Tools used',
  count: 3,                        // number of items
  items: [
    { title: 'Item 1', link: 'https://www.youtube.com/embed/<id>', type: 'video' },
    { title: 'Item 2', link: '/images/sketches/foo.png', type: 'image' },
  ],
},
```

Then:

```bash
python scripts/extract-cluster-thumbs.py
```

This pulls a thumbnail for each cluster from the first item's video (YouTube
or Vimeo), saves it to `public/images/clusters/<id>.jpg`, and prints the
`thumbnail` value to paste back into `data/projects.ts`.

The cluster will render at `/sketches/<id>` automatically.

---

## 4. Adding a CV entry

Open **`data/cv.ts`**. The arrays are:

| Array | Section on `/cv` |
| --- | --- |
| `experience` | Experience |
| `shows` | Selected Exhibitions, Performances & Screenings |
| `teaching` | Teaching |
| `residencies` | Residencies & Professional Development |
| `press` | Press & Publications |
| `education` | Education |
| `awards` | Honors & Awards (currently commented out in the page) |
| `skills` | Skills |

Append your entry to the matching array. Schemas (CvRole, CvShow, CvPress,
CvAward) are defined at the top of the file.

To re-enable the Awards section: uncomment the relevant block in
`app/cv/page.tsx` (search for `Honors & Awards`).

---

## 5. Updating the tagline on the header

`components/Header.tsx` — search for the line that reads
`Design Engineer. New media artist. Co-founder of Mare.`

---

## 6. Updating the About bio

`app/about/page.tsx`. Two paragraphs of personal blurb sit above a
`<blockquote>` that contains the verbatim **artist statement** from your
exhibition CV. Don't paraphrase the statement — copy whatever new version
your gallery CV uses.

---

## 7. Updating the Mare case study

Three places, in order of frequency:

- **`components/MareCaseStudy.tsx`** — the design-decision cards (titles + bodies).
- **`data/projects.ts`** — Mare's `description` blocks, the project page intro.
- **`docs/mare-framing.md`** — the locked facts (numbers, what to never claim).
  Edit this if Mare's reality changes (e.g. you add a third platform).

The Mare framing rules are protected — don't drift back to overclaims. If
something there is no longer accurate, update the doc first, then the code.

---

## 8. Adding or replacing project images

Folder convention:

```
public/images/<project-slug>/
  cover.jpg
  1.jpg
  2.jpg
  ...
```

After dropping new files in:

```bash
python scripts/optimize-images.py
```

That resizes everything to a 1920px max edge and re-encodes JPEG/PNG. For GIFs:

```bash
python scripts/extract-gif-thumbs.py
```

Generates `<name>.thumb.webp` siblings used for grid thumbnails.

---

## 9. Replacing the resume PDFs

PDFs live in `public/`. Two are referenced from the site:

- `public/Aakarsh_Singh_Resume_2026.pdf` — tech resume, linked from `/cv` and `/about`.
- `public/Aakarsh_Singh_Artist_CV.pdf` — artist CV, linked from `/cv`.

To swap a PDF: drop the new file in (same name, or a new dated name and update
the `href` in `app/cv/page.tsx` and `app/about/page.tsx`).

---

## 10. The OpenGraph (link preview) card

Source: `app/opengraph-image.tsx`. It generates the 1200×630 PNG for any page
that doesn't override it. Edit the JSX to change wording, layout, or colour.

To override it for a specific page (e.g. the Mare project page), add an
`opengraph-image.tsx` in that route's folder.

---

## 11. Theme + colours

`app/globals.css`. Locked monochrome palette (no accent colours). Light/dark
mode tokens at the top of the file. The site reads them as CSS custom
properties — components shouldn't hard-code colours.

---

## 12. Axis grid options

`data/types.ts`. The const arrays `YEARS`, `MEDIUMS`, `CONCERNS`,
`TECHNOLOGIES`, `CONTEXTS` are the allowed axis values. Add a new value here
before assigning it on a project. Adding a new axis (beyond y/x) requires
also updating `AxisKey` and `axes` shape on `Project`/`Cluster`.

---

## Common pitfalls / things not to do

- **Don't drift Mare's framing.** Read `docs/mare-framing.md`. The locked facts
  (100+ closed beta, 10,000+ items, Are.na + Pinterest only, images + links
  only) survived long correction passes. Don't reintroduce "8 platforms",
  "heterogeneous media", or New Inc.
- **Don't reframe LAND, NEEEU, To Water, Faceshopping, etc. as design
  engineering.** They're art, and the site reads honestly when they stay
  framed as art. NEEEU has shader/AR depth; LAND is film + simulation. Both
  belong on the art axis.
- **Don't add accent colours.** The thumbnails are the only colour on the
  page — that's the brand.
- **Don't write three-paragraph "About" copy.** The personal blurb is short;
  the artist statement does the philosophical lift.
- **Don't reintroduce `unrealEngineData.json` / `touchDesignerData.json`.**
  Those were class-internal. Public sketches come from `renderData.json`,
  consolidated in `data/projects.ts`.
- **Don't commit a stale resume PDF.** If `data/cv.ts` and the linked PDF
  diverge, anyone downloading gets a different story than the live page.
