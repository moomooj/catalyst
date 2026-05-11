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

const packageComparison = [
  {
    feature: "Bartending Service",
    dryHire: "Included",
    allInclusive: "Included",
  },
  {
    feature: "Mixers & Garnishes",
    dryHire: "Included",
    allInclusive: "Included",
  },
  {
    feature: "Liquor Calculations",
    dryHire: "Included",
    allInclusive: "Included",
  },
  {
    feature: "Alcohol Sourcing",
    dryHire: "Client",
    allInclusive: "Catalyst",
  },
  {
    feature: "Stress Level",
    dryHire: "Moderate",
    allInclusive: "Zero",
  },
] as const;

const highlightedComparisonFeatures = new Set(["Alcohol Sourcing", "Stress Level"]);

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
        <div className="mx-auto max-w-7xl space-y-24">
          <FaqAccordion faqs={FAQS} />

          <div className="rounded-md border border-[#D6CAB7]/50 bg-[#FDFCFB] p-5 shadow-sm md:p-8 lg:p-10">
            <div className="mb-8 max-w-2xl">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.3em] text-[#7C826F]/70">
                Package Comparison
              </p>
              <h2 className="text-2xl font-light leading-tight tracking-tight text-[#303520] md:text-4xl">
                Dry Hire vs. All-Inclusive
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[#7C826F] md:text-base">
                Compare what you manage and what Catalyst handles for each
                package.
              </p>
            </div>

            <div className="overflow-hidden rounded-md border border-[#D6CAB7]/50">
              <div className="hidden md:block">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-[#EAE8E4] text-[10px] uppercase tracking-[0.24em] text-[#7C826F]">
                    <tr>
                      <th className="border-r border-[#D6CAB7]/60 px-5 py-4 font-bold">Feature</th>
                      <th className="border-r border-[#D6CAB7]/60 px-5 py-4 font-bold">Dry Hire</th>
                      <th className="px-5 py-4 font-bold">All-Inclusive</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {packageComparison.map((row) => {
                      const isHighlighted = highlightedComparisonFeatures.has(row.feature);

                      return (
                        <tr
                          key={row.feature}
                          className="border-t border-[#D6CAB7]/60"
                        >
                          <th className={`border-r border-[#D6CAB7]/60 px-5 py-4 font-semibold ${isHighlighted ? "text-[#303520]" : "text-[#7C826F]"}`}>
                            {row.feature}
                          </th>
                          <td className={`border-r border-[#D6CAB7]/60 px-5 py-4 ${isHighlighted ? "bg-[#F7F5F0] font-semibold text-[#303520]" : "text-[#7C826F]"}`}>
                            {row.dryHire}
                          </td>
                          <td className={`px-5 py-4 ${isHighlighted ? "bg-[#7C826F]/15 font-semibold text-[#303520]" : "text-[#7C826F]"}`}>
                            {row.allInclusive}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="grid divide-y divide-[#D6CAB7]/60 bg-white md:hidden">
                {packageComparison.map((row) => {
                  const isHighlighted = highlightedComparisonFeatures.has(row.feature);

                  return (
                    <div
                      key={row.feature}
                      className="p-5"
                    >
                      <p className={`text-sm font-semibold ${isHighlighted ? "text-[#303520]" : "text-[#7C826F]"}`}>
                        {row.feature}
                      </p>
                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div className={`rounded-md border border-[#D6CAB7]/60 p-3 ${isHighlighted ? "bg-[#F7F5F0]" : "bg-white"}`}>
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7C826F]">
                            Dry Hire
                          </p>
                          <p className={`mt-2 ${isHighlighted ? "font-semibold text-[#303520]" : "text-[#7C826F]"}`}>
                            {row.dryHire}
                          </p>
                        </div>
                        <div className={`rounded-md border border-[#D6CAB7]/60 p-3 ${isHighlighted ? "bg-[#7C826F]/15" : "bg-white"}`}>
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7C826F]">
                            All-Inclusive
                          </p>
                          <p className={`mt-2 ${isHighlighted ? "font-semibold text-[#303520]" : "text-[#7C826F]"}`}>
                            {row.allInclusive}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
