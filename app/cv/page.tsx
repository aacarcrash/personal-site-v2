import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

// CV data is intentionally inline for now; will move to data/cv.ts in Phase 4 when
// long-form structure stabilises. Source: verified Version D v2 LinkedIn-ready CV.

type CvEntry = {
  title: string;
  org: string;
  date: string;
  location?: string;
  bullets?: string[];
  link?: string;
};

const experience: CvEntry[] = [
  {
    title: "Co-founder, CTO & Design Engineer",
    org: "Mare",
    date: "2024 — Present",
    location: "Remote",
    bullets: [
      "Co-founded and lead engineering for a platform that organises and explores fragmented visual archives for designers, artists, and researchers.",
      "Designed and built the entire product interface — visual archive exploration, clustered navigation, contextual metadata display, import flows.",
      "Architected the full stack: Next.js / TypeScript frontend, Python backend, Firebase infrastructure, custom ML pipelines.",
      "Built Mare's proprietary semantic clustering system, which surfaces thematic connections across visual collections without manual tagging.",
      "Onboarded 100+ designers, artists, and researchers in closed beta; processing 10,000+ reference items.",
    ],
    link: "https://mare.run",
  },
  {
    title: "XR Software Engineer",
    org: "Date 0:0 — Sara Niroobakhsh & Wafaa Bilal",
    date: "August 2025 — Present",
    location: "Remote",
    bullets: [
      "Lead developer for a mixed reality / VR gallery installation built with Unity and Meta XR SDK for standalone Quest 3.",
      "Designed and engineered spatial transitions between physical space, Meta Passthrough MR, and fully immersive VR environments.",
      "Optimised assets to reduce scene memory by 60% while maintaining 90 FPS.",
      "Implemented real-time NoSQL database synchronisation for concurrent multi-device installations.",
    ],
  },
  {
    title: "Instructor & Curriculum Developer",
    org: "Architectural Association — Playful Cartographies",
    date: "July 2025",
    location: "Warsaw, Poland",
    bullets: [
      "Invited to design and teach a game engine-based art workshop for international architecture and PhD students.",
      "Developed syllabus covering spatial interaction design, procedural design, and interactive media using Unreal Engine and Unity.",
    ],
  },
  {
    title: "Fullstack Software Engineer",
    org: "Callback",
    date: "May 2024 — December 2024",
    location: "Tokyo / Remote",
    bullets: [
      "Designed and built the company's main Next.js / TypeScript site with user-facing leaderboard — grew weekly active users from 25 to 250 in three months.",
      "Designed and implemented social features: user profiles, friend connections, in-app engagement flows.",
      "Built an enterprise dashboard with data visualisations, Stripe payouts, and automated Twilio-mailed reports — increased partner retention by 200%.",
      "Orchestrated on GCP Cloud Run with CI/CD pipelines and Docker.",
    ],
  },
  {
    title: "XR Research Fellow",
    org: "NYU Tandon @ The Yard",
    date: "June 2024 — August 2024",
    location: "Brooklyn, NY",
    bullets: [
      "Designed and built immersive Unreal Engine environments and Niagara particle simulations for commercial productions.",
      "Integrated motion capture and volumetric capture pipelines, improving production efficiency by 35%.",
      "Work presented at NYU engineering research conference and ArtsIT: 13th EAI International Conference.",
    ],
  },
  {
    title: "Creative Technologist",
    org: "NEEEU Spaces GmbH",
    date: "May 2023 — July 2023",
    location: "Berlin, Germany",
    bullets: [
      "Designed and shipped an AR experience for BMW's lifestyle magazine, achieving a 20% increase in customer engagement.",
      "Created Cinema4D assets and wrote custom shader code, halving rendering time in Meta Spark Studio projects.",
      "Prototyped a Unity spatial audio game with interaction design for visually impaired users — over 1,000 downloads after initial release.",
    ],
  },
  {
    title: "Technical Associate",
    org: "Electronicos Fantasticos (Ei Wada)",
    date: "June 2022 — August 2022",
    location: "Tokyo, Japan",
    bullets: [
      "Worked with artist Ei Wada on designing and fabricating electromagnetic musical instruments from obsolete electronics (CRT displays, electric fans, barcode scanners).",
      "Performed with the ensemble at Fuji Rock Festival 2022.",
    ],
  },
];

const education: CvEntry[] = [
  {
    title: "B.A. Interactive Media",
    org: "New York University",
    date: "2021 — 2025",
    location: "Abu Dhabi / New York",
    bullets: [
      "GPA 3.92 / 4.0. Minors in Computer Science, Sound & Music Computing, Art History.",
      "Full Ride Scholarship; Summer Research Grant (2024); Summer Internship Grant (2022).",
    ],
  },
  {
    title: "Visiting School — Climate Cartographies",
    org: "Architectural Association School of Architecture",
    date: "2025",
    location: "Dubai, UAE",
    bullets: [
      "Intensive visiting school programme focused on computational approaches to climate and spatial practice.",
    ],
  },
];

const honors: { name: string; date?: string }[] = [
  { name: "LAND screened at Ars Electronica Festival, Linz", date: "2025" },
  { name: "NYU Abu Dhabi Summer Research Grant", date: "2024" },
  { name: "NYU Abu Dhabi Full Ride Scholarship", date: "2021 — 2025" },
];

const volunteer: CvEntry[] = [
  {
    title: "Instructor & Curriculum Developer",
    org: "HLAB",
    date: "August 2022 & August 2024",
    location: "Tokyo, Japan",
    bullets: [
      "Created and taught original syllabi on \"New Media Art\" (2022) and \"Hyperreality, AI-generated Content & the Metaverse\" (2024) to high school students. Fully funded teaching fellowship.",
    ],
  },
];

export default function CvPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <main
        style={{
          flex: 1,
          padding: "32px 64px 0",
          maxWidth: "920px",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "32px" }}>
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
          <a
            href="/Aakarsh_Singh_Resume_090525.pdf"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--text-secondary)",
              textDecoration: "underline",
              textUnderlineOffset: "3px",
            }}
          >
            Download PDF ↓
          </a>
        </div>

        <CvSection title="Experience">
          {experience.map((e, i) => <CvRow key={i} entry={e} />)}
        </CvSection>

        <CvSection title="Education">
          {education.map((e, i) => <CvRow key={i} entry={e} />)}
        </CvSection>

        <CvSection title="Volunteer">
          {volunteer.map((e, i) => <CvRow key={i} entry={e} />)}
        </CvSection>

        <CvSection title="Honors & Awards">
          <ul style={{ display: "flex", flexDirection: "column", gap: "12px", listStyle: "none" }}>
            {honors.map((h, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: "16px",
                }}
              >
                <span style={{ fontFamily: "var(--font-inter)", fontSize: "16px", color: "var(--text-secondary)" }}>
                  {h.name}
                </span>
                {h.date && (
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--text-muted)" }}>
                    {h.date}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </CvSection>
      </main>
      <Footer />
    </div>
  );
}

function CvSection({ title, children }: { title: string; children: React.ReactNode }) {
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
      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>{children}</div>
    </section>
  );
}

function CvRow({ entry }: { entry: CvEntry }) {
  return (
    <article style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
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
              fontSize: "22px",
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
              <span style={{ fontFamily: "var(--font-inter)", fontSize: "15px", color: "var(--text-secondary)" }}>
                {entry.org}
              </span>
            )}
            {entry.location && (
              <>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-subtle)" }}>·</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--text-muted)" }}>
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
