// Source of truth for the /cv page. Adding a new entry = appending one
// object to the relevant array. The downloadable PDFs in /public are the
// snapshots; this is the live HTML version.
//
// Sources verified against (in order of authority):
//   - Aakarsh_Version_D_v2_Full_Bulleted...docx (most recent LinkedIn-ready CV)
//   - Aakarsh_Singh_Artist_CV (1).pdf (most recent artist CV; press list)
//   - cv.pdf (current tech resume)
//   - artist cv.pdf, cv old 1-3.pdf (historical context)

export type CvRole = {
  title: string;
  org: string;
  date: string;
  location?: string;
  bullets?: string[];
  link?: string;
};

export type CvShow = {
  /** e.g. "LAND" or "Real Art" or "Spoon Spade Shovel" */
  title: string;
  /** "Screening" | "Live A/V Performance" | "Group Exhibition" | etc. */
  kind: string;
  /** Hosting venue / festival */
  venue: string;
  /** City, country */
  location: string;
  /** Year for grouping; freeform date string for display */
  year: string;
};

export type CvPress = {
  /** Plain-text title of the article */
  title: string;
  /** Outlet name */
  outlet: string;
  /** "May 13, 2025" or "2023" */
  date: string;
  link?: string;
};

export type CvAward = {
  name: string;
  date?: string;
};

// ============ Experience (paid roles, both tech + art) ============
// Order: most recent first. Mare leads (current + flagship + design engineer signal).
export const experience: CvRole[] = [
  {
    title: "Co-founder, CTO & Design Engineer",
    org: "Mare",
    date: "2024 — Present",
    location: "Remote",
    link: "https://mare.run",
    bullets: [
      "Co-founded and lead engineering for a platform that organises and explores fragmented visual archives for designers, artists, and researchers.",
      "Designed and built the entire product interface — visual archive exploration, clustered navigation, contextual metadata display, import flows.",
      "Architected the full stack: Next.js / TypeScript frontend, Python backend, Firebase infrastructure, custom ML pipelines.",
      "Built Mare's proprietary semantic clustering system, which surfaces thematic connections across visual collections without manual tagging.",
      "Onboarded 100+ designers, artists, and researchers in closed beta; processing 10,000+ reference items.",
    ],
  },
  {
    title: "XR Software Engineer",
    org: "Date 0:0 — Sara Niroobakhsh & Wafaa Bilal",
    date: "August 2025 — Present",
    location: "Remote",
    bullets: [
      "Lead developer for a mixed reality / VR gallery installation built with Unity and Meta XR SDK for standalone Quest 3.",
      "Engineered spatial transitions between physical space, Meta Passthrough MR, and fully immersive VR environments.",
      "Optimised assets to reduce scene memory by 60% while maintaining 90 FPS.",
      "Implemented real-time NoSQL database synchronisation for concurrent multi-device installations.",
      "Procedurally mapped terrain and flora using satellite imagery of the region.",
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
      "Designed and implemented social features: user profiles, friend connections, in-app engagement flows. Doubled engagement in one month.",
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
    title: "Studio Associate",
    org: "Electronicos Fantasticos (Ei Wada)",
    date: "June 2022 — August 2022",
    location: "Tokyo, Japan",
    bullets: [
      "Worked with artist Ei Wada on designing and fabricating electromagnetic musical instruments from obsolete electronics (CRT displays, electric fans, barcode scanners).",
      "Performed with the ensemble at Fuji Rock Festival 2022.",
      "Contributed to the WORLDWIDE Orchest Lab initiative for global instrument-making community.",
    ],
  },
  {
    title: "Full Stack Developer",
    org: "Kermit Finance",
    date: "March 2021 — May 2021",
    location: "Remote",
    bullets: [
      "Built a Serum DEX-based decentralised exchange and Metaplex NFT marketplace using TypeScript.",
      "Featured on Solana's ecosystem page during the first year.",
    ],
  },
  {
    title: "Full Stack Developer",
    org: "Slingshot",
    date: "September 2020 — January 2021",
    location: "Remote",
    bullets: [
      "Built a competitive programming portal with React, Firebase, Node.js, Express, and Heroku for high schools.",
      "Mentored by engineers from Apple and Microsoft.",
    ],
  },
];

// ============ Selected Exhibitions, Performances & Screenings ============
// Verified from Aakarsh_Singh_Artist_CV (1).pdf (most recent artist CV).
// Order within each year follows the artist CV.
export const shows: CvShow[] = [
  // 2025
  { title: "LAND", kind: "Screening", venue: "Ars Electronica Festival", location: "Linz, Austria", year: "2025" },
  { title: "LAND", kind: "Screening", venue: "NYUAD Capstone Exhibition", location: "Abu Dhabi, UAE", year: "2025" },
  { title: "Climate Cartographies", kind: "Performance", venue: "Alserkal Avenue", location: "Dubai, UAE", year: "2025" },
  { title: "Spoon Spade Shovel", kind: "Live A/V Performance", venue: "Jameel Arts Centre Youth Takeover", location: "Dubai, UAE", year: "2025" },

  // 2024
  { title: "MUTEK.AE", kind: "Live A/V Performance", venue: "MUTEK.AE", location: "Dubai, UAE", year: "2024" },
  { title: "Re:Fest", kind: "Group Screening", venue: "CultureHub", location: "New York, NY", year: "2024" },
  { title: "ArtsIT", kind: "Group Exhibition", venue: "13th EAI International Conference", location: "Abu Dhabi, UAE", year: "2024" },
  { title: "MiZa Showcase", kind: "Installation", venue: "MiZa", location: "Abu Dhabi, UAE", year: "2024" },

  // 2023
  { title: "MANIFEST:IO", kind: "Group Exhibition", venue: "Alte Münze", location: "Berlin, Germany", year: "2023" },
  { title: "Collaborative Arts Fall Show", kind: "Installation & Performance", venue: "NYU Tisch", location: "New York, NY", year: "2023" },
  { title: "Real Art", kind: "Interactive Installation", venue: "Louvre Abu Dhabi University Takeover", location: "UAE", year: "2023" },

  // 2022
  { title: "Fuji Rock Festival", kind: "Performance with Electronicos Fantasticos", venue: "Fuji Rock Festival", location: "Niigata, Japan", year: "2022" },
];

// ============ Residencies & Professional Development ============
export const residencies: CvRole[] = [
  {
    title: "Visiting School — Playful Cartographies",
    org: "Architectural Association School of Architecture",
    date: "2025",
    location: "Warsaw, Poland",
  },
  {
    title: "Visiting School — Climate Cartographies",
    org: "Architectural Association School of Architecture",
    date: "2025",
    location: "Dubai, UAE",
  },
  {
    title: "DWeb for Creators",
    org: "Gray Area Foundation",
    date: "2025",
    location: "San Francisco, CA (Remote)",
    bullets: ["Decentralized web technologies for creative practice."],
  },
  {
    title: "XR Research Fellowship",
    org: "NYU Tandon @ The Yard",
    date: "2024",
    location: "Brooklyn, NY",
  },
  {
    title: "Studio Associate",
    org: "Electronicos Fantasticos (Ei Wada)",
    date: "2022",
    location: "Tokyo, Japan",
  },
];

// ============ Teaching ============
export const teaching: CvRole[] = [
  {
    title: "Instructor & Curriculum Developer",
    org: "Architectural Association Visiting School",
    date: "July 2025",
    location: "Warsaw, Poland",
    bullets: [
      "Designed and taught a game engine-based art workshop on spatial storytelling and interactive media for international architecture and PhD students.",
    ],
  },
  {
    title: "Instructor & Curriculum Developer",
    org: "HLAB",
    date: "August 2022, 2024",
    location: "Tokyo, Japan",
    bullets: [
      "Created and taught original syllabi on \"New Media Art\" (2022) and \"Hyperreality, AI-generated Content & the Metaverse\" (2024) to high school students.",
      "Fully funded teaching fellowship.",
    ],
  },
];

// ============ Press & Publications ============
// Verified from Aakarsh_Singh_Artist_CV (1).pdf
export const press: CvPress[] = [
  {
    title: "\"Spoon Spade Shovel\" is a layered Youth Takeover of Dubai's Jameel Arts Centre",
    outlet: "Dazed MENA",
    date: "May 13, 2025",
  },
  {
    title: "AA Visiting School: Playful Cartographies",
    outlet: "e-flux Announcements",
    date: "2025",
  },
  {
    title: "UAE: What does it mean to be human? University students answer through AI art, interactive exhibits",
    outlet: "Khaleej Times",
    date: "March 9, 2023",
  },
  {
    title: "Louvre Abu Dhabi concludes first edition of 'University Take Over the Museum' programme",
    outlet: "Emirates News Agency (WAM)",
    date: "March 8, 2023",
  },
  {
    title: "Louvre Abu Dhabi concludes 'University Take Over the Museum' programme",
    outlet: "Magzoid Magazine",
    date: "2023",
  },
];

// ============ Education ============
export const education: CvRole[] = [
  {
    title: "B.A. Interactive Media",
    org: "New York University Abu Dhabi",
    date: "2021 — 2025",
    location: "Abu Dhabi, UAE",
    bullets: [
      "GPA 3.92 / 4.0. Minors in Computer Science, Sound & Music Computing, Art History.",
      "Relevant coursework: VR/AR Development, Shader Programming, Algorithms, Game Development, Natural Language Processing, 3D Modelling & Design.",
    ],
  },
];

// ============ Awards & Grants ============
export const awards: CvAward[] = [
  { name: "LAND screened at Ars Electronica Festival, Linz", date: "2025" },
  { name: "NYU Abu Dhabi Summer Research Grant", date: "2024" },
  { name: "NYU Abu Dhabi Summer Internship Grant", date: "2022" },
  { name: "NYU Abu Dhabi Full Ride Scholarship", date: "2021 — 2025" },
];

// ============ Skills (compact, for the bottom of the CV) ============
export const skills: { category: string; items: string }[] = [
  { category: "Web", items: "TypeScript, Next.js, React, React Native, Node.js, Express, Firebase, Docker, GCP, MongoDB" },
  { category: "Creative coding", items: "Three.js, A-Frame, p5.js, ml5.js, WebGL, Processing, Arduino, TidalCycles" },
  { category: "Game engines & XR", items: "Unreal Engine, Unity, Meta XR SDK, Meta Spark Studio, C#, C++" },
  { category: "Shader & GPU", items: "HLSL, GLSL, custom shader programming, real-time rendering" },
  { category: "3D & A/V", items: "Cinema4D, Blender, Maya, Bifrost, Redshift, Substance 3D Painter, TouchDesigner, Max/MSP, Ableton" },
  { category: "Specialized", items: "Motion Capture, Volumetric Capture, Photogrammetry, AI Model Training (LoRA / Stable Diffusion)" },
];
