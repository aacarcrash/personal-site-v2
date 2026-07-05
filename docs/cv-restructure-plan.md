# CV restructure — banked plan (decide/build tomorrow)

**Status:** decided in principle, NOT built. Bio + sound-computing fixes already
shipped separately. This doc is the pickup point for the `/cv` page rework.

## The problem

`/cv` currently dumps everything into one long scroll: 9 experience entries that
interleave pure-tech roles (Callback, Kermit, Slingshot) with art-tech roles
(Electronicos, NEEEU, NYU Tandon, Date 0:0), then a 15-show exhibition list,
teaching, residencies, press, education, skills.

Aakarsh's framing: *"no curator wants my tech jobs, no recruiter wants my
exhibition lists."* The page is a clusterfuck to skim.

Key realization: the two PDFs (`Resume (tech)`, `Artist CV`) already solve the
**take-home** split — each audience downloads its targeted file. They do NOT fix
the **on-page** experience, and most visitors read the page without ever
downloading. The page is the first impression; the PDF is step two.

## Options considered

- **A — Track toggle** (`Engineering / Art`, like the AxisGrid switcher). Hides
  the other track on the page. Clean per-audience, but hides range and costs a
  click.
- **B — Combined + sticky rail (RECOMMENDED).** Keep everything on one page; add
  a sticky right rail with: short bio, BOTH PDF links, and jump-nav
  (Experience · Exhibitions · Teaching · Press · Education · Skills). Each
  audience self-selects where to look; breadth stays visible.

## Recommendation: B, and why (for Aakarsh specifically)

- His cross-disciplinary range is the **differentiator**, not the noise. A
  design-engineer recruiter who also sees Ars Electronica / Louvre is more
  interested, not less — the LinkedIn doc says the art+eng mix is his edge.
  A toggle that hides half undersells the exact thing that makes him memorable.
- Consistency with the homepage: the AxisGrid **re-sorts** work by lens but never
  **hides** any of it. "Re-sort, don't hide" is already the site's logic; the CV
  should match.
- The mixing is narrower than it feels: only **Experience** interleaves tech and
  art. Shows / Teaching / Residencies / Press are already art-only sections;
  Skills is eng-only. So "combined + jump-nav" is mostly already sorted — the
  rail just makes it navigable.

**The one case for the toggle (A):** if the target recruiters are strait-laced
and would read "artist" as unfocused / flight-risk. But he targets AI-creative-
tool and design-engineer roles where it's an asset, so A is probably wrong for him.

## Build spec for B (when we do it)

- **Layout:** two-column. Scrolling content column (left) + sticky rail (right,
  ~280px, `position: sticky; top: 32px`). Widen the `/cv` main container to
  ~1120px to fit both.
- **Rail contents:** short bio (2 sentences, essence — full bio + statement stay
  on `/about`), contact email, both PDF download links, jump-nav anchors to each
  section.
- **Responsive:** below ~860px, stack — rail goes to the top (`order: -1`),
  `position: static`, full width. Add `.cv-layout` / `.cv-main` / `.cv-rail`
  classes to `globals.css` (matches the existing `.flv-body` / `.pd-aside`
  responsive pattern) rather than inline styles.
- **Jump-nav:** anchor links to `#experience`, `#exhibitions`, etc.; smooth
  scroll respects the existing `prefers-reduced-motion` rule.
- Keep the existing `CvSection` / `CvRow` / `ShowRow` / `PressRow` / `SkillRow`
  renderers; only the page wrapper + rail are new. No client component needed for
  B (jump-nav is plain anchors) unless we add the toggle.

## If we ever add the toggle (A) on top of B

- Add `track?: "eng" | "art" | "both"` to `CvRoleSchema` in `data/types.ts`.
- Tag `content/cv.json` experience entries:
  Mare=both, Date 0:0=both, AA Warsaw=both, Callback=eng, NYU Tandon=both,
  NEEEU=both, Electronicos=art, Kermit=eng, Slingshot=eng.
- Section→track map: Experience=filtered, Education=both, Skills=eng,
  Exhibitions/Teaching/Residencies/Press=art.
- Requires making the render a client component (`useState`), so move renderers
  into `components/CvTracks.tsx` and keep `metadata` in the server `page.tsx`.

## Related decisions (also banked)

- **Header on interior pages:** slim it — keep name + nav + theme toggle, drop
  the "Design Engineer. New media artist. Co-founder of Mare." tagline (it
  repeats the page's own intro). Add a `slim?: boolean` prop to `Header.tsx`.
- **CV title fix (pending):** `content/cv.json` Mare title is
  "Co-founder, CTO & Design Engineer" — title-stacking at his own company. The
  LinkedIn doc argues against it. Recommend → "Co-founder & CTO". NOT yet applied
  (kept out of the bio commit; do with the CV rework).
- **`/about` vs `/cv`:** keep separate, keep `/about` URL, no redirects. `/about`
  = personal bio + verbatim artist statement (kept exactly as-is). `/cv` =
  credentials.
- **Headshot:** optional for launch. A B&W mid-performance/studio shot fits the
  locked monochrome design better than a corporate headshot. Not a blocker.

## LinkedIn vs site consistency (fact drift to reconcile)

Same facts, different lead per surface is fine (LinkedIn leads engineer-first;
site leads artist+engineer). But reconcile the FACTS so no reader catches a
contradiction:
- Venues: LinkedIn lists Ars Electronica / Louvre AD / MUTEK / Jameel; site adds
  Sydney Opera House + Dark Mofo. Pick the canonical set.
- Mare start date: LinkedIn says 2024; site CV says Jan 2026 (deliberate).
- Mare title: LinkedIn "Co-founder & CTO"; site CV stacks "+ Design Engineer".
