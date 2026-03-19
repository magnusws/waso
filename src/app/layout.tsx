import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WASO — Design & Strategi",
  description:
    "Bedre produkter, gjort riktig. WASO er designpraksisen til Magnus Walberg Solbakken.",
  openGraph: {
    title: "WASO — Design & Strategi",
    description:
      "Bedre produkter, gjort riktig.",
    type: "website",
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
