import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Footer } from "@/components/common/Footer";
import { Header } from "@/components/common/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Catalyst",
  description: "Catalyst Next.js application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F3EFE0] text-[#2C2C2C] antialiased">
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
