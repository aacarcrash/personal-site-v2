import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CommandMenu } from "@/components/CommandMenu/CommandMenu";
import "./globals.css";

/* ---- Sheet U type system (Collletttivo, all three OFL-1.1) --------------
   Aujournuit = display, Absans = text, Necto Mono = data/labels. Licenses
   are bundled beside the files in app/fonts/OFL-*.txt — keep them there,
   OFL requires the notice to travel with the font.

   Each family ships ONE style: 400 upright, no bold, no italic. That is a
   constraint on the whole site, not a gap to paper over: never set
   fontWeight > 400 or fontStyle italic on these — the browser would
   synthesise a fake slant/smear. Emphasis comes from size, colour, family
   contrast, and rules instead. The variable names stay --font-serif /
   --font-sans / --font-mono at their point of use (globals.css), so the
   family swap is contained to this file. --------------------------------- */
const aujournuit = localFont({
  src: "./fonts/Aujournuit-Regular.woff2",
  variable: "--font-display",
  weight: "400",
  style: "normal",
  display: "swap",
  // Ramp-matched fallback: without this the swap from the system serif
  // reflows every heading, and headings are the largest type on the page.
  fallback: ["Georgia", "Times New Roman", "serif"],
  adjustFontFallback: false,
});

const absans = localFont({
  src: "./fonts/Absans-Regular.woff2",
  variable: "--font-text",
  weight: "400",
  style: "normal",
  display: "swap",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
  adjustFontFallback: false,
});

const nectoMono = localFont({
  src: "./fonts/NectoMono-Regular.woff2",
  variable: "--font-data",
  weight: "400",
  style: "normal",
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
  adjustFontFallback: false,
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
      className={`${aujournuit.variable} ${absans.variable} ${nectoMono.variable}`}
    >
      <body>
        {/* defaultTheme="system", not "light". defaultTheme is what applies
            when nothing is stored, so pairing it with enableSystem still meant
            every first-time visitor got light — enableSystem only allows
            "system" as a value, it does not make it the default. Verified on
            production before the fix: prefers-color-scheme dark, no stored
            preference, and the page still resolved data-theme="light" on
            #FAFAFA. That is a full-white page for anyone who browses dark. */}
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
          {children}
          <CommandMenu />
        </ThemeProvider>
      </body>
    </html>
  );
}
