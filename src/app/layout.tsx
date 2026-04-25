import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Footer } from "@/components/common/Footer";
import { Header } from "@/components/common/Header";
import JsonLd from "@/components/seo/JsonLd";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://catalystbar.ca"),
  title: {
    default: "The Catalyst Mobile Bar | Vancouver Premium Pop-up Bar",
    template: "%s | The Catalyst Mobile Bar",
  },
  description: "Elevating the energy of every event with artistic cocktail designs and premium mobile bar services in Vancouver, BC.",
  keywords: ["Mobile Bar Vancouver", "Wedding Bartender BC", "Event Mixology", "Pop-up Bar", "Craft Cocktails Vancouver"],
  authors: [{ name: "The Catalyst Mobile Bar" }],
  creator: "The Catalyst Mobile Bar",
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: "https://catalystbar.ca",
    siteName: "The Catalyst Mobile Bar",
    title: "The Catalyst Mobile Bar | Vancouver Premium Pop-up Bar",
    description: "Elevating the energy of every event with artistic cocktail designs and premium mobile bar services in Vancouver, BC.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "The Catalyst Mobile Bar Experience",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Catalyst Mobile Bar | Vancouver Premium Pop-up Bar",
    description: "Elevating the energy of every event with artistic cocktail designs and premium mobile bar services in Vancouver, BC.",
    images: ["/images/og-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon1.png", sizes: "32x32", type: "image/png" },
      { url: "/icon0.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en-CA">
      <body className="min-h-screen bg-[#F3EFE0] text-[#2C2C2C] antialiased">
        <JsonLd />
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
