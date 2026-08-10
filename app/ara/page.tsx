import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import AraPrototype from "./AraPrototype";

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Ara — Cloud parity, a working proposal",
  description:
    "A working redesign of Ara's setup moment: local skills, secrets and MCP servers, routed — not migrated. Proposal by Aakarsh Singh.",
  robots: { index: false },
};

export default function AraPage() {
  return (
    <div className={geistMono.variable}>
      <AraPrototype />
    </div>
  );
}
