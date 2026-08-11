import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <main
        className="page-gutter"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "20px",
          paddingTop: "80px",
          paddingBottom: "80px",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "64px",
            color: "var(--text)",
            letterSpacing: "-1px",
            lineHeight: 1.05,
          }}
        >
          Not found
        </h1>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "18px",
            color: "var(--text-muted)",
          }}
        >
          The page you&rsquo;re looking for doesn&rsquo;t exist.
        </p>
        <Link
          href="/"
          className="link-underline"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            color: "var(--text-secondary)",
            marginTop: "12px",
          }}
        >
          ← Back home
        </Link>
      </main>
      <Footer />
    </div>
  );
}
