import Link from "next/link";
import Image from "next/image";
import { Raleway } from "next/font/google";

const raleway = Raleway({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

type SuccessPageProps = {
  searchParams: Promise<{
    name?: string;
    date?: string;
    guests?: string;
    cocktails?: string;
    highballs?: string;
  }>;
};

export default async function BookingSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const name = params.name || "there";
  const date = params.date || "-";
  const guests = params.guests || "0";
  const cocktails = params.cocktails ? params.cocktails.split(",") : [];
  const highballs = params.highballs ? params.highballs.split(",") : [];

  return (
    <main className={`${raleway.className} min-h-screen bg-[#EAE8E4] px-6 py-20 text-[#303520] flex flex-col items-center justify-center`}>
      <div className="w-full max-w-2xl flex flex-col items-center">
        {/* Logo */}
        <div className="mb-16">
          <Link href="/">
            <Image
              src="/images/catalyst-bar-olive.png"
              alt="The Catalyst Mobile Bar"
              width={180}
              height={38}
              style={{ height: "auto" }}
              priority
            />
          </Link>
        </div>

        {/* Success Message Card */}
        <div className="w-full bg-[#FDFCFB] border border-[#D6CAB7] shadow-xl p-10 md:p-16 text-center">
          <div className="mb-10 flex h-20 w-20 items-center justify-center rounded-full bg-[#7C826F]/10 text-[#7C826F] mx-auto">
            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-4xl font-light tracking-tight text-[#303520] md:text-5xl">
            Inquiry <span className="italic">Received.</span>
          </h1>
          
          <p className="mt-8 text-base leading-relaxed text-[#7C826F] max-w-md mx-auto">
            Thank you, {name}. We’ve received your event details and will review our availability. 
            Expect a tailored proposal in your inbox within 24-48 hours.
          </p>

          {/* Summary Details */}
          <div className="mt-12 w-full border border-[#D6CAB7]/50 bg-[#F9F8F6] p-8 text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#B1AA9A] mb-6 text-center border-b border-[#D6D5CE]/30 pb-3">
              Inquiry Summary
            </p>
            
            <div className="space-y-4">
              <div className="flex justify-between border-b border-[#D6D5CE]/20 pb-3">
                <span className="text-[10px] uppercase tracking-wider text-[#7C826F]">Event Date</span>
                <span className="text-xs font-bold text-[#303520]">{date}</span>
              </div>
              
              <div className="flex justify-between border-b border-[#D6D5CE]/20 pb-3">
                <span className="text-[10px] uppercase tracking-wider text-[#7C826F]">Guest Count</span>
                <span className="text-xs font-bold text-[#303520]">{guests} People</span>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <span className="text-[10px] uppercase tracking-wider text-[#7C826F]">Requested Menu</span>
                <div className="flex flex-col gap-1.5 pl-1">
                  {cocktails.map((c, i) => (
                    <p key={`cocktail-${i}`} className="text-xs font-bold text-[#303520]">{c}</p>
                  ))}
                  {highballs.map((h, i) => (
                    <p key={`highball-${i}`} className="text-xs font-medium text-[#7C826F] italic">
                      + {h}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-10 border-t border-[#F5F2F0]">
            <Link
              href="/"
              className="inline-block rounded-none bg-[#303520] px-12 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-white transition hover:bg-[#7C826F] shadow-md"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
