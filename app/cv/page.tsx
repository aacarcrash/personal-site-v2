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
  title: "CV — Aakarsh Singh",
  description:
    "Comprehensive CV: experience, exhibitions, performances, teaching, residencies, press, education, awards.",
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
        style={{
          flex: 1,
          padding: "32px 64px 0",
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
            marginBottom: "16px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "48px",
              color: "var(--text)",
              letterSpacing: "-0.8px",
            }}
          >
            CV
          </h1>
          <div style={{ display: "flex", gap: "20px", alignItems: "baseline" }}>
            <a
              href="/Aakarsh_Singh_Resume_090525.pdf"
              target="_blank"
              rel="noopener noreferrer"
              style={pdfLinkStyle}
            >
              Resume (tech) ↓
            </a>
            <a
              href="/Aakarsh_Singh_Artist_CV.pdf"
              target="_blank"
              rel="noopener noreferrer"
              style={pdfLinkStyle}
            >
              Artist CV ↓
            </a>
          </div>
        </header>
        <p
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "15px",
            color: "var(--text-muted)",
            lineHeight: 1.6,
            marginBottom: "48px",
            maxWidth: "640px",
          }}
        >
          One unified CV — engineering experience, exhibitions, teaching, press,
          and education in a single read. Two PDFs available above for whichever
          genre you need.
        </p>

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
                    fontSize: "13px",
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
                    minWidth: "300px",
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
          <dl
            style={{
              display: "grid",
              gridTemplateColumns: "180px 1fr",
              rowGap: "14px",
              columnGap: "24px",
              margin: 0,
            }}
          >
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
  fontSize: "12px",
  color: "var(--text-secondary)",
  textDecoration: "underline",
  textUnderlineOffset: "3px",
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
          fontSize: "11px",
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
              fontSize: compact ? "18px" : "22px",
              color: "var(--text)",
              letterSpacing: "-0.3px",
            }}
          >
            {entry.title}
          </h3>
          <div style={{ display: "flex", gap: "10px", alignItems: "baseline" }}>
            {entry.link ? (
              <a
                href={entry.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "15px",
                  color: "var(--text-secondary)",
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                }}
              >
                {entry.org}
              </a>
            ) : (
              <span
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "15px",
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
                    fontSize: "11px",
                    color: "var(--text-subtle)",
                  }}
                >
                  ·
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "13px",
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
            fontSize: "13px",
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
                fontFamily: "var(--font-inter)",
                fontSize: "15px",
                color: "var(--text-secondary)",
                lineHeight: 1.6,
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
  return (
    <li
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "4px",
      }}
    >
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
            fontSize: "18px",
            color: "var(--text)",
            fontStyle: "italic",
          }}
        >
          {show.title}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--text-muted)",
          }}
        >
          ({show.kind})
        </span>
      </div>
      <span
        style={{
          fontFamily: "var(--font-inter)",
          fontSize: "14px",
          color: "var(--text-secondary)",
        }}
      >
        {show.venue}
        <span style={{ color: "var(--text-muted)" }}> · {show.location}</span>
      </span>
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
          minWidth: "260px",
        }}
      >
        {press.link ? (
          <a
            href={press.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "16px",
              color: "var(--text)",
              textDecoration: "underline",
              textUnderlineOffset: "3px",
              lineHeight: 1.4,
            }}
          >
            “{press.title}”
          </a>
        ) : (
          <span
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "16px",
              color: "var(--text)",
              lineHeight: 1.4,
            }}
          >
            “{press.title}”
          </span>
        )}
        <span
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "14px",
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
          fontSize: "12px",
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
          fontFamily: "var(--font-inter)",
          fontSize: "16px",
          color: "var(--text-secondary)",
        }}
      >
        {award.name}
      </span>
      {award.date && (
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
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
          fontSize: "11px",
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
          fontFamily: "var(--font-inter)",
          fontSize: "15px",
          color: "var(--text-secondary)",
          margin: 0,
          lineHeight: 1.6,
        }}
      >
        {items}
      </dd>
    </>
  );
}
