"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith("/booking") || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="bg-[#FDFCFB] border-t border-[#D6CAB7]/30 text-[#303520]">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-32">
        <div className="grid gap-16 md:grid-cols-12 md:gap-8">
          {/* Brand Info */}
          <div className="md:col-span-5">
            <Link href="/" className="inline-block">
              <Image
                src="/images/catalyst-bar-olive.png"
                alt="The Catalyst Mobile Bar"
                width={160}
                height={34}
                style={{ width: "auto", height: "auto" }}
                className="max-w-[160px]"
              />            </Link>
            <p className="mt-8 max-w-sm text-base leading-relaxed text-[#7C826F]">
              Crafting sophisticated mobile bar experiences where expert mixology meets seamless, end-to-end service.
            </p>
            <div className="mt-10 flex gap-6">
              <a href="#" className="text-[#7C826F] transition hover:text-[#303520]">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Instagram</span>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div className="md:col-span-3">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#303520]">Explore</h3>
            <ul className="mt-8 space-y-4">
              <li>
                <Link href="/about" className="text-sm text-[#7C826F] transition hover:text-[#303520]">About Us</Link>
              </li>
              <li>
                <Link href="/services" className="text-sm text-[#7C826F] transition hover:text-[#303520]">Services</Link>
              </li>
              <li>
                <Link href="/planning" className="text-sm text-[#7C826F] transition hover:text-[#303520]">Planning Guide</Link>
              </li>
              <li>
                <Link href="/booking" className="text-sm text-[#7C826F] transition hover:text-[#303520]">Book Inquiry</Link>
              </li>
            </ul>
          </div>

          {/* Contact / Credentials */}
          <div className="md:col-span-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#303520]">Contact</h3>
            <div className="mt-8 space-y-6">
              <div>
                <p className="text-sm text-[#7C826F]">General Inquiries</p>
                <a href="mailto:hello@catalystbar.ca" className="mt-1 block text-lg font-light text-[#303520] hover:text-[#7C826F]">
                  hello@catalystbar.ca
                </a>
              </div>
              <div className="pt-6 border-t border-[#D6CAB7]/20">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7C826F]">
                  Vancouver, British Columbia
                </p>
                <p className="mt-2 text-xs text-[#A19C90]">
                  Serving It Right Certified & Fully Insured
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-24 flex flex-col items-center justify-between border-t border-[#D6CAB7]/20 pt-10 md:flex-row md:mt-32">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#A19C90]">
            © {new Date().getFullYear()} Catalyst Mobile Bar. All rights reserved.
          </p>
          <div className="mt-4 flex gap-8 md:mt-0">
            <Link href="/privacy" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A19C90] hover:text-[#303520]">Privacy</Link>
            <Link href="/terms" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A19C90] hover:text-[#303520]">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
