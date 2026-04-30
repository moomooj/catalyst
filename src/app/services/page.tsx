import Image from "next/image";
import { Raleway } from "next/font/google";

const raleway = Raleway({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "Services & Packages",
  description:
    "Explore our premium bar programs in Vancouver: Dry Hire for flexibility and All-Inclusive for a complete, luxury cocktail experience.",
  openGraph: {
    title: "Services & Packages | The Catalyst Mobile Bar",
    description: "Premium mobile bar services in Vancouver: Dry Hire and All-Inclusive cocktail packages.",
  },
};

const serviceTiers = [
  {
    title: "Dry Hire Package",
    subtitle: "The Foundation",
    price: "From $1,000",
    body: "The perfect setup for hosts who prefer to provide their own spirits. We handle the logistics, professional mixology, and refined setup to elevate your event.",
    features: [
      "2 Certified Mixologists",
      "2 Signature Cocktails Choice",
      "4 Hours of Service",
      "Basic Garnishes & Mixers",
      "Portable Bar Setup",
      "Ice, Cups, Straws & Napkins",
    ],
  },
  {
    title: "All Inclusive Package",
    subtitle: "The Full Experience",
    price: "From $1,350",
    body: "Our premium turnkey solution. We provide everything needed for a high-end cocktail experience, from bespoke menu design to full spirit procurement and styling.",
    features: [
      "Custom 2-4 Cocktail Menu",
      "Full Spirit Procurement",
      "Premium Garnish Styling",
      "Consultative Menu Design",
      "Enhanced Bar Aesthetics",
      "Full Logistic Management",
    ],
  },
];

export default function ServicesPage() {
  return (
    <main className={`${raleway.className} bg-[#FDFCFB] text-[#303520] overflow-x-hidden w-full`}>
      {/* 1. Header Section */}
      <section className="mx-auto max-w-7xl px-6 pt-32 pb-20 lg:pt-48 lg:pb-32 text-center">
        <div className="max-w-4xl mx-auto">
          <p className="mb-6 text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase text-[#7C826F]">
            Services & Menu
          </p>
          <h1 className="text-4xl sm:text-5xl font-light leading-tight tracking-tight text-[#303520] lg:text-8xl">
            Tailored programs <br />
            <span className="italic font-normal text-[#7C826F]">
              for elevated events.
            </span>
          </h1>
        </div>
      </section>

      {/* 2. Service Tiers - iPad까지 1열 유지, lg 이상에서 2열 */}
      <section className="px-6 py-20 lg:py-24 bg-[#EAE8E4]/30 border-t border-[#D6CAB7]/30">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:gap-12 lg:grid-cols-2 max-w-5xl mx-auto">
            {serviceTiers.map((tier) => (
              <div
                key={tier.title}
                className="flex flex-col h-full border border-[#D6CAB7]/50 bg-[#FDFCFB] p-8 md:p-12 lg:p-10 shadow-sm"
              >
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#7C826F] mb-4">
                  {tier.subtitle}
                </p>
                <h2 className="text-3xl md:text-4xl font-light mb-2">{tier.title}</h2>
                <p className="text-sm font-bold text-[#D6CAB7] mb-8">
                  {tier.price}
                </p>
                <p className="text-base leading-relaxed text-[#7C826F] mb-10 flex-1">
                  {tier.body}
                </p>
                <ul className="grid grid-cols-1 gap-x-4 gap-y-3 border-t border-[#F5F2F0] pt-8 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {tier.features.map((f) => (
                    <li
                      key={f}
                      className="text-xs flex items-center gap-3 text-[#303520] font-medium"
                    >
                      <span className="h-1 w-1 rounded-full bg-[#7C826F]" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Detailed Features - lg 미만에서 세로 쌓임 */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:py-48 overflow-hidden">
        <div className="grid gap-12 lg:gap-24 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5 order-2 lg:order-1">
            <h2 className="text-4xl font-light leading-tight lg:text-6xl">
              What’s always <br />
              <span className="italic">included.</span>
            </h2>
            <p className="mt-8 text-base lg:text-lg leading-relaxed text-[#7C826F]">
              Beyond the spirits and the styling, we provide the foundational
              elements that ensure a seamless bar operation.
            </p>
            <div className="mt-10 lg:mt-12 space-y-8 lg:space-y-10">
              <div className="flex gap-6">
                <span className="text-sm font-bold text-[#D6D5CE]">01</span>
                <div>
                  <h4 className="text-lg font-semibold uppercase tracking-tight">
                    Expert Mixologists
                  </h4>
                  <p className="text-sm text-[#7C826F] mt-2">
                    Serving It Right certified professionals trained in speed,
                    precision, and hospitality.
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <span className="text-sm font-bold text-[#D6D5CE]">02</span>
                <div>
                  <h4 className="text-lg font-semibold uppercase tracking-tight">
                    4 Hours of Service
                  </h4>
                  <p className="text-sm text-[#7C826F] mt-2">
                    A standard 4-hour service window, adaptable to your event
                    timeline and guest flow.
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <span className="text-sm font-bold text-[#D6D5CE]">03</span>
                <div>
                  <h4 className="text-lg font-semibold uppercase tracking-tight">
                    Signature Menu
                  </h4>
                  <p className="text-sm text-[#7C826F] mt-2">
                    Selection of 2 curated signature cocktails tailored to your
                    visual and flavor preferences.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="relative aspect-video lg:aspect-[16/11] w-full overflow-hidden rounded-sm shadow-xl">
              <Image
                src="/images/garnish.jpg"
                alt="Service Detail"
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Large Informational Footer */}
      <section className="bg-[#303520] text-white px-6 py-32 lg:py-48 text-center">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-4xl font-light leading-tight lg:text-7xl">
            Let us handle the <br />
            <span className="italic text-white/60">logistics.</span>
          </h2>
          <p className="mt-12 mx-auto max-w-xl text-lg text-white/70 leading-relaxed">
            Every event is unique. Tell us your vision, and we’ll propose a
            custom service structure that fits your venue and guest list
            perfectly.
          </p>
        </div>
      </section>
    </main>
  );
}
