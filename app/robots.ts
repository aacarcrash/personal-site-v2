import type { MetadataRoute } from "next";

const BASE = "https://aakarsh.dev";

// AI answer-engine crawlers are explicitly welcomed: being cited by
// ChatGPT / Perplexity / Claude / Google's AI overviews is a goal, not a
// threat. Only /admin (filesystem-writing panel) is kept out.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: "/admin",
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
