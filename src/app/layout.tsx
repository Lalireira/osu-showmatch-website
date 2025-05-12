import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "osu! Showmatch",
  description: "osu! Showmatch Tournament Website - View tournament teams, mappool, and match schedules",
  openGraph: {
    title: "osu! Showmatch",
    description: "osu! Showmatch Tournament Website - View tournament teams, mappool, and match schedules",
    type: "website",
    locale: "en_US",
    siteName: "osu! Showmatch",
  },
  twitter: {
    card: "summary_large_image",
    title: "osu! Showmatch",
    description: "osu! Showmatch Tournament Website",
  },
  robots: "index, follow",
  other: {
    "Cache-Control": "public, max-age=31536000, immutable",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-[#0a0a0a] text-white min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
