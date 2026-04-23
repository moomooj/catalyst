import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getBookingById } from "@/features/booking/service";
import { db } from "@/lib/db";
import { Raleway } from "next/font/google";
import { redirect } from "next/navigation";

const raleway = Raleway({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

type Props = {
  params: Promise<{ bookingId: string }>;
  searchParams: Promise<{ auth?: string }>;
};

export default async function BookingConfirmationPage({ params, searchParams }: Props) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const bookingId = parseInt(resolvedParams.bookingId);
  const authKey = resolvedSearchParams.auth?.trim().toLowerCase();

  if (isNaN(bookingId)) notFound();

  const booking = await getBookingById(bookingId);
  if (!booking) notFound();

  // 보안 검증: URL의 이메일 키와 예약 이메일이 일치해야 함
  if (!authKey || booking.email.trim().toLowerCase() !== authKey) {
    redirect("/booking/lookup");
  }

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
    <main className={`${raleway.className} relative min-h-screen w-full bg-[#EAE8E4] text-[#303520] flex flex-col items-center py-6 md:py-12 overflow-y-auto`}>
      {/* Background Bold Typography */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[5%] left-[-5%] text-[22vw] font-black text-white/20 uppercase tracking-tighter leading-none opacity-50">
          CONFIRMED
        </div>
        <div className="absolute bottom-[5%] right-[-5%] text-[18vw] font-black text-[#7C826F]/10 uppercase tracking-tighter leading-none">
          CATALYST
        </div>
      </div>

      <div className="relative z-10 w-full max-w-6xl flex flex-col px-4 md:px-6">
        {/* Full-Width Magazine Style Card */}
        <div className="flex-1 bg-[#FDFCFB] border border-[#D6CAB7] shadow-[0_50px_100px_-20px_rgba(48,53,32,0.25)] flex flex-col animate-in fade-in duration-1000 relative">
          
          {/* Top Info Bar */}
          <div className="flex justify-between items-center px-6 md:px-10 py-5 md:py-6 bg-[#303520] text-white shrink-0">
             <div className="flex items-center gap-6 md:gap-10">
               <Image src="/images/catalyst-bar-white.png" alt="Catalyst" width={100} height={22} className="w-[100px] md:w-[120px] h-auto" />
               <div className="h-4 w-px bg-white/30 hidden md:block" />
               <p className="text-[9px] font-bold uppercase tracking-[0.4em] hidden lg:block opacity-80">Premium Mobile Bar Experience</p>
             </div>
             <p className="text-lg md:text-xl font-bold tracking-widest">{bookingNumber}</p>
          </div>

          <div className="flex-1 flex flex-col p-6 md:p-16 justify-between">
            
            {/* Row 1: Greetings & Event Detail */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 md:gap-12 border-b border-[#F5F2F0] pb-10 md:pb-12">
              <div className="max-w-xl">
                <p className="text-[9px] font-bold uppercase tracking-[0.6em] text-[#7C826F] mb-4 md:mb-6">Reservation Confirmation</p>
                <h1 className="text-4xl md:text-7xl font-light tracking-tight text-[#303520] leading-none">
                  Cheers, <span className="italic font-normal text-[#7C826F]">{booking.name.split(" ")[0]}.</span>
                </h1>
                <p className="text-xs md:text-sm mt-6 md:mt-8 text-[#7C826F] leading-relaxed max-w-sm">
                  We have received your event inquiry. A bespoke program proposal is being curated for your upcoming occasion.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-x-8 md:gap-x-16 gap-y-6 w-full md:w-auto md:text-right">
                <div className="space-y-1">
                  <p className="text-[8px] font-bold uppercase tracking-widest text-[#B1AA9A]">Event Date</p>
                  <p className="text-sm md:text-base font-bold">{dateLabel}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] font-bold uppercase tracking-widest text-[#B1AA9A]">Attendance</p>
                  <p className="text-sm md:text-base font-bold">{booking.guestCount} Guests</p>
                </div>
                <div className="col-span-2 space-y-1">
                  <p className="text-[8px] font-bold uppercase tracking-widest text-[#B1AA9A]">Location</p>
                  <p className="text-sm md:text-base font-bold truncate max-w-full md:max-w-[300px] md:ml-auto">{booking.address}</p>
                  <p className="text-[9px] text-[#7C826F] italic">{booking.venueType} Setting</p>
                </div>
              </div>
            </div>

            {/* Row 2: Menu Selection (The Core) */}
            <div className="py-10 md:py-12 flex flex-col justify-center">
              <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-10">
                <h3 className="text-[9px] font-bold uppercase tracking-[0.4em] text-[#7C826F] shrink-0">Menu Selection</h3>
                <div className="h-px flex-1 bg-[#D6D5CE]/50" />
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#B1AA9A] shrink-0">{booking.package}</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-4 md:gap-x-12 gap-y-6">
                {bookedCocktailNames.map((name, i) => (
                  <div key={`c-${i}`} className="flex flex-col border-l border-[#7C826F]/30 pl-4 py-1">
                    <span className="text-[10px] md:text-[11px] font-bold text-[#303520] uppercase tracking-tight leading-tight">{name}</span>
                    <span className="text-[8px] uppercase tracking-widest text-[#7C826F] mt-1 font-bold">Cocktail</span>
                  </div>
                ))}
                {highballMenu.map((name, i) => (
                  <div key={`h-${i}`} className="flex flex-col border-l border-[#D6CAB7] pl-4 py-1">
                    <span className="text-[10px] md:text-[11px] font-medium text-[#7C826F] italic uppercase tracking-tight leading-tight">{name}</span>
                    <span className="text-[8px] uppercase tracking-widest text-[#B1AA9A] mt-1 font-bold">Highball</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 3: Total & Support */}
            <div className="pt-10 border-t-2 border-[#303520] flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
              <div className="space-y-1">
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#B1AA9A]">Estimated Investment</p>
                <p className="text-4xl md:text-5xl font-light tracking-tighter text-[#303520] leading-none">${booking.estimatedTotal.toLocaleString()}</p>
                <p className="text-[8px] text-[#7C826F] font-bold uppercase tracking-widest mt-2">Subject to tax and seasonal adjustments</p>
              </div>
              
              <div className="flex flex-col items-start lg:items-end gap-8 w-full">
                <div className="flex flex-wrap items-center gap-6 md:gap-8">
                  <div className="lg:text-right">
                    <p className="text-[8px] text-[#B1AA9A] font-bold uppercase tracking-widest mb-1">Inquiries</p>
                    <p className="text-xs text-[#303520] font-bold">hello@catalystmobilebar.ca</p>
                  </div>
                  <div className="h-8 w-px bg-[#D6D5CE] hidden sm:block" />
                  <div className="lg:text-right">
                    <p className="text-[8px] text-[#B1AA9A] font-bold uppercase tracking-widest mb-1">Vancouver</p>
                    <p className="text-xs text-[#303520] font-bold tracking-widest">EST. 2024</p>
                  </div>
                </div>
                <Link href="/" className="inline-block w-full md:w-auto text-center bg-[#303520] text-white px-10 py-4 text-[9px] font-bold uppercase tracking-[0.4em] hover:bg-[#7C826F] transition-all shadow-xl">
                  Return to Homepage
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
