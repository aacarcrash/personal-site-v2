# Source of truth — where every fact came from

For each section of the site, the underlying source documents. Use this when
adding entries or updating dates: cite the source so the next person knows
how to verify.

All source files live at:
`D:/DocumentsD/cs-projects/personal-site/claude-web-career-conversations-and-plans/`

---

## Documents inventory

| File | Authority | Used for |
| --- | --- | --- |
| `Aakarsh_Version_D_v2_Full_Bulleted---290fbce9-...docx` | Primary CV (LinkedIn-ready, latest) | Experience section, dates, metrics, role titles |
| `Aakarsh_Singh_Artist_CV (1).pdf` | Primary artist CV (latest, has full press list) | Exhibitions, Performances, Press, Residencies |
| `cv.pdf` | Current short tech resume | Cross-check tech roles |
| `artist cv.pdf` | Older artist CV | Cross-check exhibitions |
| `cv old 1.pdf` | Older tech resume | Found Herwig Scherabon role (since omitted — never transpired) and Kermit Finance + Slingshot earlier roles |
| `cv old 2.pdf` | Older tech resume | Cross-reference for early roles |
| `cv old 3.pdf` | Older tech resume | — |
| `Aakarsh_Version_D_Design_Engineer.docx` | v1 of LinkedIn doc | — |
| `Aakarsh_Singh_LinkedIn_Guide.docx` | LinkedIn strategy | NOT used for site content |
| `Aakarsh_Job_Search_Guide.docx` | Job hunt strategy | NOT used for site content |
| `Aakarsh_Design_Engineer_References.docx` | Reference list of design engineers (Rauno, Emil, Paco, etc.) | NOT used for site content |
| `Building_a_LinkedIn_profile.md` | Conversation transcript | Mare framing (verified facts) |

---

## Where each site fact came from

### Experience entries (`data/cv.ts → experience`)
- **Mare** — Version D v2; metrics verified by user mid-session
- **Date 0:0** — Version D v2 (XR Software Engineer, August 2025 — Present)
- **AA Warsaw** — Version D v2 (Instructor & Curriculum Developer, July 2025)
- **Callback** — Version D v2 (Fullstack Software Engineer, May–Dec 2024).
  CV says NYU Tandon was Nov 2024 – Present, but Version D v2 corrects to
  June – August 2024. Used the corrected.
- **NYU Tandon** — Version D v2 (XR Research Fellow, June – August 2024)
- **NEEEU** — Version D v2 (Creative Technologist, May – July 2023)
- **Electronicos Fantasticos** — Version D v2 (Studio Associate, Jun – Aug 2022)
- **Kermit Finance** — `cv old 2.pdf` (Full Stack Developer, March – May 2021,
  Solana DEX). Marked optional in Version D v2; included for completeness.
- **Slingshot** — `cv old 2.pdf` (Full Stack Developer, Sep 2020 – Jan 2021)

### NOT included
- **Herwig Scherabon** — appeared in `cv old 1.pdf` only (Aug 2023 – Present
  in the snapshot). User confirmed: "never transpired" — do not add.

### Exhibitions (`data/cv.ts → shows`)
All 11 entries from `Aakarsh_Singh_Artist_CV (1).pdf` — that's the
authoritative list. Don't add from other sources without checking.

### Press (`data/cv.ts → press`)
All 5 entries from `Aakarsh_Singh_Artist_CV (1).pdf`. The newer PDF added
Khaleej Times + Magzoid Magazine compared to the older `artist cv.pdf`.

### Residencies / Teaching / Education / Awards
All from Version D v2 + cross-checked against `Aakarsh_Singh_Artist_CV (1).pdf`.

### Mare design decisions (`components/MareCaseStudy.tsx`)
From scanning the Mare Web UI Paper file (90 artboards, mostly viewed `3P-0`,
`1UN-0`, `9R-0`, `DTQ-0`, `2A4-0`). See `docs/mare-framing.md` for which
artboards inform which decision.

### About page artist statement
Verbatim from the user's exhibition contexts (paste during session).
Preserved exactly — don't paraphrase.

### About page personal first-person paragraph
Synthesised from Version D v2's About prose. User-approved final text in
`app/about/page.tsx`.

---

## When adding new content

1. Identify the source document above
2. If a new fact isn't in any source doc — ask the user to paste / add to
   their CV first
3. After adding, mention in your commit message which source confirmed the
   fact (e.g., "verified from artist_cv (1).pdf")


---

## Project copy — web-researched event context (2026-07-04)

Enriched thin project copy from official event sources. Per user rule, every
web fact was flagged for his verification before publishing.

- **Climate Cartographies (aa-dubai)** — AA Visiting School "Climate
  Cartographies: Glitch", Alserkal Avenue / WH50 Project Space, Dubai.
  Supported by Alserkal Arts Foundation. **Dates corrected Feb 2025 -> May 2025**
  (25 April – 3 May 2025; Feb 28 was only the application deadline; user's
  field-trip photo dated 2025-04-28 confirms). Source: alserkal.online. Wadi
  Madha framing + the six transformations come from the user's own deck
  (`RLP Final AMS AAVS.pdf`). Performance video: youtube pQ794NRBrF0.
- **MUTEK.AE** — Dubai edition of MUTEK (founded Montreal 2000), Edition 3
  = 4–5 May 2024, Alserkal Avenue. Source: dubai.mutek.org.
- **Spoon Spade Shovel (spoon-spade-shovel)** — this is the *title of the 2025
  Jameel Arts Centre Youth Takeover* (program "The Assembly"), May 10 – June 2
  2025, not the user's piece. User's A/V work within it = "Synthesizing
  Landscapes" (his YouTube clip titles). Kept the card venue-framed per user.
  Source: jameelartscentre.org.
- **Dark Mofo** — Hobart, Tasmania; "Night Mass: Dead End" late-night program,
  4 nights (Fri 12 / Sat 13 / Fri 19 / Sat 20 June 2026, 10pm–4am), festival
  11–22 June 2026. Source: darkmofo.net.au + southerntasmania.com.au. Nights
  count confirmed by user.
- **AA Warsaw (aa-warsaw)** — AA Visiting School "Playful Cartographies", nine
  days in Warsaw, museum-as-site-of-study using the Faras Cathedral collection;
  tools Unreal Engine + Unity. Source: e-flux.com.
- **latent-space** — score credit "Cash"; runtime 6:06 (from the user's own
  uploaded film, via yt-dlp).
