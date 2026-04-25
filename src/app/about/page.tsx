import Image from "next/image";
import Link from "next/link";
import { Raleway } from "next/font/google";

const raleway = Raleway({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "Our Story",
  description:
    "Discover the philosophy behind The Catalyst Mobile Bar. We blend Vancouver's modern lifestyle with premium mixology to create unforgettable event atmospheres.",
  openGraph: {
    title: "Our Story | The Catalyst Mobile Bar",
    description: "Discover the philosophy behind The Catalyst Mobile Bar. We blend Vancouver's modern lifestyle with premium mixology.",
  },
};

export default function AboutPage() {
  return (
    <main className={`${raleway.className} bg-[#FDFCFB] text-[#303520] overflow-x-hidden w-full`}>
      {/* 1. Header Section */}
      <section className="mx-auto max-w-7xl px-6 pt-32 pb-20 lg:pt-48 lg:pb-32">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="mb-6 text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase text-[#7C826F]">
              Our Story
            </p>
            <h1 className="text-4xl sm:text-5xl font-light leading-tight tracking-tight text-[#303520] lg:text-8xl">
              We craft atmosphere, <br />
              <span className="italic font-normal">not just cocktails.</span>
            </h1>
          </div>
          <div className="mt-8 lg:mt-0">
            <div className="h-px w-24 bg-[#D6CAB7] hidden lg:block" />
          </div>
        </div>
      </section>

      {/* 2. Philosophy Section with Image */}
      <section className="px-6 py-20 bg-[#EAE8E4]/30">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:gap-20 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-6">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm shadow-xl">
                <Image
                  src="/images/hospitality.jpg"
                  alt="Crafting the perfect atmosphere"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
            <div className="lg:col-span-6 lg:pl-10">
              <h2 className="text-3xl font-light leading-relaxed lg:text-5xl">
                Founded on the belief that{" "}
                <span className="text-[#7C826F]">hospitality</span> is an art
                form.
              </h2>
              <p className="mt-8 lg:mt-10 text-base lg:text-lg leading-relaxed text-[#7C826F]">
                Catalyst Mobile Bar was born to elevate celebrations through
                refined visual storytelling and flawless execution. We don't
                just set up a bar; we create a destination within your event—a
                space where guests feel cared for and every detail is
                intentionally considered.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Three Pillars Section */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:py-48">
        <div className="grid gap-12 lg:gap-16 lg:grid-cols-3">
          <div className="space-y-4 lg:space-y-6">
            <span className="text-xs font-bold tracking-widest text-[#D6CAB7]">
              01
            </span>
            <h3 className="text-2xl font-light tracking-tight">
              Editorial Standard
            </h3>
            <p className="text-base leading-relaxed text-[#7C826F]">
              Every setup is styled with premium visual restraint. We believe in
              "quiet luxury"—where the bar complements your aesthetic rather
              than competing with it.
            </p>
          </div>
          <div className="space-y-4 lg:space-y-6">
            <span className="text-xs font-bold tracking-widest text-[#D6CAB7]">
              02
            </span>
            <h3 className="text-2xl font-light tracking-tight">
              Regional Lens
            </h3>
            <p className="text-base leading-relaxed text-[#7C826F]">
              We integrate seasonal BC ingredients to create cocktail programs
              that feel fresh and regional. Our menu changes with the landscape
              of the Pacific Northwest.
            </p>
          </div>
          <div className="space-y-4 lg:space-y-6">
            <span className="text-xs font-bold tracking-widest text-[#D6CAB7]">
              03
            </span>
            <h3 className="text-2xl font-light tracking-tight">
              Service Precision
            </h3>
            <p className="text-base leading-relaxed text-[#7C826F]">
              Behind every elegant moment is disciplined prep. We handle the
              complexities of licensing and logistics so you can remain fully
              present with your guests.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Service Area Section - Minimal Grid */}
      <section className="border-t border-[#D6CAB7]/30 px-6 py-24 lg:py-32 bg-[#FDFCFB]">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-light lg:text-4xl">
                Where We Serve
              </h2>
              <p className="mt-6 text-base leading-relaxed text-[#7C826F]">
                Based in Vancouver, our core service area extends to Whistler,
                the Fraser Valley, and the Sunshine Coast. We are experts at
                adapting to diverse venues, from private residences to remote
                outdoor landscapes.
              </p>
            </div>
            <div className="flex flex-col justify-center">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-[#303520]">
                  Licensed & Insured
                </p>
                <p className="text-sm text-[#7C826F]">
                  Serving It Right Certified · Full Liability Coverage
                </p>
              </div>
              <div className="mt-8 h-px w-full bg-[#D6CAB7]/30" />
              <div className="mt-8 space-y-2">
                <p className="text-sm font-semibold text-[#303520]">
                  BC Registered Business
                </p>
                <p className="text-sm text-[#7C826F]">
                  Committed to local excellence and professional standards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Minimal CTA */}
      <section className="px-6 pb-32 lg:pb-48">
        <div className="mx-auto max-w-5xl rounded-sm border border-[#D6CAB7] bg-[#EAE8E4]/20 p-8 md:p-16 lg:p-24 text-center">
          <h2 className="text-3xl font-light text-[#303520] lg:text-5xl">
            Let’s start <span className="italic">planning</span> together.
          </h2>
          <div className="mt-10 lg:mt-12 flex flex-col items-center justify-center gap-6 lg:flex-row">
            <Link
              href="/booking"
              className="inline-flex w-full sm:w-auto justify-center rounded-full bg-[#303520] px-10 py-4 text-sm font-bold tracking-widest uppercase text-white transition hover:bg-[#7C826F]"
            >
              Check Availability
            </Link>
            <Link
              href="/services"
              className="text-xs font-bold tracking-widest uppercase text-[#303520] border-b border-[#303520] pb-1 hover:text-[#7C826F] hover:border-[#7C826F]"
            >
              View Services
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
