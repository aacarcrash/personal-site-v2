// Flat search corpus for the command menu. Derived once at module load from
// the validated content shims (data/projects.ts, data/cv.ts) plus a small
// hand-curated set of pages/actions. Hand-curated recruiter-synonym aliases
// live in content/search-aliases.json and are merged in by id.
//
// This module has no "use client" — it's plain data, importable from both
// server and client components.

import { projects } from "@/data/projects";
import { experience, skills } from "@/data/cv";
import { clusterSlug } from "@/components/AxisGrid/axisGridUtils";
import aliasesJson from "@/content/search-aliases.json";

export type SearchGroup =
  | "projects"
  | "sketches"
  | "experience"
  | "skills"
  | "pages"
  | "actions";

export type SearchItem = {
  id: string;
  title: string;
  group: SearchGroup;
  href: string;
  meta?: string;
  keywords: string[];
  /** Open via window.open(noopener) instead of router.push — external links/mailto. */
  external?: boolean;
};

const aliases: Record<string, string[]> = aliasesJson;

function withAliases(id: string, base: (string | undefined)[]): string[] {
  const clean = base.filter((v): v is string => Boolean(v && v.trim()));
  const extra = aliases[id] ?? [];
  return Array.from(new Set([...clean, ...extra]));
}

function buildIndex(): SearchItem[] {
  const items: SearchItem[] = [];

  // Projects + sketches (clusters), from data/projects.ts
  for (const p of projects) {
    if (p.type === "project") {
      items.push({
        id: p.id,
        title: p.name,
        group: "projects",
        href: `/projects/${p.slug}`,
        meta: `project · ${p.axes.year}`,
        // Deliberately excludes prose (subtitle/description): fuzzy scoring
        // over long free text produces noisy false-positive matches on short
        // queries. Keywords stay to tags — tools, technology, aliases.
        keywords: withAliases(p.id, [...(p.tools ?? []), p.technology]),
      });
    } else {
      const slug = clusterSlug(p);
      items.push({
        id: p.id,
        title: p.name,
        group: "sketches",
        href: `/sketches/${slug}`,
        meta: `sketches · ${p.count} pieces`,
        keywords: withAliases(p.id, [...(p.tools ?? []), p.technology]),
      });
    }
  }

  // Experience entries, from data/cv.ts. Link to the related project when one
  // exists, otherwise fall back to the CV page itself.
  experience.forEach((role, i) => {
    const id = `experience-${i}`;
    items.push({
      id,
      title: `${role.title} · ${role.org}`,
      group: "experience",
      href: role.projectLink ?? "/cv",
      meta: role.date,
      keywords: withAliases(id, [role.org, role.location, role.title]),
    });
  });

  // Skill categories, from data/cv.ts.
  skills.forEach((skill, i) => {
    const id = `skill-${i}`;
    items.push({
      id,
      title: skill.category,
      group: "skills",
      href: "/cv",
      meta: "skills",
      keywords: withAliases(id, [
        skill.category,
        ...skill.items.split(",").map((s) => s.trim()),
      ]),
    });
  });

  // Pages
  items.push(
    {
      id: "page-home",
      title: "Home",
      group: "pages",
      href: "/",
      meta: "page",
      keywords: withAliases("page-home", ["home", "index", "work", "projects"]),
    },
    {
      id: "page-about",
      title: "About",
      group: "pages",
      href: "/about",
      meta: "page",
      keywords: withAliases("page-about", ["about", "bio", "statement"]),
    },
    {
      id: "page-cv",
      title: "CV",
      group: "pages",
      href: "/cv",
      meta: "page",
      keywords: withAliases("page-cv", ["cv", "resume", "curriculum vitae"]),
    },
  );

  // Actions — résumé download, contact, socials, theme toggle. Socials pull
  // real URLs from components/Footer.tsx (do not invent).
  items.push(
    {
      id: "action-resume",
      title: "Download résumé",
      group: "actions",
      href: "/Aakarsh_Singh_Resume_090525.pdf",
      meta: "action",
      keywords: withAliases("action-resume", ["resume", "cv", "pdf", "download"]),
      external: true,
    },
    {
      id: "action-email",
      title: "Email",
      group: "actions",
      href: "mailto:aakarsh@nyu.edu",
      meta: "action",
      keywords: withAliases("action-email", ["email", "contact", "mail"]),
      external: true,
    },
    {
      id: "action-github",
      title: "GitHub",
      group: "actions",
      href: "https://github.com/aacarcrash",
      meta: "action",
      keywords: withAliases("action-github", ["github", "code", "source"]),
      external: true,
    },
    {
      id: "action-linkedin",
      title: "LinkedIn",
      group: "actions",
      href: "https://www.linkedin.com/in/aakarshs/",
      meta: "action",
      keywords: withAliases("action-linkedin", ["linkedin"]),
      external: true,
    },
    {
      id: "action-arena",
      title: "Are.na",
      group: "actions",
      href: "https://www.are.na/aakarsh-singh-xyyccgscqnu",
      meta: "action",
      keywords: withAliases("action-arena", ["arena", "are.na", "moodboard", "references"]),
      external: true,
    },
    {
      id: "action-instagram",
      title: "Instagram",
      group: "actions",
      href: "https://www.instagram.com/aacarcrash/",
      meta: "action",
      keywords: withAliases("action-instagram", ["instagram", "insta", "ig", "social"]),
      external: true,
    },
    {
      id: "action-theme",
      title: "Toggle theme",
      group: "actions",
      href: "#theme",
      meta: "action",
      keywords: withAliases("action-theme", ["theme", "dark mode", "light mode", "dark", "light"]),
    },
  );

  return items;
}

export const searchIndex: SearchItem[] = buildIndex();
