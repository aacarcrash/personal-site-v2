# AI Video Infra — verified engineering claims

Source repo: `D:\DocumentsD\cs-projects\AI Video Infra Models` (sibling, not
part of this site). It is the pipeline behind the `latent-space` project
("I only experience things in latent space now.").

This file exists so the engineering material is not re-derived every time it
is needed for copy, a CV line, or an interview. Everything below was read out
of the actual code on 2026-08-20, not from the repo's own summary docs, with
file:line evidence. **The "Do not claim" section at the bottom is the
important half.**

## What the system is

Four AI video models run over clips and produce visualisations of how each
model "sees" the footage. A Gradio orchestrator plus a CLI drive them.
Everything runs on one 3070 Laptop, 8GB VRAM, 32GB system RAM, Windows 11.

- SEA-RAFT (Princeton) — optical flow
- Video-Depth-Anything (ByteDance) — depth
- CoTracker3 (Meta) — point tracking
- DINOv3 / DINOv2 — self-supervised features

Throughput: 9 visualisations per clip, ~17-25 min GPU each, ~3-5 hours for a
folder of 14 clips (`HANDOFF.md:320-340`).

## Verified claims, strongest first

### 1. VRAM handoff between two models that will not co-reside

`co-tracker/seeding.py:33-99`. Flow runs first to find where motion actually
is, seeds the tracker from those pixels rather than a blind grid, then the
flow model is deleted and `torch.cuda.empty_cache()` is called before the
tracker loads (`:85-87`) — both will not fit in 8GB. Falls back to
`grid_seeds` on empty result or any exception (`:88-99`).

Best single illustration of constraint-driven design. Also cross-model
integration: `_ensure_seafraft_path` injects the sibling repo and its `core/`
into `sys.path` so CoTracker can import RAFT (`:34-38`).

### 2. Subprocess isolation across four incompatible environments

`orchestrator/effects.py:37-40` holds four separate `.venv/Scripts/python.exe`
paths. Python 3.10 / 3.11 / 3.12 and CUDA cu121 / cu128 / cu130 across the
four models. `ARCHITECTURE.md:29-33` states the principle: the orchestrator
never imports anything from the model venvs. One `Popen` chokepoint
(`effects.py:99-113`), one dispatch table (`:591-598`).

This is the standard real answer to ML dependency hell, and it is the same
shape as a container/Modal port — which is costed and deliberately deferred.

### 3. Bounded-memory streaming rewrite

`seeding.py:102-176` (`track_online`). Migrated CoTracker offline → online
because offline loaded the whole clip as one tensor and OOMed past ~5s at 8GB
(`CHANGES_FROM_ORIGINAL.md:79-81`). Frames stay on CPU; each stride moves only
the last `step*2` frames to GPU (`:126-136`). Ragged tail handled explicitly
(`:158-161`). VRAM is bounded by the ~16-frame window, not clip length.

Non-obvious related finding: downscaling CoTracker's input makes things
*worse*, because it upsamples back toward native ~512p. The correct knob is
frame count, not resolution (`effects.py:406-409`).

### 4. Amortising one inference across many outputs

- SEA-RAFT: one RAFT forward per frame pair (`flow_arrows.py:271`) feeds six
  renderers writing into a dict of `cv2.VideoWriter`s opened up front
  (`:244-253`); trails fan out to two modes, so 7 files from one pass. Only
  `standard` is upstream; the rest are custom renderers.
- Depth `-dual`: one inference writes both MAGMA and grayscale via an
  `--also-gray` flag added to ByteDance's entry point
  (`CHANGES_FROM_ORIGINAL.md:53-66`), with matching rename logic
  (`effects.py:358-377`). Halves wall time for the common two-output case.

### 5. Restart-safety by construction, at three granularities

- Whole job: expected output filenames predicted, then skipped if present
  (`run.py:210-224`, `:172-177`).
- Per visualisation: inside one model run, asks SEA-RAFT to render only the
  missing outputs, skipping inference entirely if all are cached
  (`effects.py:209-251`).
- Per segment: `depth_chunked.py:86-88, 162-164, 193`.

`overnight_run.ps1:59-88` restarts on any nonzero exit and resumes exactly
where it stopped. No status DB, so no bookkeeping state to corrupt.

### 6. Memory model, measured, and the chunk size derived from it

Depth RAM ≈ **3.7GB per 1,000 frames + ~2.5GB baseline** at 720×406, bound by
frame count rather than duration, because the model's global scale/shift
alignment holds every frame at once. Fast to ~7,000 frames, thrashes to
~13,000, crashes beyond (`HANDOFF.md:193-206`). `FRAMES_PER_SEG = 2200` in
`depth_chunked.py:48-50` comes from that budget. Segment boundaries use
`-force_key_frames expr:gte(t,n_forced*seg_time)` so every frame is preserved
once (`:113-136`).

A crash was root-caused to a *system-managed* pagefile that could not grow
fast enough mid-allocation (a 5.8MB request refused while 22GB was tied up).
Fixed with a fixed 24GB pagefile on D:. Knowing that a bigger pagefile moves
the crash line without enlarging the fast zone — because physical RAM caps
that — is the sophisticated part.

### 7. Watchdog, plus the buffering bug that makes watchdogs wrong

`effects.py:122-144`: watchdog thread with a mutable `last_activity`
timestamp, killing on either a cancel event or `idle_timeout_s` of stdout
silence. `effects.py:79-84` sets `PYTHONUNBUFFERED=1` **because** pipe
block-buffering would otherwise make a healthy long-running child look hung.
`ARCHITECTURE.md:361-371` turns it into a contract for adding new models.

Most people write the watchdog and never find the false-kill mode.

### 8. Temporal consistency in the PCA visualisation

`dinov3/pca_vis.py:58-83`: PCA fit once on tokens sampled with `np.linspace`
across up to 200 frames, then that single basis projects every frame
(`:167`). A per-frame PCA would flip sign and colour every frame. This is the
anti-flicker work, and it is legible to non-technical readers too.

### 9. Reading a model's uncertainty head, not just its output

`flow_arrows.py:215-232`. SEA-RAFT's `info` tensor encodes a 2-mixture Laplace
per pixel; the two log-b (scale) channels are averaged into an uncertainty
map, blurred to kill block striping, then percentile-clipped at p40/p99 with
gamma 2.0, because plain min-max "stretches small log-b differences into
near-uniform bright orange" (`:227-231`). Every constant has a written reason.

### 10. Graceful degradation instead of dying

`attention_vis.py:175-182`, `pca_vis.py:148-155`: catch
`torch.cuda.OutOfMemoryError`, set a sticky `oom_720p` flag, empty cache,
retry downscaled, and write a black frame as a last resort rather than
killing a multi-hour run.

### 11. Judgment — optimisations rejected in writing

`HANDOFF.md:376-388`. TensorRT (2-3× but per-resolution AOT engines, "worth
it for a production service, not for a film"); Triton on Windows (unstable
community port, 5-15% on one model only); caching flow tensors (~2GB/clip
disk, chose per-viz auto-skip instead); CoTracker offline (length-bounded by
design). `--compile` is opt-in and wrapped in try/except because it fails
silently on Windows.

Hiring managers often value this more than the optimisations that shipped.

## Secondary

- Cancel and pause are two `threading.Event`s with different semantics: cancel
  kills the live subprocess, pause blocks only *between* jobs, because a CUDA
  process cannot be safely suspended mid-inference (`gui.py:601-604, 360-364`).
- Observability: log tail capped at 20KB per yield after multi-hour runs grew
  MB-scale payloads and dropped the WebSocket; poll interval 0.8s → 2.0s;
  thumbnail rescan moved off the hot loop (`gui.py:59-73, 310-312, 449`).
- Output contract: each model writes to a UUID-tagged temp name, then
  `shutil.move` into place only on rc==0 (`effects.py:419-420, 442-452`).
- Per-model I/O quirks normalised in one layer: SEA-RAFT writes hardcoded
  names to CWD, CoTracker writes next to its *input*, VDA emits a junk
  `_src.mp4` that gets unlinked (`effects.py:202-204, 353-357, 382-385`).
- Windows encoding hardened in three places (parent stdio reconfigure,
  `Popen(encoding="utf-8")`, `PYTHONIOENCODING` in child env) against cp1252
  crashes on non-Latin filenames.
- Background mode: `BELOW_NORMAL_PRIORITY_CLASS` plus a per-batch throttle,
  costing ~30-40% throughput to keep the machine usable.
- Known defect, documented honestly: depth segments are normalised
  independently so seams can pop; accepted for artistic use, mitigated by
  keeping segments large (`depth_chunked.py:15-18`).

## Do not claim

These will collapse under a follow-up question.

- **"Parallel" or "concurrent" pipeline.** It is strictly serial by design.
  The queue is a nested for-loop; no scheduler, no worker pool, no
  backpressure. The only real concurrency is three threads (generator,
  worker, watchdog). Correct framing: serialisation discipline and process
  supervision.
- **"~5-10× speedup"** on the trajectory render. That number is a code
  comment (`cotracker_trajectories.py:53-54`), never benchmarked. Describe
  the mechanism instead: bounds and jump-length filtering batched in numpy,
  only valid segments entering the draw loop.
- **"Fully vectorised."** `render_uncertainty` is still a Python per-point
  loop (`cotracker_uncertainty.py:41-48`), and the trajectory render still
  loops over survivors at `:79`.
- **"Atomic" file moves.** It is temp-name-then-rename on success, and
  cross-device moves fall back to copy.
- **Any model or architecture work.** RAFT, CoTracker, DINOv3 and VDA cores
  are untouched and explicitly off-limits
  (`CHANGES_FROM_ORIGINAL.md:198-204`). What is his: the orchestrator, the
  entry-point edits, and the visualisation renderers — graphics work on top
  of upstream tensors, which is a fair claim, but it is not model work.
- **Tests or CI.** `ARCHITECTURE.md:415`: "There's no test suite."
  Verification is a manual 4-step flow.
- **The Gradio layer as clean architecture.** Its knob wiring is
  admitted-fragile positional unpacking that silently swaps values if
  mis-ordered (`ARCHITECTURE.md:320-322`). Showcase `effects.py` and
  `depth_chunked.py` instead.
- **Conflating the two "uncertainty" outputs.** SEA-RAFT's is a real
  predicted scale parameter. CoTracker's is boolean visibility splatted at
  1.0/0.3 (`cotracker_uncertainty.py:47`) — an aesthetic choice, not a
  calibrated confidence.
- **Colormap, gamma and percentile choices** are artistic tuning. Frame them
  as taste with documented reasoning, not as novelty.

## Open question — authorship

Line-by-line authorship could not be verified for `flow_arrows.py`,
`attention_vis.py`, and `pca_vis.py`. `CHANGES_FROM_ORIGINAL.md:79-81` says
the CoTracker files were "rewritten substantially" and refers to a
pre-handoff state and an earlier agent; several docs are written for "future
agents". **Confirm with Aakarsh before any first-person "I wrote this" claim
on the visualisation code.** Nothing currently on the site makes that claim.

## Where this is used

- `content/projects.json`, `latent-space` → the two-paragraph Process block.
  Deliberately carries only claims 1-6, at prose density.
- Not yet used anywhere: the pagefile root-cause (6), the watchdog/buffering
  bug (7), and the rejected-optimisation reasoning (11). These are the
  strongest interview and CV material in the list.
- The sidebar `tools` list for `latent-space` does not yet name the four
  models, so a recruiter scanning the stack column will not see them.
