import Image from "next/image";
import Link from "next/link";
import { Raleway } from "next/font/google";

const raleway = Raleway({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "Services | Catalyst Mobile Bar",
  description: "Explore our tailored bar programs, signature packages, and expert mixology services.",
};

const serviceTiers = [
  {
    title: "Signature",
    subtitle: "Private Celebrations",
    price: "From $1,000",
    body: "A curated experience for intimate gatherings. Includes a custom cocktail menu, premium garnish styling, and our elegant mobile setup.",
    features: ["Custom 2-Cocktail Menu", "4 Hours of Service", "Premium Garnishes", "Full Bar Supplies"]
  },
  {
    title: "Editorial",
    subtitle: "Weddings & Galas",
    price: "From $1,500",
    body: "Visual-first cocktail direction tailored to your wedding aesthetic. We manage the flow between ceremony and reception with high-touch precision.",
    features: ["Consultative Menu Design", "Extended Service Hours", "Timeline Coordination", "Enhanced Bar Aesthetics"]
  },
  {
    title: "Activation",
    subtitle: "Brands & Corporate",
    price: "Custom Quote",
    body: "Custom drink concepts aligned to your campaign tone and color palette. Designed to create shareable social moments for your brand.",
    features: ["Branded Cocktail Elements", "Volume Efficiency", "Themed Bar Styling", "Multi-Day Support"]
  }
];

export default function ServicesPage() {
  return (
    <main className={`${raleway.className} bg-[#FDFCFB] text-[#303520]`}>
      {/* 1. Header Section */}
      <section className="mx-auto max-w-7xl px-6 pt-32 pb-20 md:pt-48 md:pb-32">
        <div className="max-w-4xl">
          <p className="mb-6 text-xs font-bold tracking-[0.3em] uppercase text-[#7C826F]">
            Services & Menu
          </p>
          <h1 className="text-5xl font-light leading-tight tracking-tight text-[#303520] md:text-8xl">
            Tailored programs <br />
            <span className="italic font-normal text-[#7C826F]">for elevated events.</span>
          </h1>
          <p className="mt-12 max-w-2xl text-xl leading-relaxed text-[#7C826F]">
            We build each service around your event style, guest flow, and visual direction. 
            Every package is designed for polished execution and a memorable guest experience.
          </p>
        </div>
      </section>

      {/* 2. Service Tiers - Modern Grid */}
      <section className="px-6 py-24 bg-[#EAE8E4]/30 border-t border-[#D6CAB7]/30">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-3">
            {serviceTiers.map((tier) => (
              <div key={tier.title} className="group relative flex flex-col h-full border border-[#D6CAB7]/50 bg-[#FDFCFB] p-10 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#7C826F] mb-4">
                  {tier.subtitle}
                </p>
                <h2 className="text-4xl font-light mb-2">{tier.title}</h2>
                <p className="text-sm font-medium text-[#D6CAB7] mb-8">{tier.price}</p>
                <p className="text-base leading-relaxed text-[#7C826F] mb-10 flex-1">
                  {tier.body}
                </p>
                <ul className="space-y-3 mb-12">
                  {tier.features.map(f => (
                    <li key={f} className="text-xs flex items-center gap-3 text-[#303520]">
                      <span className="h-1 w-1 rounded-full bg-[#7C826F]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link 
                  href="/booking" 
                  className="inline-block text-xs font-bold tracking-widest uppercase border-b border-[#303520] pb-1 transition hover:text-[#7C826F] hover:border-[#7C826F]"
                >
                  Select Package
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Detailed Features - Editorial Layout */}
      <section className="mx-auto max-w-7xl px-6 py-32 md:py-48">
        <div className="grid gap-24 md:grid-cols-12 md:items-center">
          <div className="md:col-span-5">
            <h2 className="text-4xl font-light leading-tight md:text-6xl">What’s always <br/><span className="italic">included.</span></h2>
            <p className="mt-8 text-lg leading-relaxed text-[#7C826F]">
              Beyond the spirits and the styling, we provide the foundational elements 
              that ensure a seamless bar operation.
            </p>
            <div className="mt-12 space-y-10">
              <div className="flex gap-6">
                <span className="text-sm font-bold text-[#D6CAB7]">01</span>
                <div>
                  <h4 className="text-lg font-semibold">Expert Mixologists</h4>
                  <p className="text-sm text-[#7C826F] mt-2">Serving It Right certified professionals trained in speed and precision.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <span className="text-sm font-bold text-[#D6CAB7]">02</span>
                <div>
                  <h4 className="text-lg font-semibold">Bar Logistics</h4>
                  <p className="text-sm text-[#7C826F] mt-2">Full setup, take-down, and management of glassware and ice requirements.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <span className="text-sm font-bold text-[#D6CAB7]">03</span>
                <div>
                  <h4 className="text-lg font-semibold">Permit Handling</h4>
                  <p className="text-sm text-[#7C826F] mt-2">Guidance on BC Special Event Permits to ensure 100% legal compliance.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="md:col-span-7">
            <div className="relative aspect-[16/11] w-full overflow-hidden rounded-sm shadow-xl">
              <Image 
                src="/images/bartender.png" 
                alt="Service Detail" 
                fill 
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Large CTA Section */}
      <section className="bg-[#303520] text-white px-6 py-32 md:py-48">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-4xl font-light leading-tight md:text-7xl">
            Let us handle the <br />
            <span className="italic text-white/60">logistics.</span>
          </h2>
          <p className="mt-12 mx-auto max-w-xl text-lg text-white/70 leading-relaxed">
            Every event is unique. Tell us your vision, and we’ll propose a custom service 
            structure that fits your venue and guest list perfectly.
          </p>
          <div className="mt-16">
            <Link
              href="/booking"
              className="inline-flex rounded-full bg-[#FDFCFB] px-12 py-5 text-sm font-bold tracking-widest uppercase text-[#303520] transition hover:bg-[#7C826F] hover:text-white"
            >
              Check Availability
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
