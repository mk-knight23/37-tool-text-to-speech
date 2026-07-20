import type { Metadata } from "next";
// Self-hosted fonts (STANDARDS §8 / DESIGN_SYSTEM §2 option A). Next bundles
// the woff2 files locally — no font CDN request is ever made.
import "@fontsource/atkinson-hyperlegible/400.css";
import "@fontsource/atkinson-hyperlegible/700.css";
import "./globals.css";
import { SITE } from "@/lib/site";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ThemeScript } from "@/components/theme/ThemeScript";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Analytics } from "@/components/analytics/Analytics";
import { SpeechProvider } from "@/context/SpeechContext";
import { MiniPlayer } from "@/components/layout/MiniPlayer";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: `${SITE.name} — ${SITE.tagline}`,
  description:
    "MK VoiceKit reads text, Markdown, PDFs and subtitles aloud in your browser with live sentence highlighting, chapters and full keyboard control. Free, open source, no account, no upload.",
  applicationName: SITE.name,
  authors: [{ name: SITE.creator.name, url: SITE.creator.portfolio }],
  creator: SITE.creator.name,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${SITE.name} — ${SITE.tagline}`,
    description:
      "Turn text, PDFs and subtitles into comfortable listening. Runs entirely in your browser.",
    url: SITE.url,
    siteName: SITE.name,
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-full flex-col">
        <SpeechProvider>
          <ThemeProvider>
            <a href="#main-content" className="skip-link">
              Skip to content
            </a>
            <SiteHeader />
            <main id="main-content" className="flex-1" tabIndex={-1}>
              {children}
            </main>
            <MiniPlayer />
            <SiteFooter />
            <Analytics />
          </ThemeProvider>
        </SpeechProvider>
      </body>
    </html>
  );
}
