# Handoff: identity / positioning — for the LinkedIn agent (2026-07-06)

Brief for whoever is editing LinkedIn / the `career-ops/` corpus, so LinkedIn and
the portfolio site (`personal-site-v2`) stay in sync. Written from the site side.

**Context.** Mare is out of runway (waiting on a few things) → the job search is the
priority: optimize for hired-fast + paid-well, honestly. Consistent with the locked
founder story ("Mare is live; we stopped pursuing it as a company").

## 1. Product Engineer, not Design Engineer

Aakarsh was unsure whether he's a "design engineer" or "product engineer." Resolved:
he is a **Product Engineer**. His own words this session: he does NOT do the
micro-interaction / motion craft that defines the Linear/Vercel "design engineer"
(he ruled that lane out — "I don't care about hover states"); he does general product
design, full-stack, and ships good-looking products fast. Market data confirms keeping
the broader label and aiming at the bigger pool: "design engineer" is a thin,
senior-skewed market (~5,700 roles globally, flat since 2023; reports/004 found ~43
postings) vs 67,000+ engineering openings. Reassure him product-engineer ≠ PM — it's a
hands-on builder role.

**Action:** the site dropped "design engineer" everywhere → "Product Engineer." The
LinkedIn headline should drop "/ Design Engineer" too →
`Product Engineer | Engineering creative tools and experiences | Co-founder at Mare (mare.run)`.

## 2. "If Mare fails" lanes (already the strategy)

Public identity = Product Engineer; differentiator = art/creative range + shipped a real
creative tool with an ML pipeline. Apply quietly into: **Product Engineer; Applied AI /
AI Product Engineer** (Mare's embeddings / pgvector / RAG / self-hosted LLM on Modal /
ensemble clustering + the latent-space diffusion pipeline = genuine applied-AI evidence,
the hottest/best-paid tier); **FDE / Solutions Eng** at AI startups (UAE residency edge:
G42/Core42/Presight); **DevRel** (production Modal + Supabase user). = reports/003–004.

## 3. Canonical facts to reconcile (site ↔ LinkedIn MUST match)

- **Mare title = "Co-founder & Product Engineer"** on all surfaces. (Site done: cv.json,
  projects.json, resume.tex.) Drop the CTO / Design-Engineer stack — CTO reads
  overqualified for IC roles.
- **Mare date = "January 2026 — Present."** LinkedIn / career-ops / `mare-tech-summary.md`
  say "2024 — Present" — that is a factual ERROR, correct it DOWN. Mare started after the
  Date 0:0 gig (Aug–Dec 2025); grad NYUAD May 2025. Continuity (no gap, never "unemployed")
  = grad May 2025 → AA Warsaw Jul 2025 → Date 0:0 Aug–Dec 2025 → Mare Jan 2026. (Fixing
  2024→2026 also removes a real overlap: "Mare 2024–present" currently overlaps Date 0:0.)
- **Electronicos Fantasticos** title drifts — site "Creative Technologist / Studio Associate"
  vs career-ops "Technical Associate." Pick one (artist-cv.tex has a Studio/Technical
  self-contradiction noted).

## 4. Shared guardrails (restate to prevent drift)

- NEVER name Mare's model (Qwen) in public copy — "self-hosted embedding + LLM models on
  Modal." Grep `Qwen` before publishing.
- Level mid/L3, untiered; never new-grad funnels; never "senior"/"founding engineer"
  self-label; never "unemployed."
- Founder story locked: "Mare is live; we stopped pursuing it as a company" — not "shut
  down," not "side project."
- Voice: first-person factual ("I built/migrated," not "I led/oversaw"), concrete
  components, no punching down, humanizer rules (no em-dash overuse / forced rule-of-three
  / filler verbs), American spelling on LinkedIn.
- Mare facts verbatim from `career-ops/mare-tech-summary.md` (closed beta 100+, ~10,000
  items, Are.na + Pinterest + Chrome extension only, images + links only).

## 5. Site state (committed on branch `mare-justified-decisions`)

- `5ff2de6` — "design engineer" → "Product Engineer" across meta, header, /about + Mare title.
- `28537a1` — résumé: reworked NEEEU bullet (real AR-filter build, no fake 20% metric),
  dropped poetic film titles, reverse-chron Selected Projects, fixed dead LAND link
  (/work/LAND → /projects/land), re-rendered PDF (1 page).
- `/about` and `/cv` stay TWO SEPARATE pages (a side-by-side rail was explored and rejected).
