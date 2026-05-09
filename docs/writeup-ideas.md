# Writeup ideas — `/notes` content backlog

Future writeups for the `/notes` (or `/writing`) section of the site. Organized by priority for the current job-search target (Software / Product / Design Engineer at AI creative-tool startups).

The strategy is documented in `portfolio-site-brief.md` — the writeups exist primarily as concrete artifacts for cold outreach + interview prep, not as a blog. Each one should be a real product / engineering / design decision explained in 800–1500 words. Real systems thinking visible. Not craft-worship, not pitch-deck content.

Already drafted:
- ✅ **`three-clustering-modes.md`** — Why Mare exposes Balanced / Aesthetic / Semantic as discrete modes instead of a similarity slider. Lives at `content/notes/three-clustering-modes.md`. Needs hero screenshot + side-by-side comparison shot.

---

## Tier 1 — write next (highest signal for the target)

These three are the strongest candidates because they each show a different dimension of "I think about systems": product/UI, infra, and ML.

### `unclustered-rail.md` — Designing for what the system isn't sure about

**Hook:** Most clustering UIs force every item into a cluster. Mare doesn't — items the algorithm can't confidently place sit in a persistent Unclustered rail with a count, instead of being shoved into the nearest neighbor. Soft membership means items can belong to more than one cluster when the algorithms productively disagree. Sub-collections handle the case where a cluster is itself heterogeneous.

**Argument:** Forcing a confident answer where the system isn't confident lies to the user. The Unclustered rail makes uncertainty a navigable surface instead of a hidden artifact. The user can scan it, see the count, and use it as a "what didn't fit?" signal — which is often where the most interesting cross-references live (the orphan that doesn't match because it bridges two themes you hadn't articulated yet).

**Why this is high-leverage:** Pairs with the three-modes piece. Same product, different decision. Together they signal "we think hard about how the system communicates its own state to the user" — exactly the muscle AI-creative-tool hiring managers test for, because their products do the same thing (a generative tool surfacing its own uncertainty is the hard problem).

**Assets needed:** Screenshot of the Unclustered rail with a real count. Optional: a screenshot showing an item with soft membership (visible in two clusters at once). Optional: a screenshot showing a sub-collection inside a larger cluster.

**Difficulty:** Medium. The decision is already articulated in `mare-framing.md` and `mare-tech-summary.md`. ~3 hours to write.

---

### `cloud-tasks-migration.md` — Migrating Mare off Celery + Redis to Cloud Run + Cloud Tasks

**Hook:** What Celery + Redis was doing for Mare's async pipeline, why it stopped fitting, what the serverless Cloud Run + Cloud Tasks split looks like instead, and what changed in operational complexity. Reference the migration brief (`docs/CLOUD_TASKS_MIGRATION.md`) in the mare-monorepo for anyone who wants the full detail.

**Argument:** Single-instance Celery + Redis works at small scale. Once you're scaling write-heavy async work (image enrichment, embedding generation, clustering passes) the always-on worker + broker becomes operational overhead — paying for capacity you're not using, on-call for a Redis you didn't really want to think about. Cloud Run + Cloud Tasks moves the whole thing to dispatched-on-demand. Trade-offs: cold starts, idempotency requirements, less control over backpressure. Worth it for the operational simplification.

**Why this is high-leverage:** Concrete infra story with a real before/after. Founding / product engineer roles at AI creative-tool startups frequently involve exactly this kind of "we got this far on Heroku-shaped infra, now we need to clean it up" decision. Showing you've done it once is direct evidence you can do it again.

**Assets needed:** A simple architecture diagram for the before/after. Boxes-and-arrows is fine. Maybe one screenshot of the Cloud Tasks queue page, showing real traffic. No need for screenshots from inside the product.

**Difficulty:** Medium-high. Requires honest reflection on what the migration cost you (debugging cold-start surprises, reworking idempotency). The migration brief should already have most of the substance — this writeup is the public-facing version.

---

### `hybrid-embeddings.md` — Semantic embeddings with a metadata bias

**Hook:** Mare's embedding strategy isn't pure semantic ("what does this image depict") and isn't pure metadata ("what platform is it from, what tags does it have"). It's a hybrid that combines both with a tuned weighting. This writeup explains why and what tradeoffs that decision opens up.

**Argument:** Pure semantic embeddings (like raw CLIP) collapse two images of the same object into the same cluster regardless of context. That's correct for one notion of similarity but wrong for a creative archive, where context matters: an image of a chair from your "office furniture research" folder shouldn't collapse with an image of the same chair from your "art history references." Conversely, pure metadata embeddings ignore visual content entirely. The hybrid threads the needle.

**Why this is high-leverage:** Most candidates for AI tools roles have not personally tuned an embedding strategy. They've used CLIP off the shelf or read papers about it. Showing you've made an actual product decision about embedding shape — and can articulate why — is rare and load-bearing for AI-creative-tool startups specifically.

**Assets needed:** A small diagram showing the embedding-component weighting. Possibly a small example of two items that the pure-semantic embedding would collapse but the hybrid keeps separate. Could be done with placeholder visuals.

**Difficulty:** Medium-high. Requires a clean, accessible explanation of embeddings without getting too deep into the math. ~5 hours to write well.

---

## Tier 2 — write after Tier 1, lower priority but still on-target

### `arena-vs-pinterest.md` — Two source platforms, one normalization layer

**Hook:** What Are.na's data shape looks like, what Pinterest's data shape looks like, what Mare normalizes them into, and what the Chrome extension fills in.

**Argument:** Are.na is structured around blocks-and-channels (small, deliberate, often with text). Pinterest is structured around pins-and-boards (large, casual, mostly visual). Mare's internal data shape has to absorb both without losing what each source brings. The Chrome extension covers the long tail (what users were going to capture from neither, but want in the same archive). Designing the normalization layer was the most under-the-hood interesting product decision in the ingestion path.

**Why useful:** Shows data engineering / API integration thinking. Less ML-flavored than Tier 1 but useful for product-engineering-heavy roles where "integrate with N external systems" is part of the job.

**Assets:** Could work without screenshots. A simple before-and-after diagram showing Are.na block → normalized Mare item, Pinterest pin → normalized Mare item.

**Difficulty:** Medium. ~3 hours.

---

### `modal-for-llm-serving.md` — Why Mare's LLM service is its own deployment

**Hook:** The Modal LLM service is intentionally a separate deployment from the main API on Cloud Run. This is so GPU spend can be sized and rolled independently from request-path traffic. Explain why coupling them was the obvious naive choice, why we went the other way, and what tradeoffs that opens up.

**Argument:** Bundling LLM serving into the API container means GPU and CPU pools are tied together. Scale up traffic, you scale up GPU cost even when most requests don't need a model. Splitting them lets each service size to its own load curve. The cost is more deployment surface, more inter-service auth, and one more thing to monitor. For an AI-tool product the tradeoff is correct.

**Why useful:** Direct infra signal for "cost-aware AI eng" — exactly what AI-creative-tool startups are scaling into right now (some of them are spending half their VC money on inference).

**Assets:** Architecture diagram (web + API on Cloud Run + Modal LLM service as separate). Could be one image.

**Difficulty:** Medium. ~3 hours.

---

### `quest-3-multi-device-sync.md` — Real-time sync across devices in a gallery installation

**Hook:** Date 0:0 is a mixed-reality + VR installation built for standalone Quest 3, where multiple visitors share a world state across devices. NoSQL real-time sync makes that work. Plus the asset memory optimization (60% reduction at stable 90 FPS) and the physical → MR → VR transition design.

**Argument:** Multi-device VR installations have an under-appreciated systems problem: keeping persistent environment state synchronized across headsets while not blowing the standalone device's memory budget. This piece walks through the architecture and the tradeoffs.

**Why useful:** XR-flavored writeup. Specifically valuable if you keep XR as a signal you want to continue having (Vision Pro creative tools, Spline / Rive 3D-flavored AI startups). Less central if you're moving fully to web product.

**Assets:** Photo or short clip of the installation in use. Architecture diagram showing the device-sync layer. Asset optimization comparison if you have memory profiles before/after.

**Difficulty:** Medium-high. The work is recent and you have the details fresh.

---

## Tier 3 — interesting but lower job-search-leverage

These are worth considering only if you want the writing layer to also reflect your art / older work. Don't write these *before* the Tier 1 pieces.

- **`neeeu-shader-work.md`** — Custom shaders for Meta Spark, halving rendering time on a BMW AR campaign. Older (2023), commercial. Shows shader chops but it's been a while.
- **`electronicos-fantasticos-instruments.md`** — Building electromagnetic instruments from obsolete electronics for Ei Wada's ensemble, including the Fuji Rock 2022 performance. Pure art-tech / fabrication. Not on-target for AI tools roles, but a strong piece for creative-tech-curious readers.
- **`callback-leaderboard-growth.md`** — How the leaderboard at Callback grew WAU 25 → 250 in three months. Lighter / more product-focused, less technical depth. Could be 600 words, max.
- **`land-process.md`** — How LAND (Ars Electronica) came together. Process-of-making writeup, art-leaning.

---

## Conventions to follow for all writeups

- 800–1500 words. Anything shorter doesn't earn its place; anything longer should be split.
- One screenshot or diagram minimum. Pure text writeups get skimmed.
- Frontmatter block matches the format in `three-clustering-modes.md` (title, author, date, description, tags).
- Voice rules from `portfolio-site-brief.md`: first-person factual, concrete components not vague verbs, no rule-of-three rhetoric, no em-dash overuse, no AI tells (`leverage`, `seamless`, `vibrant`, `tapestry`).
- Each writeup needs to be **linkable individually** so it can be pasted into a cold email or LinkedIn DM as the "concrete artifact." That's the primary use case, more than blog readership.
- Cross-link to `/projects/mare` (or wherever the relevant case study lives) so readers can go deeper.
- Don't write pitch-deck content. Don't write academic content. Write like you're explaining a decision to a peer engineer over coffee, but tighter.

---

## Order to ship in (recommended)

1. ✅ `three-clustering-modes.md` (drafted, needs screenshots)
2. `unclustered-rail.md` (pairs with #1, same screenshots can do double duty)
3. `cloud-tasks-migration.md` (different dimension — infra not product UI; gives the writeup layer dimensional spread)
4. Pause. Get feedback from the first three. See if cold outreach using them gets responses.
5. `hybrid-embeddings.md` if the response suggests ML signal is what's getting traction.
6. Tier 2 pieces as needed.

The point of pausing after three is that the writeup layer is a hypothesis: "publishing engineering writeups gets me hiring-manager attention at AI creative-tool startups." Three is enough to test that hypothesis. If it works, write more. If it doesn't get traction, the bottleneck is somewhere else (target list, outreach approach, cold-email subject lines), and writing more pieces won't fix it.
