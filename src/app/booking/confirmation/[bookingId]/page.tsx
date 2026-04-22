import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getBookingById } from "@/features/booking/service";
import { db } from "@/lib/db";
import { Raleway } from "next/font/google";

const raleway = Raleway({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

type Props = {
  params: Promise<{ bookingId: string }>;
};

export default async function BookingConfirmationPage({ params }: Props) {
  const resolvedParams = await params;
  const bookingId = parseInt(resolvedParams.bookingId);

  if (isNaN(bookingId)) notFound();

  const booking = await getBookingById(bookingId);
  if (!booking) notFound();

  // 모든 음료 정보를 가져와서 매칭 (하이볼 계산용)
  const allDrinksInDb = await db.drink.findMany({
    select: { name: true, alcoholTypes: true }
  });

  const bookedCocktailNames = (booking.cocktails as string[]) || [];
  const usedAlcoholTypes = new Set<string>();
  bookedCocktailNames.forEach(name => {
    const match = allDrinksInDb.find(d => d.name.trim().toLowerCase() === name.trim().toLowerCase());
    if (match && Array.isArray(match.alcoholTypes)) {
      (match.alcoholTypes as string[]).forEach(type => usedAlcoholTypes.add(type));
    }
  });

  const alcoholLabels: Record<string, string> = {
    TEQUILA: "Tequila", VODKA: "Vodka", GIN: "Gin", RUM: "Rum", WHISKEY: "Whiskey",
  };

  const highballMenu = Array.from(usedAlcoholTypes)
    .sort((a, b) => ["TEQUILA", "VODKA", "GIN", "RUM", "WHISKEY"].indexOf(a) - ["TEQUILA", "VODKA", "GIN", "RUM", "WHISKEY"].indexOf(b))
    .map(type => `${alcoholLabels[type]} Highball`);

  const dateLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(booking.date);

  const bookingNumber = `#${String(booking.id).padStart(5, "0")}`;

  return (
    <main className={`${raleway.className} relative min-h-screen md:h-screen w-screen bg-[#EAE8E4] text-[#303520] flex flex-col items-center justify-center md:overflow-hidden py-10 md:py-0`}>
      {/* Background Watermarks */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[-2%] text-[25vw] md:text-[18vw] font-bold text-white/10 uppercase tracking-tighter leading-none select-none">
          CATALYST
        </div>
        <div className="absolute bottom-[5%] right-[-2%] text-[15vw] md:text-[12vw] font-bold text-white/5 uppercase tracking-widest leading-none select-none">
          VANCOUVER
        </div>
      </div>

      <div className="relative z-10 w-full max-w-6xl h-full md:max-h-[90vh] flex flex-col px-4">
        <div className="flex-1 bg-[#FDFCFB] border-t-8 border-t-[#7C826F] border-x border-b border-[#D6CAB7] shadow-2xl flex flex-col animate-in fade-in duration-1000 md:overflow-hidden">
          
          {/* Header */}
          <header className="flex flex-col md:flex-row items-center justify-between px-6 md:px-12 py-8 md:py-10 border-b border-[#F5F2F0] bg-[#F9F8F6]/40 shrink-0">
            <Link href="/" className="mb-6 md:mb-0 block">
              <Image src="/images/catalyst-bar-olive.png" alt="The Catalyst" width={160} height={34} priority />
            </Link>
            <div className="flex flex-col items-center md:items-end">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#7C826F] mb-1">Confirmation Number</span>
              <p className="text-4xl md:text-5xl font-bold tracking-tighter text-[#303520]">{bookingNumber}</p>
            </div>
          </header>

          <div className="flex-1 flex flex-col md:flex-row min-h-0">
            {/* Left Content */}
            <div className="w-full md:w-5/12 p-8 md:p-16 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#F5F2F0] overflow-y-auto">
              <div className="space-y-12">
                <div className="space-y-5">
                  <h1 className="text-4xl md:text-6xl font-light tracking-tight text-[#303520] leading-tight">
                    Cheers, <br />
                    <span className="italic font-normal text-[#7C826F]">{booking.name.split(" ")[0]}.</span>
                  </h1>
                  <p className="text-sm font-medium leading-relaxed text-[#7C826F] max-w-[320px] border-l-2 border-[#7C826F] pl-6">
                    Your inquiry has been successfully received. A curated proposal will reach your inbox within 24-48h.
                  </p>
                </div>

                <div className="space-y-8 pt-4">
                  <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#B1AA9A]">Event Date</span>
                      <p className="text-sm font-bold text-[#303520]">{dateLabel}</p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#B1AA9A]">Guests</span>
                      <p className="text-sm font-bold text-[#303520]">{booking.guestCount} People</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#B1AA9A]">Location</span>
                    <p className="text-sm font-bold text-[#303520] line-clamp-1">{booking.address}</p>
                    <p className="text-[10px] text-[#7C826F] italic font-medium">{booking.venueType} Location</p>
                  </div>
                </div>

                {/* PC Only Price */}
                <div className="hidden md:block pt-8 border-t border-[#F5F2F0]">
                   <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#B1AA9A]">Estimated Total</span>
                   <p className="text-4xl font-light text-[#303520] tracking-tight mt-1">
                     ${booking.estimatedTotal.toLocaleString()}
                   </p>
                </div>
              </div>

              {/* PC Only Button - 확실히 보이도록 margin과 padding 확보 */}
              <div className="hidden md:block mt-16 pt-10 border-t border-[#F5F2F0]">
                <Link 
                  href="/" 
                  className="inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.4em] text-[#303520] group"
                >
                  <span className="border-b-2 border-[#303520] group-hover:text-[#7C826F] group-hover:border-[#7C826F] transition-all pb-1">
                    Return to Homepage
                  </span>
                  <svg className="h-3 w-3 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Right Content */}
            <div className="w-full md:w-7/12 p-8 md:p-16 bg-[#F9F8F6]/30 flex flex-col overflow-hidden">
              <div className="flex-1 space-y-12 overflow-y-auto pr-4 custom-scrollbar">
                <div className="space-y-4">
                  <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#7C826F] block border-b border-[#7C826F]/20 pb-3">Program</span>
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-[#303520] uppercase tracking-tight">{booking.package}</p>
                    <p className="text-[11px] text-[#7C826F] italic font-medium">{booking.hours} Hours of Premium Hospitality</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#7C826F] block border-b border-[#7C826F]/20 pb-3">Curated Menu</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5">
                    {bookedCocktailNames.map((name, i) => (
                      <div key={`c-${i}`} className="flex items-center gap-3">
                        <div className="h-1.5 w-1.5 bg-[#7C826F] rotate-45" />
                        <span className="text-[11px] font-bold text-[#303520] uppercase tracking-tight">{name}</span>
                      </div>
                    ))}
                    {highballMenu.map((name, i) => (
                      <div key={`h-${i}`} className="flex items-center gap-3">
                        <div className="h-1.5 w-1.5 border border-[#7C826F] rotate-45" />
                        <span className="text-[11px] font-medium text-[#7C826F] italic uppercase">{name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {booking.note && (
                  <div className="space-y-4 pt-6 border-t border-[#D6D5CE]/50">
                    <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#7C826F] block">Special Requests</span>
                    <p className="text-[11px] text-[#303520] leading-relaxed bg-white/60 p-5 border-l-4 border-[#7C826F] italic font-medium shadow-sm">
                      "{booking.note}"
                    </p>
                  </div>
                )}

                {/* Mobile Only Section */}
                <div className="md:hidden pt-12 mt-12 border-t border-[#D6D5CE] space-y-10">
                   <div>
                     <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#B1AA9A]">Estimated Total</span>
                     <p className="text-3xl font-light text-[#303520] mt-1">${booking.estimatedTotal.toLocaleString()}</p>
                   </div>
                   <Link href="/" className="flex items-center justify-center bg-[#303520] text-white py-5 text-[10px] font-bold uppercase tracking-[0.5em] shadow-xl active:scale-[0.98] transition-all">
                     Return to Homepage
                   </Link>
                </div>
              </div>

              <div className="pt-10 border-t border-[#F5F2F0] flex justify-between items-center shrink-0 mt-10">
                <div className="space-y-0.5">
                  <p className="text-[9px] text-[#B1AA9A] font-bold uppercase tracking-widest">Inquiries</p>
                  <p className="text-[11px] text-[#303520] font-bold italic">hello@catalystmobilebar.ca</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] text-[#B1AA9A] uppercase font-bold tracking-widest">Vancouver • BC</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-[9px] text-[#7C826F] font-bold uppercase tracking-[1em] opacity-40 text-center">
          The Catalyst Mobile Bar
        </div>
      </div>
    </main>
  );
}
