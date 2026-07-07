/**
 * Structured data (schema.org JSON-LD) for entity disambiguation + GEO.
 *
 * "Aakarsh Singh" is a common name with many people in tech. Search engines
 * and AI answer-engines resolve *entities*, not strings — the `sameAs` cluster
 * below is how they fuse "these profiles are all the same person" and build a
 * distinct node. Keep this list complete and keep every profile linking back
 * to aakarsh.dev (bidirectional) or the signal weakens.
 */

const SITE = "https://aakarsh.dev";

// Canonical profiles — the entity cluster. Every URL here must be a public
// profile that belongs to Aakarsh and ideally links back to the site.
const SAME_AS = [
  "https://github.com/AakSin",
  "https://www.linkedin.com/in/aakarshs/",
  "https://www.are.na/aakarsh-singh-xyyccgscqnu",
  "https://www.instagram.com/aacarcrash",
  "https://www.youtube.com/@aakarshsingh3564",
  "https://vimeo.com/user170710981",
];

const person = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${SITE}/#person`,
  name: "Aakarsh Singh",
  url: SITE,
  jobTitle: "Product Engineer & New Media Artist",
  description:
    "Product engineer and new media artist. Co-founder of Mare. Work shown at the Sydney Opera House, Ars Electronica, Louvre Abu Dhabi, Dark Mofo, and the Jameel Arts Centre.",
  worksFor: {
    "@type": "Organization",
    name: "Mare",
    url: "https://mare.run",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "New York University Abu Dhabi",
  },
  knowsAbout: [
    "New media art",
    "Game engines",
    "Real-time graphics",
    "Creative technology",
    "Product engineering",
    "Machine learning interfaces",
    "Interactive installation",
  ],
  sameAs: SAME_AS,
};

const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE}/#website`,
  url: SITE,
  name: "Aakarsh Singh",
  description:
    "Portfolio of Aakarsh Singh — product engineer and new media artist, co-founder of Mare.",
  publisher: { "@id": `${SITE}/#person` },
  inLanguage: "en",
};

/** Person + WebSite graph. Render once, on the homepage. */
export function PersonJsonLd() {
  return (
    <>
      <script
        type="application/ld+json"
        // JSON.stringify output is safe to inline; no user input flows in here.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}

/** CreativeWork markup for a project/artwork detail page. */
export function CreativeWorkJsonLd({
  name,
  description,
  url,
  image,
  year,
}: {
  name: string;
  description?: string;
  url: string;
  image?: string;
  year?: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name,
    ...(description ? { description } : {}),
    url,
    ...(image ? { image } : {}),
    ...(year ? { dateCreated: year } : {}),
    creator: { "@id": `${SITE}/#person` },
    author: { "@id": `${SITE}/#person` },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
