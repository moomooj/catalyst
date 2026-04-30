"use client";

import { useState } from "react";
import { Playfair_Display, Raleway } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], display: "swap" });
const raleway = Raleway({ subsets: ["latin"], display: "swap" });

interface FaqItemProps {
  question: string;
  answer: string;
}

function FaqItem({ question, answer }: FaqItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="group border-b border-[#D6CAB7]/30 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-start justify-between py-8 text-left transition-all"
      >
        <span className={`${playfair.className} text-xl md:text-2xl font-light text-[#303520] transition-colors group-hover:text-[#7C826F]`}>
          {question}
        </span>
        <span className={`ml-4 mt-1 text-xl font-light transition-transform duration-500 ${isOpen ? "rotate-45 text-[#7C826F]" : "rotate-0 text-[#D6CAB7]"}`}>
          +
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? "max-h-96 pb-8 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <p className={`${raleway.className} max-w-2xl text-base md:text-lg leading-relaxed text-[#7C826F] font-light`}>
          {answer}
        </p>
      </div>
    </div>
  );
}

interface FaqSection {
  category: string;
  items: FaqItemProps[];
}

export default function FaqAccordion({ faqs }: { faqs: FaqSection[] }) {
  return (
    <div className="space-y-32">
      {faqs.map((section) => (
        <div key={section.category} className="grid gap-12 lg:grid-cols-12">
          {/* Category Title */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <p className={`${raleway.className} mb-4 text-[10px] font-bold tracking-[0.3em] uppercase text-[#7C826F]/60`}>
                The Details
              </p>
              <h2 className={`${playfair.className} text-3xl md:text-4xl font-light text-[#303520]`}>
                {section.category}
              </h2>
              <div className="mt-8 h-px w-12 bg-[#D6CAB7]" />
            </div>
          </div>

          {/* FAQ Items */}
          <div className="lg:col-span-8">
            <div className="divide-y divide-[#D6CAB7]/30">
              {section.items.map((item, idx) => (
                <FaqItem key={idx} {...item} />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
