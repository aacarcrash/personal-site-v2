import type { Metadata } from "next";
import { Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const DESCRIPTION =
  "Aakarsh Singh is a product engineer and new media artist, co-founder of Mare. His work has been shown at the Sydney Opera House, Ars Electronica, Louvre Abu Dhabi, Dark Mofo, and the Jameel Arts Centre.";

export const metadata: Metadata = {
  // `default` is the homepage title; `template` wraps every child page's leaf
  // title so the name is always present in the SERP snippet (disambiguation).
  title: {
    default: "Aakarsh Singh · Product Engineer & New Media Artist",
    template: "%s · Aakarsh Singh",
  },
  description: DESCRIPTION,
  metadataBase: new URL("https://aakarsh.dev"),
  applicationName: "Aakarsh Singh",
  authors: [{ name: "Aakarsh Singh", url: "https://aakarsh.dev" }],
  creator: "Aakarsh Singh",
  keywords: [
    "Aakarsh Singh",
    "Aakarsh Singh artist",
    "Aakarsh Singh new media artist",
    "Aakarsh Singh Mare",
    "new media art",
    "product engineer",
    "creative technologist",
    "NYU Abu Dhabi",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Aakarsh Singh · Product Engineer & New Media Artist",
    description: DESCRIPTION,
    url: "https://aakarsh.dev",
    siteName: "Aakarsh Singh",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aakarsh Singh · Product Engineer & New Media Artist",
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${instrumentSerif.variable} ${inter.variable} ${jetBrainsMono.variable}`}
    >
      <body>
        <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
