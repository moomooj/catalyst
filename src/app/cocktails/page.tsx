import type { Metadata } from "next";
import { Playfair_Display, Raleway } from "next/font/google";
import DrinkList from "@/features/drinks/components/DrinkList";
import { getAllDrinks } from "@/features/drinks/service";

const playfair = Playfair_Display({ subsets: ["latin"], display: "swap" });
const raleway = Raleway({ subsets: ["latin"], display: "swap", weight: ["300", "400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Cocktail Lookbook | Vancouver Premium Signature Menu",
  description: "Explore our curated collection of signature cocktails. Featuring premium spirits, house-made syrups, and seasonal Vancouver botanicals for weddings and events.",
  keywords: ["Vancouver Cocktail Menu", "Wedding Bar Services BC", "Signature Cocktails", "Mobile Bar Menu", "Craft Cocktails Vancouver"],
  openGraph: {
    title: "Cocktail Lookbook | The Catalyst Mobile Bar",
    description: "Handcrafted signature cocktails for premium events in Vancouver.",
    images: ["/images/hero-cocktail.jpg"],
  },
};

export default async function CocktailsPage() {
  const drinks = await getAllDrinks();

  return (
    <main className={`${raleway.className} min-h-screen bg-[#FDFCFB] text-[#303520] overflow-x-hidden`}>
      {/* Hero Section - Compact */}
      <section className="relative px-6 pt-32 pb-10 lg:pt-40 lg:pb-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="mb-4 text-[10px] md:text-xs font-bold tracking-[0.4em] uppercase text-[#7C826F]">
              The Lookbook
            </p>
            <h1 className={`${playfair.className} text-4xl sm:text-5xl md:text-6xl font-light leading-tight text-[#303520]`}>
              The Art of <span className="italic">Mixology</span>
            </h1>
            <p className="mt-6 text-base md:text-lg font-light leading-relaxed text-[#7C826F]">
              A curated collection of signature cocktails crafted with premium spirits and seasonal botanicals.
            </p>
          </div>
        </div>
      </section>

      {/* Menu Grid Section - Reduced top padding */}
      <section className="px-6 py-10 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <DrinkList initialDrinks={drinks} />
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="bg-[#EAE8E4]/30 px-6 py-24 lg:py-48">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className={`${playfair.className} text-3xl md:text-4xl lg:text-5xl font-light text-[#303520]`}>
            Beyond the <span className="italic">Standard Pour</span>
          </h2>
          <p className="mt-10 text-base md:text-lg lg:text-xl leading-relaxed text-[#7C826F] font-light">
            We believe the bar should be the heartbeat of your event. 
            Our mixologists don&apos;t just serve drinks; they create sensory experiences 
            that spark conversation and lasting memories.
          </p>
        </div>
      </section>
    </main>
  );
}
