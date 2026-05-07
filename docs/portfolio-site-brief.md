# Portfolio site brief — strategic context

This is the bridge between the job-search positioning Aakarsh has landed on (in `../career-ops/`) and the design / build choices in this repo. Read this before making any major direction call. It complements `decisions.md` (what's locked) and `mare-framing.md` (Mare-specific facts) — those are about *what*; this is about *why*.

Cross-references:
- `decisions.md` — locked design decisions (don't relitigate without an explicit ask).
- `mare-framing.md` — verified Mare facts. Already updated with the real stack (FastAPI / Supabase + pgvector / Modal / Cloud Run / Cloudflare R2). Don't introduce Firebase anywhere.
- `source-of-truth.md` — provenance for every CV / role / exhibition fact on the site.
- `../career-ops/mare-tech-summary.md` — the canonical Mare facts file. If this brief or `mare-framing.md` ever drift from `mare-tech-summary.md`, that file wins.
- `../career-ops/linkedin-profile-final.md` — finalized LinkedIn voice and structure. Site voice should match this.

---

## What's already in this repo (reality check)

The site is more built than a fresh reader of older docs might assume. As of this brief:

- **Routes**: `/`, `/about`, `/cv`, `/projects/[slug]`, `/sketches/[slug]`, `loading.tsx`, `not-found.tsx`, `opengraph-image.tsx`.
- **Three deep case studies** as bespoke components: `MareCaseStudy.tsx`, `CallbackCaseStudy.tsx`, `NeeeuCaseStudy.tsx`. (Earlier docs only mentioned Mare; Callback and NEEEU now have their own components too.)
- **AxisGrid** as homepage centerpiece, with switchable axes and Framer Motion `layoutId` reanimation. URL-state-synced.
- **FeaturedStrip** above the grid with the locked picks (Mare / Callback / NEEEU).
- **`/sketches`** route already scaffolded — the "experiments" surface I'd previously flagged as missing is already there in skeleton form. Population is the open question, not existence.
- **`/about`** already opens with "I work as a design engineer and an artist" — the right framing for the positioning we've landed on.
- **Pure monochrome**, three-font system (Instrument Serif / Inter / JetBrains Mono), light + dark mode via `next-themes`.

Treat the rest of this brief as additive guidance, not a starting-from-zero plan.

---

## The job-search context (read first — everything below depends on this)

### Target role for new applications

**Software Engineer / Product Engineer / Design Engineer at AI creative-tool startups** (Krea, Recraft, Spline, Rive, Tldraw, Runway, Magic Patterns, Lovable, v0, Bolt, Replit) and at small / early-stage product companies (5–50 people) where one engineer designs and ships interface work.

### What the site needs to communicate, in order

1. This person ships products end to end (Mare is the proof).
2. This person can talk about *systems*, not just visuals (engineering writeups + system thinking visible on case study pages).
3. This person has unusual visual / artistic depth (the art and XR work, framed as art, not as "design engineering").
4. This person is not a junior, but is also not claiming Senior or Founding Engineer titles for new roles.

### Why this target and not others — the positioning history

This took several rounds of conversation to land on. Understanding the ruled-out paths matters because the site shouldn't accidentally drift back into them.

**Ruled out: pure creative-technologist / studio path** (Active Theory, Resn, Hello Monday, Antinomy, Locomotive, Akufen, Bonhomme, Unit9, North Kingdom, etc.).
- Aakarsh has been on this market a long time. It's small, visa-hostile (most studios require LA / Amsterdam / Tokyo / Berlin presence and don't sponsor), project-based rather than salaried.
- The work is genuinely closest to his heart, but the market won't pay him reliably.
- **Site implication:** the "shipping new artistic experiences" energy is real and should live inside the project pages, but the *overall site framing* is a *founder of a creative tool*, not a *creative technologist for hire by brands*. Don't pitch the site as an Awwwards-style studio reel.

**Ruled out: Design Engineer at Linear / Vercel / Stripe / Raycast / Figma.**
- Their definition of Design Engineer is pure craft: hover-state obsession, micro-interaction tuning, typography-millisecond precision. The Rauno / Emil / Paco lineage.
- Aakarsh has explicitly said he doesn't want this work: *"I really don't care about hover states and micro-interactions."*
- **Site implication:** do not cosplay as a Rauno / Emil / Paco-style pure-craft showcase. (See "Anti-patterns" below for the explicit list.)

**Ruled out: Founding Engineer / Senior Engineer titles for new applications.**
- Aakarsh is ~1 year post-grad. Industry-typical seniority for "Senior" is 5+ years. "Founding Engineer" implies you were employee #1–3 at someone else's company; he was that for his own company, which is its own real thing but doesn't transfer cleanly to a new role.
- He explicitly pushed back on these labels: *"I don't feel confident enough for founding engineer roles. I genuinely don't think I can call myself senior either yet."*
- **Site implication:** don't put "Senior" or "Founding Engineer" anywhere on the site as a self-description. The Mare role title is real (he's the CTO of his own company) and stays.

### Where we landed: mid-level Software / Product / Design Engineer at AI creative-tool startups

- 5–50 person companies. Fewer pure-craft requirements than Linear-tier, more remote-friendly than studios, more numerous than Founding Engineer roles.
- Mare experience (a creative tool with a real ML pipeline) is *direct* relevant evidence, not a stretch.
- "Design Engineer" is a fine label here — at small startups it usually means "engineer who designs the screens they ship," which is the broad definition, not the Linear pure-craft one.

### Two distinct title contexts (don't conflate)

- **At Mare** (his own company): **Co-founder, CTO & Design Engineer.** Real, well-earned. He architected the stack, built the product end to end, migrated the system off Celery + Redis to Cloud Run + Cloud Tasks. This appears on the LinkedIn headline, on this site, on the resume, everywhere.
- **For new roles at other companies:** Software Engineer / Product Engineer / Design Engineer, no seniority modifier. This shapes what the site implicitly pitches him for, but isn't a literal label on the site.

The site does NOT need a "Looking for X" CTA. The Mare role title plus the writing layer plus the project depth do the work. If a CTA appears, it's "Get in touch" not "Hire me as a Senior X."

### What the user has actually said about role identity (for the agent's calibration)

These are direct from conversations and should ground how the agent interprets ambiguous calls:

- *"I really do like designing and engineering, does it really have to mean micro states and such or what?"* — wants the role, but not the Linear-tier definition. Yes to design + ship, no to hover-state obsession.
- *"I really like creating new experiences and shipping them fast, and I do care about figuring out new artistic interactions and interventions on the web."* — the artistic / experiential side is real and should be visible on the site, but framed as *part of his practice* not as *the studio service he's selling*.
- *"I have just been in the creative technologist job market for a long time and have struggled to land jobs because there's not many and then most require in person work / visas."* — the pivot isn't aesthetic preference, it's pragmatic. The site doesn't need to apologize for being broader than studio work.
- *"I don't have CS degree, much CS work experience (Mare is my own company lol), and also so much confusing art stuff for them."* — imposter pattern is real. Calibration: Mare *is* real CS work, and at AI-creative-tool companies the art *is* a feature, not noise. The site should make both legible without overcompensating in either direction.

---

## The thesis: creative-tools founder's site (NOT Rauno-style craft showcase)

### Rauno-style craft showcase (avoid)

- The site itself is the demo. Every transition, hover, scroll, page-change is meant to wow.
- Custom cursor, view-transition flexes, GSAP-y reveals, kinetic type, decorative ambient WebGL.
- Minimal copy, maximal motion.
- Few projects, each with elaborate writeups about *the craft of the project itself* (the bezier curve picked, the spring physics tuning).
- Implicit message: "I am the kind of engineer who would make this site feel this good."

### Creative-tools founder's site (target)

- The site is well-designed but not a demo. **Restraint is the flex.**
- 1–3 featured products with deep case studies that explain the system, the decisions, what worked, what didn't, and what the tradeoffs were. (Already done — Mare / Callback / NEEEU all have bespoke components.)
- **System thinking is visible**: architecture diagrams, data flow, what the ML pipeline actually does, what's behind the interface.
- A mix of products, interventions, and art, separated by *framing*, not by nav. (Already done — the `tier: case-study | light | art` system handles this.)
- Honest progress signal — "here's what I'm actually working on" — not aspirational marketing copy.
- Implicit message: "I think about products end-to-end, I can ship complete things, and I can talk about the work like an adult."

### Reference points

- **rsms.me** (Rasmus Andersson) — engineering writeups, system diagrams, restrained design.
- **tonsky.me** (Nikita Prokopov) — case-study-heavy thinking.
- **joshcomeau.com** — mix of tools, art, writing without it feeling like a portfolio.
- **mare.run** itself — when Mare publishes a public-facing system writeup, it should fit alongside this kind of work.

---

## Voice & framing rules

These came out of long humanizer + tone passes on the LinkedIn doc. Apply the same standards everywhere on the site:

### First-person factual, not team-leadership theatrical

- ✅ "I migrated us off Celery + Redis to Cloud Run + Cloud Tasks."
- ❌ "I led the deployment side and oversaw the migration to..."

Mare is a 2-person company. "I led X" implies a team. Use "I migrated" / "I built" / "I designed".

### Concrete components, not vague verbs

- ✅ "I built the product end to end: the ingestion pipeline, the clustering layer, the interface, and the deployment."
- ❌ "I designed and built the product end to end."

When you can name the parts, name them. "Designed and built" without specifics is throat-clearing.

### Honest about scope without snark

Don't have lines that punch down at other engineers, designers, or competitors. Earlier drafts of the LinkedIn About had things like *"engineers usually don't have the second half"* and *"visual training that goes back further than reading Linear's blog"* — those got cut because they read as cocky, even though they were technically defending Aakarsh's position. Same standard on the site: confident about what's there, generous to everyone else.

### No AI tells (humanizer rules)

- No em-dash overuse.
- No rule-of-three lists used rhetorically ("X, Y, and Z" forced for cadence).
- No "It's not just X — it's Y" parallelism.
- No "the X is the Y" aphorisms ("the combination is the thing").
- No filler verbs: leverage, empower, seamless, vibrant, tapestry, testament.
- Vary sentence length. Short ones, then long ones, then short ones.

---

## What still needs to be added (in order of leverage)

### 1. `/notes` or `/writing` — engineering writeups (HIGHEST leverage, still missing)

This is the biggest open gap and the single highest-signal thing the site is missing. There's no `/writing` route yet. A creative-tools founder's site needs **2–4 engineering writeups** that explain *systems*, not *craft*. Suggested topics, all sourced from `mare-tech-summary.md` / `mare-framing.md`:

- **"Three clustering modes instead of one slider."** Why Balanced / Aesthetic / Semantic are different algorithms reading different things, why a single similarity slider was rejected, what an embedding actually represents, what the ensemble layer (HDBSCAN / Leiden / agglomerative) does.
- **"Designing for what the system isn't sure about."** The Unclustered rail, soft membership, sub-collections. Why surface uncertainty instead of forcing items into the nearest cluster.
- **"Migrating off Celery + Redis to Cloud Run + Cloud Tasks."** What the old setup looked like, why it didn't fit anymore, what the new setup looks like, what changed in operational complexity. Reference `docs/CLOUD_TASKS_MIGRATION.md` in the mare-monorepo.
- **"Are.na vs Pinterest as ingestion sources."** What each platform's data shape is, what Mare normalizes to, what the Chrome extension fills in.
- **"Multi-device sync in a Quest 3 gallery installation."** Date 0:0 — the real-time NoSQL sync, the physical-MR-VR transition design, the asset memory optimization. (Note: this is the one writeup that would be primarily about the artist work rather than Mare.)

Each writeup: 800–1500 words, with at least one diagram or screenshot. **The fact that they explain systems is what marks Aakarsh as a creative-tools founder rather than a craft engineer.** Each writeup must be **linkable individually** so it can be pasted into a cold email or LinkedIn DM as the "concrete artifact" — that's how the writing layer becomes job-search infrastructure.

### 2. System diagram inside `MareCaseStudy.tsx`

Boxes and arrows: Chrome extension / Are.na / Pinterest → ingestion pipeline → embedding layer (Jina) → ensemble clustering layer → Postgres + pgvector → retrieval / RAG → frontend on Cloud Run. The Modal LLM service hangs off the side. Pure-craft sites never have these. Creative-tools-founder sites always do. Even an SVG or a simple hand-drawn diagram is fine; what matters is that it shows system thinking visibly on the page.

### 3. Populate `/sketches` (the route exists, the content doesn't)

Two or three small interactive things — a shader experiment, a Three.js sketch, a small interaction prototype. These should be framed as *experiments / sketches*, NOT products. The point is to show interactive-idea fluency, not flex craft. Don't overbuild this — three sketches that are tight is better than ten that are half-finished.

### 4. "Currently building" line on `/about`

Lightweight live signal. What Mare is shipping next, what Aakarsh is thinking about. Builds-in-public energy without LinkedIn-cringe. One sentence, manually updated when state changes.

### 5. Sweep `mare-framing.md` for old-positioning references (done as of this brief; flag for future drift)

The framing doc has been swept — the stack section is correct (FastAPI / Supabase + pgvector / Modal / Cloud Run / Cloudflare R2) and the opener now references AI creative-tool startups instead of Linear / Vercel. If you spot any new "Linear or Vercel" / "Rauno-style craft" framing slipping back in (e.g. via auto-generated copy or imported text), fix it the same way.

---

## Anti-patterns to NOT add

Creative-tools-founder sites stay clean. None of these:

- ❌ Custom cursor.
- ❌ Big page transitions / view-transition flexes used as a wow-moment.
- ❌ **Decorative ambient WebGL** — meaning a 3D blob / shader scene in the hero that exists purely to flex "I can do shaders" and has no relation to any project. This is the agency-trick anti-pattern.
- ✅ **Project-relevant WebGL is encouraged.** Aakarsh's whole practice is full of WebGL / Three.js / HLSL — when a project IS a shader piece or a Three.js experiment, embedding the actual thing in the project page is exactly right. The rule is *"is this WebGL telling me about a specific project, or just decorating the page?"*. If decorating, cut it. If telling, keep it.
- ❌ "Hire me" CTA on the homepage.
- ❌ Testimonials block.
- ❌ Tech-stack icon parade.
- ❌ "Award-winning" language anywhere.
- ❌ Theme-switcher-as-Easter-egg (the existing clean dark mode is enough).
- ❌ Animated scroll-progress bar / scroll-jacking.
- ❌ "What I do" → bulleted services list (this isn't an agency site).
- ❌ A second motion centerpiece beyond the AxisGrid `layoutId` animation. The grid is the one earned motion moment; everything else stays still.

---

## One-line summary

> The site is a creative-tools founder's site, not a Rauno-style craft showcase. The biggest current gap is the writing layer (2–4 engineering writeups + a system diagram in MareCaseStudy). Use `mare-framing.md` (and ultimately `../career-ops/mare-tech-summary.md`) as the source of truth for Mare facts. The voice is first-person factual, not team-leadership theatrical. WebGL is fine when it's about a project; not fine when it's decoration. Restraint is the flex.
