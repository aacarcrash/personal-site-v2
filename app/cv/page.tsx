import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  experience,
  shows,
  residencies,
  teaching,
  press,
  education,
  awards,
  skills,
  type CvRole,
  type CvShow,
  type CvPress,
  type CvAward,
} from "@/data/cv";

export const metadata = {
  title: "CV",
  description:
    "Full CV of Aakarsh Singh — product engineer and new media artist: experience, exhibitions, performances, teaching, residencies, press, and education.",
  alternates: { canonical: "/cv" },
};

// Group shows by year for the "Selected Exhibitions" section
function groupShowsByYear(
  items: CvShow[],
): { year: string; items: CvShow[] }[] {
  const map = new Map<string, CvShow[]>();
  for (const s of items) {
    const arr = map.get(s.year) ?? [];
    arr.push(s);
    map.set(s.year, arr);
  }
  return Array.from(map.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([year, items]) => ({ year, items }));
}

export default function CvPage() {
  const showsByYear = groupShowsByYear(shows);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Header />
      <main
        className="cv-main"
        style={{ flex: 1, paddingTop: "32px", paddingBottom: 0, width: "100%" }}
      >
        {/* Header + dual PDF download */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "48px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(32px, 8vw, var(--step-h1))",
              color: "var(--text)",
              letterSpacing: "-0.8px",
            }}
          >
            CV
          </h1>
          <div style={{ display: "flex", gap: "20px", alignItems: "baseline" }}>
            <a
              href="/Aakarsh_Singh_Resume_2026.pdf"
              target="_blank"
              rel="noopener noreferrer"
              style={pdfLinkStyle}
              className="link-underline"
            >
              Resume (tech) ↓
            </a>
            <a
              href="/Aakarsh_Singh_Artist_CV.pdf"
              target="_blank"
              rel="noopener noreferrer"
              style={pdfLinkStyle}
              className="link-underline"
            >
              Artist CV ↓
            </a>
          </div>
        </header>

        <CvSection title="Experience">
          {experience.map((e, i) => (
            <CvRow key={i} entry={e} />
          ))}
        </CvSection>

        <CvSection title="Selected Exhibitions, Performances & Screenings">
          <div
            style={{ display: "flex", flexDirection: "column", gap: "32px" }}
          >
            {showsByYear.map(({ year, items }) => (
              <div key={year} className="cv-row">
                <CvRail line1={year} />
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  {items.map((s, i) => (
                    <ShowRow key={i} show={s} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CvSection>

        <CvSection title="Teaching">
          {teaching.map((e, i) => (
            <CvRow key={i} entry={e} />
          ))}
        </CvSection>

        <CvSection title="Residencies & Professional Development">
          {residencies.map((e, i) => (
            <CvRow key={i} entry={e} compact />
          ))}
        </CvSection>

        <CvSection title="Press & Publications">
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {press.map((p, i) => (
              <PressRow key={i} press={p} />
            ))}
          </ul>
        </CvSection>

        <CvSection title="Education">
          {education.map((e, i) => (
            <CvRow key={i} entry={e} />
          ))}
        </CvSection>

        {/* <CvSection title="Honors & Awards">
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {awards.map((a, i) => <AwardRow key={i} award={a} />)}
          </ul>
        </CvSection> */}

        <CvSection title="Skills">
          <dl className="cv-skills">
            {skills.map((s, i) => (
              <SkillRow key={i} category={s.category} items={s.items} />
            ))}
          </dl>
        </CvSection>
      </main>
      <Footer />
    </div>
  );
}

const pdfLinkStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--step-meta)",
  lineHeight: "var(--lh-meta)",
  color: "var(--text-secondary)",
};

function CvSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: "56px" }}>
      <h2
        className="eyebrow"
        style={{
          marginBottom: "20px",
          paddingBottom: "12px",
          borderBottom: "0.5px solid var(--border)",
        }}
      >
        {title}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        {children}
      </div>
    </section>
  );
}


/**
 * Long-form dates shortened for the rail only.
 *
 * content/cv.json keeps the full month names on purpose — it is one of two
 * hand-synced CV sources (the other is latex-src/*.tex for the PDF), and
 * shortening the data would make the two disagree. This shortens the
 * DISPLAY, so the rail reads as data without touching the record.
 *
 *   "January 2026 — Present"        -> "Jan 2026 —"
 *   "August 2025 — December 2025"   -> "Aug — Dec 2025"
 *   "September 2020 — January 2021" -> "Sep 2020 — Jan 2021"
 *   "July 2025"                     -> "Jul 2025"
 */
const MONTHS =
  /\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/g;

function compactDate(value: string): string {
  const short = value.replace(MONTHS, (m) => m.slice(0, 3));
  // Ranges use an em dash in the data; accept a hyphen too.
  const parts = short.split(/\s*[—–-]\s*/);
  if (parts.length !== 2) return short;
  const [from, to] = parts;
  if (/present/i.test(to)) return `${from} —`;
  const fromYear = from.match(/\d{4}$/)?.[0];
  const toYear = to.match(/\d{4}$/)?.[0];
  // Same year on both ends: print it once, at the end.
  if (fromYear && fromYear === toYear) {
    return `${from.replace(/\s*\d{4}$/, "")} — ${to}`;
  }
  return `${from} — ${to}`;
}

// Dated rail: 200px mono column shared by every row (experience, exhibitions,
// press). Three steps of hierarchy run across the whole entry —
// title 24 display > company 16 sans > rail 13 mono — and the rail carries
// its own second step: the date in --text, the location a tier below it in
// --text-muted. At --step-meta against a 24px title the jump was 2x and
// the rail read as fine print.
//
// The location was --text-disabled, which is 3.3:1 on --bg and fails AA. That
// token is reserved for ink that CANNOT be interacted with; a location is
// static metadata and reads at --text-muted (6.3:1), the same tier every other
// date, tag and eyebrow on the site uses. 17 lines were affected.
function CvRail({ line1, line2 }: { line1: string; line2?: string }) {
  return (
    <div
      className="cv-rail"
      style={{
        width: "200px",
        flexShrink: 0,
        paddingTop: "6px",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--step-data)",
          lineHeight: "var(--lh-data)",
          color: "var(--text)",
        }}
      >
        {compactDate(line1)}
      </span>
      {line2 && (
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--step-data)",
            lineHeight: "var(--lh-data)",
            color: "var(--text-muted)",
          }}
        >
          {line2}
        </span>
      )}
    </div>
  );
}

// Bullet list with open-ring markers (5px circle, 1px border, transparent
// fill) in a fixed 22px column, aligned to the first line of each bullet.
function CvBullets({ items }: { items: string[] }) {
  return (
    <ul
      style={{
        listStyle: "none",
        padding: 0,
        margin: 0,
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      {items.map((b, i) => (
        <li key={i} style={{ display: "flex" }}>
          <span
            aria-hidden
            style={{
              width: "22px",
              flexShrink: 0,
              display: "flex",
              paddingTop: "0.6em",
            }}
          >
            <span
              style={{
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                border: "1px solid var(--text-muted)",
                background: "transparent",
              }}
            />
          </span>
          <span
            style={{
              flex: 1,
              minWidth: 0,
              fontFamily: "var(--font-sans)",
              fontSize: "var(--step-base)",
              lineHeight: "var(--lh-base)",
              color: "var(--text-secondary)",
            }}
          >
            {b}
          </span>
        </li>
      ))}
    </ul>
  );
}

function CvRow({
  entry,
  compact = false,
}: {
  entry: CvRole;
  compact?: boolean;
}) {
  return (
    <article className="cv-row">
      <CvRail line1={entry.date} line2={entry.location} />
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: compact ? "4px" : "10px",
        }}
      >
        <h3
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "var(--step-title)",
            lineHeight: "var(--lh-title)",
            color: "var(--text)",
            letterSpacing: "-0.3px",
          }}
        >
          {entry.projectLink ? (
            // Pointer cursor only — no underline.
            <Link href={entry.projectLink} style={{ color: "inherit", textDecoration: "none", cursor: "pointer" }}>
              {entry.title}
            </Link>
          ) : (
            entry.title
          )}
        </h3>
        {entry.projectLink ? (
          // Project page — pointer cursor only, no underline. Takes
          // precedence over an external org link when both exist.
          <Link
            href={entry.projectLink}
            style={{
              fontFamily: "var(--font-sans)",
              /* The middle step: title 24 display > company 16 sans > rail
                 13 mono. It keeps the SANS deliberately — a company is a
                 name, not data, and the family change is what separates it
                 from the rail rather than making it a second rail line. */
              fontSize: "var(--step-base)",
              lineHeight: "var(--lh-base)",
              color: "var(--text-secondary)",
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            {entry.org}
          </Link>
        ) : entry.link ? (
          <a
            href={entry.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "var(--font-sans)",
              /* The middle step: title 24 display > company 16 sans > rail
                 13 mono. It keeps the SANS deliberately — a company is a
                 name, not data, and the family change is what separates it
                 from the rail rather than making it a second rail line. */
              fontSize: "var(--step-base)",
              lineHeight: "var(--lh-base)",
              color: "var(--text-secondary)",
            }}
            className="link-underline"
          >
            {entry.org}
          </a>
        ) : (
          <span
            style={{
              fontFamily: "var(--font-sans)",
              /* The middle step: title 24 display > company 16 sans > rail
                 13 mono. It keeps the SANS deliberately — a company is a
                 name, not data, and the family change is what separates it
                 from the rail rather than making it a second rail line. */
              fontSize: "var(--step-base)",
              lineHeight: "var(--lh-base)",
              color: "var(--text-secondary)",
            }}
          >
            {entry.org}
          </span>
        )}
        {entry.bullets && <CvBullets items={entry.bullets} />}
      </div>
    </article>
  );
}

function ShowRow({ show }: { show: CvShow }) {
  const body = (
    <>
      <div
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "baseline",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "var(--step-title)",
            lineHeight: "var(--lh-title)",
            letterSpacing: "-0.3px",
            color: "var(--text)",
          }}
        >
          {show.title}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--step-meta)",
            lineHeight: "var(--lh-meta)",
            color: "var(--text-muted)",
          }}
        >
          ({show.kind})
        </span>
      </div>
      <span
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "var(--step-sm)",
          lineHeight: "var(--lh-sm)",
          color: "var(--text-secondary)",
        }}
      >
        {show.venue}
        <span style={{ color: "var(--text-muted)" }}> · {show.location}</span>
      </span>
    </>
  );

  const stack: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "4px" };

  return (
    <li style={stack}>
      {show.link ? (
        // Links to the related project page. Pointer cursor only — no underline.
        <Link href={show.link} style={{ ...stack, textDecoration: "none", color: "inherit", cursor: "pointer" }}>
          {body}
        </Link>
      ) : (
        body
      )}
    </li>
  );
}

function PressRow({ press }: { press: CvPress }) {
  return (
    <li className="cv-row">
      <CvRail line1={press.date} />
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}
      >
        {press.link ? (
          <a
            href={press.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--step-base)",
              lineHeight: "var(--lh-base)",
              color: "var(--text)",
            }}
            className="link-underline"
          >
            “{press.title}”
          </a>
        ) : (
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--step-base)",
              lineHeight: "var(--lh-base)",
              color: "var(--text)",
            }}
          >
            “{press.title}”
          </span>
        )}
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--step-sm)",
            lineHeight: "var(--lh-sm)",
            color: "var(--text-secondary)",
          }}
        >
          {press.outlet}
        </span>
      </div>
    </li>
  );
}

function AwardRow({ award }: { award: CvAward }) {
  return (
    <li
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: "16px",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "var(--step-base)",
          lineHeight: "var(--lh-base)",
          color: "var(--text-secondary)",
        }}
      >
        {award.name}
      </span>
      {award.date && (
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--step-data)",
            lineHeight: "var(--lh-data)",
            color: "var(--text-muted)",
          }}
        >
          {award.date}
        </span>
      )}
    </li>
  );
}

function SkillRow({ category, items }: { category: string; items: string }) {
  return (
    <>
      <dt className="eyebrow">{category}</dt>
      <dd
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "var(--step-sm)",
          color: "var(--text-secondary)",
          margin: 0,
          lineHeight: "var(--lh-sm)",
        }}
      >
        {items}
      </dd>
    </>
  );
}
