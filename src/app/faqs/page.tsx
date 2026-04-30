import type { Metadata } from "next";
import { Playfair_Display, Raleway } from "next/font/google";
import Link from "next/link";
import FaqAccordion from "@/features/faqs/components/FaqAccordion";
import { FAQS } from "@/features/faqs/constants";

const playfair = Playfair_Display({ subsets: ["latin"], display: "swap" });
const raleway = Raleway({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "FAQs | Planning & Essentials",
  description: "Common questions about our mobile bar services, booking process, legal requirements, and more in Vancouver and beyond.",
};

export default function FaqsPage() {
  return (
    <main className={`${raleway.className} min-h-screen bg-[#FDFCFB] text-[#303520] overflow-x-hidden w-full`}>
      {/* 1. Simplified Header Section */}
      <section className="px-6 pt-32 pb-12 lg:pt-48 lg:pb-20">
        <div className="mx-auto max-w-7xl">
          <h1 className={`${playfair.className} text-4xl md:text-5xl lg:text-6xl font-light text-[#303520]`}>
            FAQs
          </h1>
          <p className="mt-6 max-w-xl text-base md:text-lg text-[#7C826F] font-light leading-relaxed">
            Common questions about our mobile bar service, legal requirements, 
            and the booking process.
          </p>
        </div>
      </section>

      {/* 2. Content Section - Clean White Background */}
      <section className="px-6 py-12 lg:py-20 border-t border-[#D6CAB7]/20">
        <div className="mx-auto max-w-7xl">
          <FaqAccordion faqs={FAQS} />
        </div>
      </section>
    </main>
  );
}
