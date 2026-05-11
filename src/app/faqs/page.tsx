import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import FaqAccordion from "@/features/faqs/components/FaqAccordion";
import { FAQS } from "@/features/faqs/constants";

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
      <section className="mx-auto max-w-7xl px-6 pt-32 pb-16 lg:pt-48 lg:pb-24">
        <div className="max-w-3xl">
          <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.3em] text-[#7C826F] md:text-xs">
            Planning Guide
          </p>
          <h1 className="text-4xl font-light leading-tight tracking-tight text-[#303520] sm:text-5xl lg:text-7xl">
            Frequently asked <br />
            <span className="italic font-normal text-[#7C826F]">questions.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-base font-light leading-relaxed text-[#7C826F] md:text-lg">
            Clear answers on packages, service details, payments, permits, and
            the planning process for your mobile bar experience.
          </p>
        </div>
      </section>

      <section className="border-t border-[#D6CAB7]/30 bg-[#EAE8E4]/30 px-6 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <FaqAccordion faqs={FAQS} />
        </div>
      </section>
    </main>
  );
}
