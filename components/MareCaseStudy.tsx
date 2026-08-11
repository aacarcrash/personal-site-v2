"use client";

// Bespoke Mare case study. Forked from the shared CaseStudy.tsx so Mare's layout
// (three-column enrichment row, full-width justified pairs, a shared arrow/keyboard
// lightbox over all decision images, and the onboarding grid) can evolve without
// touching callback/neeeu. Copy + captions + aspect ratios still come from
// content/projects.json via `data.caseStudy`; this file owns layout only.

import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import { useLightbox, LightboxShell } from "./Lightbox";
import type { CaseStudy as CaseStudyData, CaseStudyDecision } from "@/data/types";

// ─── Two image versions ──────────────────────────────────────────────────────
// Flip to "mock" to preview the clean Paper-mockup set (public/images/mare-mock/,
// same filenames). "real" uses the actual product screenshots. Everything on the
// page swaps together because both hero and decisions resolve paths through img().
const IMAGE_SET: "real" | "mock" = "real";
function img(src: string): string {
  return IMAGE_SET === "mock" ? src.replace("/images/mare/", "/images/mare-mock/") : src;
}

// Onboarding flow slides, in narrative order (exported from the Paper file).
const ONBOARDING: { src: string; caption: string }[] = [
  { src: "/images/mare-onboarding/01.png", caption: "Welcome — Mare is an ecosystem where your references come to life." },
  { src: "/images/mare-onboarding/02.png", caption: "More than \"office interior photo\" — the knowledge behind a reference." },
  { src: "/images/mare-onboarding/03.png", caption: "Let Mare guide your curiosity — the artist behind the image." },
  { src: "/images/mare-onboarding/04.png", caption: "Because we understand: organize, learn, inspire." },
  { src: "/images/mare-onboarding/05.png", caption: "Talk to your whole collection." },
  { src: "/images/mare-onboarding/06.png", caption: "See your collection's shape — every item finds its place." },
  { src: "/images/mare-onboarding/07.png", caption: "Everything you find, finally understood — drop your first items." },
];

function Label({ children }: { children: ReactNode }) {
  return (
    <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--text-secondary)", letterSpacing: "1px", textTransform: "uppercase" }}>
      {children}
    </span>
  );
}

function DecisionText({ d, measure = "62ch" }: { d: CaseStudyDecision; measure?: string }) {
  return (
    <>
      <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "22px", color: "var(--text)", letterSpacing: "-0.2px" }}>{d.title}</h3>
      <p style={{ fontFamily: "var(--font-sans)", fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: measure }}>{d.body}</p>
    </>
  );
}

/** Bespoke case-study thumbnail: next/image at quality 90, softened chrome (no
 *  dark frame, no black focus ring), opens the shared gallery lightbox on click. */
function Thumb({ src, alt, ar, sizes, onOpen, priority }: {
  src: string; alt: string; ar: number | string; sizes: string; onOpen: () => void; priority?: boolean;
}) {
  return (
    <button type="button" onClick={onOpen} aria-label={`Expand image: ${alt}`} className="mcs-thumb" style={{ aspectRatio: String(ar) }}>
      <Image src={img(src)} alt={alt} fill sizes={sizes} quality={90} priority={priority} style={{ objectFit: "contain" }} />
    </button>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────

export function MareCaseStudyHero({ data }: { data: CaseStudyData }) {
  const lb = useLightbox(1);
  if (!data.heroImage) return null;
  const src = data.heroImage;
  return (
    <div style={{ padding: "40px 0 0" }}>
      <div style={{ maxWidth: 980, marginInline: "auto" }}>
        <Thumb src={src} alt={data.heroCaption ?? "Product hero"} ar="2 / 1" priority sizes="(max-width: 1000px) 100vw, 980px" onOpen={() => lb.openAt(0)} />
      </div>
      <AnimatePresence>
        {lb.open !== null && (
          <LightboxShell index={0} count={1} caption={data.heroCaption} onClose={lb.close} onNext={lb.next} onPrev={lb.prev}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img(src)} alt={data.heroCaption ?? "Product hero"} style={lightboxImg} />
          </LightboxShell>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Decisions + onboarding ────────────────────────────────────────────────────

type Shot = { src: string; caption?: string; alt: string };

export function MareCaseStudyDecisions({ data }: { data: CaseStudyData }) {
  const decisions = data.decisions;

  // Flatten every decision image (in visual order) into one navigable set, and
  // index them by src so each thumbnail can open the lightbox at its own slot.
  const shots: Shot[] = [];
  const at: Record<string, number> = {};
  for (const d of decisions) {
    if (d.images?.length) {
      for (const im of d.images) { at[im.src] = shots.length; shots.push({ src: im.src, caption: im.caption, alt: im.caption ?? d.title }); }
    } else if (d.image) {
      at[d.image] = shots.length; shots.push({ src: d.image, caption: d.imageCaption, alt: d.imageCaption ?? d.title });
      for (const s of d.stack ?? []) { at[s.src] = shots.length; shots.push({ src: s.src, caption: s.caption, alt: s.caption ?? d.title }); }
    }
  }

  const lb = useLightbox(shots.length);
  const ob = useLightbox(ONBOARDING.length);

  if (decisions.length === 0) return null;

  const dImport = decisions.find((d) => d.images?.length);
  const dEnrich = decisions.find((d) => d.stack?.length);
  // The remaining single-image decisions, paired two-up in order (lenses+soft, hierarchy+infra).
  const singles = decisions.filter((d) => d.image && !d.stack?.length && !d.images?.length);
  const pairs: CaseStudyDecision[][] = [];
  for (let i = 0; i < singles.length; i += 2) pairs.push(singles.slice(i, i + 2));

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "40px", padding: "56px 0 16px" }}>
      {data.decisionsLabel ? <Label>{data.decisionsLabel}</Label> : null}

      <div style={{ display: "flex", flexDirection: "column", gap: "56px" }}>
        {/* Row 1 — import: a justified strip of three shots, text flush right. */}
        {dImport?.images?.length ? (
          // Text first in the DOM (so the heading leads on mobile), flipped on
          // desktop so the images read left-to-right and the text sits right.
          <div className="mcs-fullrow mcs-fullrow--flip">
            <div className="mcs-fullrow-text"><DecisionText d={dImport} measure="34ch" /></div>
            <div className="mcs-jrow" style={{ flex: "1 1 0", gap: "40px" }}>
              {dImport.images.map((im) => (
                <div key={im.src} className="mcs-jcell" style={{ "--ar": im.ar } as CSSProperties}>
                  <Thumb src={im.src} alt={im.caption ?? dImport.title} ar={im.ar} sizes="(max-width: 820px) 45vw, 24vw" onOpen={() => lb.openAt(at[im.src])} />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Row 2 — enrichment: [text] [main image] [two small shots stacked]. The
            stacked column's combined height (+ gap) resolves to the main image's
            height because a justified row ends its cells at one shared height. */}
        {dEnrich?.image ? (
          <div className="mcs-fullrow">
            <div className="mcs-fullrow-text"><DecisionText d={dEnrich} measure="34ch" /></div>
            <div className="mcs-jrow" style={{ flex: "1 1 0", gap: "18px", alignItems: "stretch" }}>
              <div className="mcs-jcell" style={{ "--ar": dEnrich.ar ?? 2.04 } as CSSProperties}>
                <Thumb src={dEnrich.image} alt={dEnrich.imageCaption ?? dEnrich.title} ar={dEnrich.ar ?? 2.04} sizes="(max-width: 820px) 100vw, 40vw" onOpen={() => lb.openAt(at[dEnrich.image as string])} />
              </div>
              {/* Narrow accessory column: two small shots pushed to the top and bottom
                  of the main image's height (space-between), so the main image can grow. */}
              <div className="mcs-jcell mcs-stack" style={{ "--ar": 0.67, display: "flex", flexDirection: "column", justifyContent: "space-between" } as CSSProperties}>
                {(dEnrich.stack ?? []).map((s) => (
                  <Thumb key={s.src} src={s.src} alt={s.caption ?? dEnrich.title} ar={s.ar} sizes="(max-width: 820px) 45vw, 14vw" onOpen={() => lb.openAt(at[s.src])} />
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {/* Rows 3 & 4 — justified pairs. Images fill their cells (no 62ch cap) so
            the pair's right edge lands with the rows above; captions fill the cell. */}
        {pairs.map((pair, pi) => (
          <div key={pi} className="mcs-jrow">
            {pair.map((d) => (
              <article key={d.image} className="mcs-jcell" style={{ "--ar": d.ar ?? 1.6, display: "flex", flexDirection: "column", gap: "22px" } as CSSProperties}>
                <Thumb src={d.image as string} alt={d.imageCaption ?? d.title} ar={d.ar ?? 1.6} sizes="(max-width: 820px) 100vw, 44vw" onOpen={() => lb.openAt(at[d.image as string])} />
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <DecisionText d={d} measure="62ch" />
                </div>
              </article>
            ))}
          </div>
        ))}
      </div>

      {/* Onboarding flow — ordered 2-column grid, its own arrow-nav lightbox. */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px", paddingTop: "24px" }}>
        <Label>The onboarding flow</Label>
        <div className="mcs-onboard">
          {ONBOARDING.map((o, i) => (
            <Thumb key={o.src} src={o.src} alt={o.caption} ar="16 / 10" sizes="(max-width: 820px) 100vw, 46vw" onOpen={() => ob.openAt(i)} />
          ))}
        </div>
      </div>

      {/* Decision-image lightbox */}
      <AnimatePresence>
        {lb.open !== null && (
          <LightboxShell index={lb.open} count={shots.length} caption={shots[lb.open].caption} onClose={lb.close} onNext={lb.next} onPrev={lb.prev}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img(shots[lb.open].src)} alt={shots[lb.open].alt} style={lightboxImg} />
          </LightboxShell>
        )}
      </AnimatePresence>

      {/* Onboarding lightbox */}
      <AnimatePresence>
        {ob.open !== null && (
          <LightboxShell index={ob.open} count={ONBOARDING.length} caption={ONBOARDING[ob.open].caption} onClose={ob.close} onNext={ob.next} onPrev={ob.prev}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ONBOARDING[ob.open].src} alt={ONBOARDING[ob.open].caption} style={lightboxImg} />
          </LightboxShell>
        )}
      </AnimatePresence>
    </section>
  );
}

const lightboxImg: CSSProperties = {
  maxWidth: "100%",
  maxHeight: "calc(100vh - 140px)",
  width: "auto",
  height: "auto",
  objectFit: "contain",
  borderRadius: "6px",
  boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
};
