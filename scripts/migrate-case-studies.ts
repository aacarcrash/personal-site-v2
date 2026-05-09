/**
 * One-shot: copies the hand-coded case-study decisions in
 * components/{Mare,Callback,Neeeu}CaseStudy.tsx into the matching
 * project entries in content/projects.json under the new `caseStudy`
 * field, so the case studies become data-driven and admin-editable.
 *
 * Run once with: npx tsx scripts/migrate-case-studies.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { CaseStudy } from "../data/types";

const projectsPath = resolve(__dirname, "..", "content", "projects.json");

const cases: Record<string, CaseStudy> = {
  mare: {
    walkthroughLabel: "Product walkthrough",
    walkthroughDuration: "60–90s",
    decisionsLabel: "Two decisions inside Mare",
    decisions: [
      {
        title: "Three clustering modes side by side",
        body:
          "Mare clusters the same library three different ways at once: Balanced, Aesthetic, and Semantic. There's a Recluster button if any of them feels off. We considered a single similarity slider but a slider implies one signal smoothly shifting between two ends. The three modes are actually different algorithms reading different things, so labelling them is more honest than hiding the choice behind a slider.",
        placeholder: "linear-gradient(135deg, #1a1a1a, #2a2a2a)",
      },
      {
        title: "Showing what the system isn't sure about",
        body:
          "A lot of how Mare reads in use comes down to surfacing where it's unsure. Items the algorithm can't confidently place sit in a persistent Unclustered rail with a count, instead of being pushed into the nearest cluster. Clusters can also hold sub-collections, so a 123-item collection might contain seven of them, and you can drill into a fuzzy boundary instead of treating every cluster as flat. Most of the interesting cross-references in someone's archive live in those unsure piles.",
        placeholder: "linear-gradient(135deg, #1a1a2a, #2a2a3a)",
      },
    ],
  },
  callback: {
    decisionsLabel: "Two product decisions",
    decisions: [
      {
        title: "What the home screen actually shows",
        body:
          "Callback is a loyalty platform but the consumer app doesn't open onto a stamp wallet. I led with a leaderboard and a friend activity map instead, because seeing who else has been to your favourite spot, or trying to climb a board, gives you a reason to open the app on a day with nothing to claim. Weekly active users went from 25 to 250 in three months.",
        image: "/images/callback/callbackFriendsMap.png",
        imageCaption: "Friend activity map; the actual home of the consumer app.",
      },
      {
        title: "One screen for the restaurant side",
        body:
          "The other half of Callback is the restaurant operator. Most loyalty SaaS splits customer lists, payouts, and mailers into separate screens because each was probably built by a separate team. I folded customers, Stripe payouts, and the weekly Twilio mailer into one page so a restaurant operator could understand their week without flipping between tabs. Partner retention rose 200% over the period we measured.",
        image: "/images/callback/callbackCustomersPage.png",
        imageCaption: "Customers, payouts, and mailer scheduling on one screen for non-technical operators.",
      },
    ],
  },
  neeeu: {
    decisionsLabel: "Two product decisions",
    decisions: [
      {
        title: "Faking a pearl on a flat canvas",
        body:
          "Meta Spark filters have to ship under a tight memory budget, so a real 3D sphere mesh for each pearl was out. I used a billboard of flat circles instead, with a shader that read the phone's rotation to keep the surface 'facing' the camera. From a few angles the same shader tricks the eye into seeing volume.",
        image: "/images/neeeu/2.jpeg",
        imageCaption: "Still from the prototype, with pearl orbs around the flower.",
      },
      {
        title: "Refraction without a mesh",
        body:
          "The pearls also needed to look wet. With no actual sphere geometry to refract through, I wrote a shader that converts world-space coordinates into the camera's space and samples a sphere normal map at the result. It mimics the colour-shift you get from light bending through glass without any of the geometry being there.",
        image: "/images/neeeu/1.jpeg",
        imageCaption: "Initial flower render from Fischersund that the filter was built around.",
      },
    ],
  },
};

const raw = readFileSync(projectsPath, "utf8");
const projects = JSON.parse(raw) as Array<{ slug: string; caseStudy?: CaseStudy }>;
let touched = 0;
for (const p of projects) {
  const cs = cases[p.slug];
  if (cs) {
    p.caseStudy = cs;
    touched++;
  }
}
writeFileSync(projectsPath, JSON.stringify(projects, null, 2) + "\n", "utf8");
console.log(`updated ${touched} project(s) with case-study data`);
