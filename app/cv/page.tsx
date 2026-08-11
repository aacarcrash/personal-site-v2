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
        className="page-gutter"
        style={{
          flex: 1,
          paddingTop: "32px",
          paddingBottom: 0,
          maxWidth: "920px",
          width: "100%",
        }}
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
              <div
                key={year}
                style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--step-data)",
                    lineHeight: "var(--lh-data)",
                    fontWeight: 500,
                    color: "var(--text-muted)",
                    width: "60px",
                    flexShrink: 0,
                    paddingTop: "2px",
                  }}
                >
                  {year}
                </span>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    flex: 1,
                    minWidth: "200px",
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
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--step-label)",
          lineHeight: "var(--lh-label)",
          fontWeight: 500,
          color: "var(--text-muted)",
          letterSpacing: "1.5px",
          textTransform: "uppercase",
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

function CvRow({
  entry,
  compact = false,
}: {
  entry: CvRole;
  compact?: boolean;
}) {
  return (
    <article
      style={{
        display: "flex",
        flexDirection: "column",
        gap: compact ? "4px" : "10px",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <h3
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: compact ? "var(--step-lead)" : "var(--step-title)",
              lineHeight: compact ? "var(--lh-lead)" : "var(--lh-title)",
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
          <div style={{ display: "flex", gap: "10px", alignItems: "baseline" }}>
            {entry.projectLink ? (
              // Project page — pointer cursor only, no underline. Takes
              // precedence over an external org link when both exist.
              <Link
                href={entry.projectLink}
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "var(--step-sm)",
                  lineHeight: "var(--lh-sm)",
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
                  fontSize: "var(--step-sm)",
                  lineHeight: "var(--lh-sm)",
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
                  fontSize: "var(--step-sm)",
                  lineHeight: "var(--lh-sm)",
                  color: "var(--text-secondary)",
                }}
              >
                {entry.org}
              </span>
            )}
            {entry.location && (
              <>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--step-label)",
                    color: "var(--text-subtle)",
                  }}
                >
                  ·
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--step-data)",
                    lineHeight: "var(--lh-data)",
                    color: "var(--text-muted)",
                  }}
                >
                  {entry.location}
                </span>
              </>
            )}
          </div>
        </div>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--step-data)",
            lineHeight: "var(--lh-data)",
            color: "var(--text-muted)",
            whiteSpace: "nowrap",
          }}
        >
          {entry.date}
        </span>
      </header>
      {entry.bullets && (
        <ul
          style={{
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            paddingLeft: "0",
          }}
        >
          {entry.bullets.map((b, i) => (
            <li
              key={i}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--step-sm)",
                color: "var(--text-secondary)",
                lineHeight: "var(--lh-sm)",
                paddingLeft: "16px",
                position: "relative",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: "0",
                  top: "0.7em",
                  width: "8px",
                  height: "1px",
                  background: "var(--text-muted)",
                }}
                aria-hidden
              />
              {b}
            </li>
          ))}
        </ul>
      )}
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
            fontSize: "var(--step-lead)",
            lineHeight: "var(--lh-lead)",
            color: "var(--text)",
            fontStyle: "italic",
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
    <li
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: "16px",
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          flex: 1,
          minWidth: "200px",
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
            fontStyle: "italic",
          }}
        >
          {press.outlet}
        </span>
      </div>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--step-meta)",
          lineHeight: "var(--lh-meta)",
          color: "var(--text-muted)",
          whiteSpace: "nowrap",
        }}
      >
        {press.date}
      </span>
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
      <dt
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--step-label)",
          lineHeight: "var(--lh-label)",
          fontWeight: 500,
          color: "var(--text-muted)",
          letterSpacing: "1px",
          textTransform: "uppercase",
        }}
      >
        {category}
      </dt>
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
