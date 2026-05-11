"use client";

import { useState } from "react";
import { Raleway } from "next/font/google";

const raleway = Raleway({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

type FaqAnswerBlock =
  | { readonly type: "paragraph"; readonly text: string }
  | { readonly type: "list"; readonly items: readonly string[] };

interface FaqItemProps {
  question: string;
  answer: string | readonly FaqAnswerBlock[];
}

function FaqAnswer({ answer }: { answer: FaqItemProps["answer"] }) {
  if (typeof answer === "string") {
    return (
      <p className={`${raleway.className} text-sm leading-relaxed text-[#7C826F] md:text-base`}>
        {answer}
      </p>
    );
  }

  return (
    <div className={`${raleway.className} space-y-4 text-sm leading-relaxed text-[#7C826F] md:text-base`}>
      {answer.map((block, index) =>
        block.type === "paragraph" ? (
          <p key={`${block.type}-${index}`}>{block.text}</p>
        ) : (
          <ul key={`${block.type}-${index}`} className="space-y-2">
            {block.items.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#7C826F]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}

function FaqItem({ question, answer }: FaqItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="group rounded-md border border-[#D6CAB7]/50 bg-[#FDFCFB] shadow-sm transition-colors hover:border-[#7C826F]/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-start justify-between gap-6 px-5 py-5 text-left transition-all md:px-7 md:py-6"
      >
        <span className={`${raleway.className} text-base font-medium leading-snug tracking-tight text-[#303520] transition-colors group-hover:text-[#7C826F] md:text-lg`}>
          {question}
        </span>
        <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#D6CAB7] text-lg font-light transition-all duration-300 ${isOpen ? "rotate-45 bg-[#7C826F] text-white" : "rotate-0 text-[#7C826F]"}`}>
          +
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? "max-h-[48rem] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-[#D6CAB7]/30 px-5 py-5 md:px-7 md:py-6">
          <FaqAnswer answer={answer} />
        </div>
      </div>
    </div>
  );
}

interface FaqSection {
  category: string;
  items: readonly FaqItemProps[];
}

export default function FaqAccordion({ faqs }: { faqs: readonly FaqSection[] }) {
  return (
    <div className="space-y-20">
      {faqs.map((section) => (
        <section key={section.category} className="space-y-8">
          {/* Category Title */}
          <div>
            <p className={`${raleway.className} mb-4 text-[10px] font-bold tracking-[0.3em] uppercase text-[#7C826F]/60`}>
              The Details
            </p>
            <h2 className={`${raleway.className} text-2xl font-light leading-tight tracking-tight text-[#303520] md:text-4xl`}>
              {section.category}
            </h2>
            <div className="mt-6 h-px w-12 bg-[#D6CAB7]" />
          </div>

          {/* FAQ Items */}
          <div className="grid gap-4">
            {section.items.map((item, idx) => (
              <FaqItem key={idx} {...item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
