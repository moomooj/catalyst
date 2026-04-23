"use client";

import { useActionState } from "react";
import Link from "next/link";
import Image from "next/image";
import { lookupBookingAction } from "@/features/booking/actions";
import { Raleway } from "next/font/google";

const raleway = Raleway({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export default function BookingLookupPage() {
  const [state, action, isPending] = useActionState(lookupBookingAction, null);

  return (
    <main className={`${raleway.className} min-h-screen bg-[#EAE8E4] px-6 py-20 text-[#303520] flex flex-col items-center justify-center`}>
      <div className="w-full max-w-lg flex flex-col items-center">
        {/* Logo */}
        <div className="mb-12">
          <Link href="/">
            <Image
              src="/images/catalyst-bar-olive.png"
              alt="The Catalyst Mobile Bar"
              width={160}
              height={34}
              style={{ height: "auto" }}
              priority
            />
          </Link>
        </div>

        {/* Lookup Card */}
        <div className="w-full bg-[#FDFCFB] border border-[#D6CAB7] shadow-xl p-8 md:p-12 animate-in fade-in zoom-in-95 duration-700">
          <header className="mb-10 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#7C826F] mb-3">Check Reservation</p>
            <h1 className="text-3xl font-light tracking-tight text-[#303520]">Look up your <br/><span className="italic font-normal">Inquiry</span></h1>
          </header>

          <form action={action} className="space-y-8">
            {state?.error && (
              <div className="rounded-md bg-red-50 p-4 text-xs text-red-600">
                {state.error}
              </div>
            )}
            <div className="space-y-6">
              <label className="block group">
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#B1AA9A] group-focus-within:text-[#7C826F] transition-colors mb-2 block">Booking Number</span>
                <input 
                  name="bookingId" 
                  type="text" 
                  required 
                  placeholder="#00000"
                  className="w-full border-b border-[#D6CAB7] bg-transparent py-3 text-sm focus:border-[#303520] outline-none transition-all placeholder:text-[#D6D5CE]" 
                />
              </label>

              <label className="block group">
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#B1AA9A] group-focus-within:text-[#7C826F] transition-colors mb-2 block">Email Address</span>
                <input 
                  name="email" 
                  type="email" 
                  required 
                  placeholder="The email used for booking"
                  className="w-full border-b border-[#D6CAB7] bg-transparent py-3 text-sm focus:border-[#303520] outline-none transition-all placeholder:text-[#D6D5CE]" 
                />
              </label>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-[#303520] py-4 text-[10px] font-bold uppercase tracking-[0.4em] text-white hover:bg-[#7C826F] transition-all shadow-lg active:scale-[0.98] disabled:bg-[#D6D5CE] disabled:cursor-not-allowed"
              >
                {isPending ? "Searching..." : "Find My Booking"}
              </button>
            </div>
          </form>

          <div className="mt-10 text-center pt-8 border-t border-[#F5F2F0]">
            <Link href="/" className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#B1AA9A] hover:text-[#303520] transition-colors">
              Return to Homepage
            </Link>
          </div>
        </div>

        {/* Footer Tag */}
        <p className="mt-8 text-[9px] text-[#7C826F] font-bold uppercase tracking-[0.6em] opacity-40">
          The Catalyst Mobile Bar
        </p>
      </div>
    </main>
  );
}
