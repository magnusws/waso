import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://www.waso.no";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "WASO — Magnus Walberg Solbakken",
  description:
    "Bedre produkter, gjort riktig. Jeg skaper digitale opplevelser hos Increo og 99x.",
  keywords: ["design", "digital", "UX", "UI", "Magnus Walberg Solbakken", "WASO", "Increo", "99x"],
  authors: [{ name: "Magnus Walberg Solbakken" }],
  creator: "Magnus Walberg Solbakken",
  openGraph: {
    title: "WASO — Magnus Walberg Solbakken",
    description: "Bedre produkter, gjort riktig. Jeg skaper digitale opplevelser hos Increo og 99x.",
    url: siteUrl,
    siteName: "WASO",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "WASO — Bedre produkter, gjort riktig.",
      },
    ],
    locale: "nb_NO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WASO — Magnus Walberg Solbakken",
    description: "Bedre produkter, gjort riktig. Jeg skaper digitale opplevelser hos Increo og 99x.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  other: {
    "theme-color": "#f5f5f5",
    "msapplication-TileColor": "#f5f5f5",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
