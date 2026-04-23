import Image from "next/image";
import Link from "next/link";
import { Raleway } from "next/font/google";

const raleway = Raleway({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const testimonials = [
  {
    id: "olivia-turner",
    quote:
      "Our event felt elevated from the moment the bar opened. The cocktails were beautifully crafted and the service was seamless from start to finish.",
    name: "Olivia Turner",
    role: "Event Host",
    image: "/images/testimonials/review1.jpg",
  },
  {
    id: "ethan-carter",
    quote:
      "The bartenders brought such great energy to the night. Guests kept talking about the drinks and the overall experience.",
    name: "Ethan Carter",
    role: "Private Event Organizer",
    image: "/images/testimonials/review2.jpg",
  },
  {
    id: "daniel-hart",
    quote:
      "Every cocktail was balanced and thoughtfully made. It really added a premium touch to our event.",
    name: "Daniel Hart",
    role: "Corporate Event Planner",
    image: "/images/testimonials/review3.jpg",
  },
  {
    id: "Zoe Richardson",
    quote:
      "Super professional team. Setup was smooth, service was fast, and everything looked amazing.",
    name: "Zoe Richardson",
    role: "Wedding Coordinator",
    image: "/images/testimonials/review4.jpg",
  },
  {
    id: "jonathan-reeves",
    quote:
      "They made hosting effortless. The bar became the highlight of the entire night.",
    name: "Jonathan Reeves",
    role: "Birthday Event Host",
    image: "/images/testimonials/review5.jpg",
  },
  {
    id: "ethan-morales",
    quote:
      "Flexible, reliable, and easy to work with. They handled everything so we could just enjoy the event.",
    name: "Ethan Morales",
    role: "Event Manager",
    image: "/images/testimonials/review6.jpg",
  },
  {
    id: "sofia-chen",
    quote:
      "The presentation, the drinks, the vibe—everything was on point. Our guests were seriously impressed.",
    name: "Sofia Chen",
    role: "Private Party Host",
    image: "/images/testimonials/review7.jpg",
  },
  {
    id: "aria",
    quote:
      "They understood exactly what we needed and delivered beyond expectations. Highly recommend for any event.",
    name: "Aria",
    role: "Wedding Client",
    image: "/images/testimonials/review8.jpg",
  },
  {
    id: "maya-Jackson",
    quote:
      "From planning to the last drink served, everything felt effortless and well taken care of.",
    name: "Maya Jackson",
    role: "Event Host",
    image: "/images/testimonials/review9.jpg",
  },
];

export default function HomePage() {
  return (
    <main className={`${raleway.className} bg-[#FDFCFB] text-[#303520]`}>
      {/* 1. Hero Section - Full Screen Editorial */}
      <section className="relative h-screen w-full overflow-hidden">
        <Image
          src="/images/hero-cocktail.jpg"
          alt="Premium cocktail experience"
          fill
          priority
          quality={100}
          className="object-cover object-center grayscale-[20%]"
        />
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
          <p className="mb-6 text-xs font-medium tracking-[0.4em] uppercase text-white/80">
            Est. 2024 — Catalyst Mobile Bar
          </p>
          <h1 className="max-w-4xl text-5xl font-light leading-tight tracking-tight md:text-8xl">
            The Art of the <br />
            <span className="italic font-normal">Perfect Pour</span>
          </h1>
          <div className="mt-12">
            <Link
              href="/booking"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-white/30 bg-white/10 px-8 py-4 text-sm font-medium backdrop-blur-md transition hover:bg-white hover:text-[#303520]"
            >
              Check Availability
              <svg
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <div className="h-12 w-px bg-gradient-to-b from-white to-transparent" />
        </div>
      </section>

      {/* 2. Brand Statement - Airy & Bold */}
      <section className="mx-auto max-w-7xl px-6 py-32 md:py-48">
        <div className="flex flex-col items-center text-center">
          <p className="mb-8 text-xs font-bold tracking-[0.3em] uppercase text-[#7C826F]">
            Our Philosophy
          </p>
          <h2 className="max-w-4xl text-4xl leading-tight font-light text-[#303520] md:text-6xl">
            Expert mixology meets <br className="hidden md:block" />
            <span className="text-[#7C826F]">
              seamless, end-to-end service.
            </span>
          </h2>
          <p className="mt-12 max-w-xl text-lg leading-relaxed text-[#7C826F]">
            We craft lasting impressions through sophisticated mobile bar
            experiences. From intimate weddings to large-scale brand events, we
            manage every detail so you can focus on the moment.
          </p>
          <div className="mt-16 h-px w-24 bg-[#D6CAB7]" />
        </div>
      </section>

      {/* 3. Editorial Grid - Asymmetrical Layout */}
      <section className="bg-[#EAE8E4]/30 px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-20 md:grid-cols-12 md:items-center">
            {/* Image Block 1 */}
            <div className="relative md:col-span-7">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm shadow-2xl">
                <Image
                  src="/images/bartender.jpg"
                  alt="Professional mixology"
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
              <div className="absolute -bottom-10 -right-10 hidden aspect-square w-64 overflow-hidden rounded-sm border-8 border-[#FDFCFB] shadow-lg md:block">
                <Image
                  src="/images/party-cocktail.jpg"
                  alt="Detail"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Text Block 1 */}
            <div className="md:col-span-5 md:pl-10">
              <p className="mb-4 text-xs font-bold tracking-widest uppercase text-[#7C826F]">
                Tailored Experience
              </p>
              <h3 className="text-3xl font-light leading-snug text-[#303520] md:text-4xl">
                Designed around your flow, guest comfort, and{" "}
                <span className="italic">premium presentation</span>.
              </h3>
              <p className="mt-8 text-base leading-relaxed text-[#7C826F]">
                Our mobile bar isn't just a service—it's a curated environment.
                We adapt to your venue, your theme, and your guest list to
                deliver a truly unique experience.
              </p>
              <Link
                href="/services"
                className="mt-10 inline-block border-b border-[#303520] pb-1 text-sm font-semibold tracking-wide uppercase transition hover:text-[#7C826F] hover:border-[#7C826F]"
              >
                Explore Services
              </Link>
            </div>
          </div>

          <div className="mt-32 grid gap-20 md:grid-cols-12 md:items-center">
            {/* Text Block 2 */}
            <div className="order-2 md:order-1 md:col-span-5 md:pr-10">
              <p className="mb-4 text-xs font-bold tracking-widest uppercase text-[#7C826F]">
                Sustainability
              </p>
              <h3 className="text-3xl font-light leading-snug text-[#303520] md:text-4xl">
                Pure care, by nature. Crafted with{" "}
                <span className="italic">intentionality</span>.
              </h3>
              <p className="mt-8 text-base leading-relaxed text-[#7C826F]">
                We prioritize fresh, locally sourced ingredients and sustainable
                practices. Our team handles everything from custom cocktail
                design to permit management with zero stress for you.
              </p>
            </div>

            {/* Image Block 2 */}
            <div className="order-1 md:order-2 md:col-span-7">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-sm">
                <Image
                  src="/images/cocktail1.jpg"
                  alt="Sustainably sourced ingredients"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Testimonials - Refined Marquee */}
      <section className="overflow-hidden py-32 md:py-48">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="mb-4 text-xs font-bold tracking-widest uppercase text-[#7C826F]">
            Kind Words
          </p>
          <h2 className="text-3xl font-light text-[#303520] md:text-5xl">
            Trusted by professionals.
          </h2>
        </div>

        <div className="review-marquee mt-20">
          <div className="review-track">
            {[...testimonials, ...testimonials].map((item, index) => (
              <article
                key={`${item.id}-${index}`}
                className="flex h-full w-[300px] flex-col justify-between border-r border-[#D6CAB7]/30 px-10 md:w-[400px]"
              >
                <div>
                  <div className="text-4xl text-[#D6CAB7]/50 font-serif leading-none">
                    “
                  </div>
                  <p className="mt-4 text-lg font-light leading-relaxed text-[#303520]">
                    {item.quote}
                  </p>
                </div>
                <div className="mt-10 flex items-center gap-4">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full border border-[#D6CAB7]">
                    <Image
                      src={item.image}
                      alt={`${item.name} avatar`}
                      fill
                      sizes="48px"
                      className="object-cover grayscale"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold tracking-wide text-[#303520]">
                      {item.name}
                    </p>
                    <p className="text-xs uppercase tracking-wider text-[#7C826F]">
                      {item.role}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CTA Section - Minimalist & Elegant */}
      <section className="px-6 py-32 md:py-48">
        <div className="mx-auto max-w-4xl rounded-2xl border border-[#D6CAB7] bg-[#EAE8E4]/20 p-12 text-center md:p-24">
          <p className="mb-6 text-xs font-bold tracking-[0.3em] uppercase text-[#7C826F]">
            Now Booking 2024 & 2025
          </p>
          <h2 className="text-4xl font-light text-[#303520] md:text-6xl">
            Ready to <span className="italic">Elevate</span>{" "}
            <br className="hidden md:block" /> Your Next Event?
          </h2>
          <p className="mx-auto mt-8 max-w-md text-base leading-relaxed text-[#7C826F]">
            Confirm your date with a simple 5-step inquiry. We'll follow up
            within 24–48 hours to craft your custom experience.
          </p>
          <div className="mt-12">
            <Link
              href="/booking"
              className="inline-flex rounded-full bg-[#303520] px-10 py-4 text-sm font-bold tracking-widest uppercase text-white transition hover:bg-[#7C826F]"
            >
              Check Availability
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
