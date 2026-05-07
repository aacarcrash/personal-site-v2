/**
 * Design-engineering case-study slots for the Callback project page.
 * Two product decisions visible in what shipped.
 */

import Image from "next/image";

type DesignDecision = {
  title: string;
  body: string;
  image?: string;
  imageCaption?: string;
};

const DESIGN_DECISIONS: DesignDecision[] = [
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
];

export function CallbackCaseStudy() {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        padding: "48px 0 16px",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          fontWeight: 500,
          color: "var(--text-muted)",
          letterSpacing: "1.5px",
          textTransform: "uppercase",
        }}
      >
        Two product decisions
      </span>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "40px",
        }}
      >
        {DESIGN_DECISIONS.map((d, i) => (
          <article
            key={i}
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            {d.image && (
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "16 / 10",
                  borderRadius: "4px",
                  overflow: "hidden",
                  background: "var(--surface)",
                }}
              >
                <Image
                  src={d.image}
                  alt={d.imageCaption ?? d.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
            )}
            <h3
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "22px",
                color: "var(--text)",
                letterSpacing: "-0.2px",
              }}
            >
              {d.title}
            </h3>
            <p
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "15px",
                color: "var(--text-secondary)",
                lineHeight: 1.7,
              }}
            >
              {d.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
