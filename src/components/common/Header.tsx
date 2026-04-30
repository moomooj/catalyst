"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/cocktails", label: "Cocktails" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname.startsWith("/booking") || pathname.startsWith("/admin")) {
    return null;
  }

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <header 
        className={`fixed top-0 left-0 z-50 w-full transition-all duration-500 ${
          isHome 
            ? isScrolled 
              ? "bg-[#FDFCFB]/90 py-4 shadow-sm backdrop-blur-md" 
              : "bg-transparent py-8"
            : "bg-[#FDFCFB]/90 py-4 shadow-sm backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 md:px-10">
          <Link
            href="/"
            className="group relative inline-flex items-center"
            onClick={closeMenu}
            aria-label="Go to home"
          >
            <Image
              src={isHome && !isScrolled ? "/images/catalyst-bar-white.png" : "/images/catalyst-bar-olive.png"}
              alt="The Catalyst Mobile Bar"
              width={160}
              height={34}
              className="w-[140px] md:w-[160px] h-auto transition-all duration-300"
              priority
            />
          </Link>
          
          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-12 md:flex"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[10px] font-bold uppercase tracking-[0.3em] transition-colors duration-300 ${
                  isHome && !isScrolled 
                    ? "text-white/80 hover:text-white" 
                    : "text-[#7C826F] hover:text-[#303520]"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/booking"
              className={`rounded-full border px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 ${
                isHome && !isScrolled
                  ? "border-white/30 bg-white/10 text-white backdrop-blur-md hover:bg-white hover:text-[#303520]"
                  : "border-[#7C826F] bg-transparent text-[#7C826F] hover:bg-[#7C826F] hover:text-white"
              }`}
            >
              Check Availability
            </Link>
          </nav>

          <button
            type="button"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className={`flex flex-col gap-1.5 md:hidden ${
              isHome && !isScrolled ? "text-white" : "text-[#303520]"
            }`}
          >
            <span className={`h-px w-6 bg-current transition-transform duration-300 ${isMenuOpen ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`h-px w-6 bg-current transition-opacity duration-300 ${isMenuOpen ? "opacity-0" : ""}`} />
            <span className={`h-px w-6 bg-current transition-transform duration-300 ${isMenuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-[#303520]/40 backdrop-blur-sm transition-opacity duration-500 md:hidden ${
          isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeMenu}
      />

      {/* Mobile Drawer */}
      <aside
        className={`fixed top-0 right-0 z-[70] h-full w-[85%] border-l border-[#D6CAB7]/30 bg-[#FDFCFB] p-10 shadow-2xl transition-transform duration-500 ease-out md:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="mb-20 flex items-center justify-between">
            <Image
              src="/images/catalyst-bar-olive.png"
              alt="The Catalyst Mobile Bar"
              width={140}
              height={30}
              className="h-auto"
              priority
            />
            <button onClick={closeMenu} className="text-[#7C826F] hover:text-[#303520]">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex flex-col gap-10">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="text-2xl font-light tracking-tight text-[#303520]"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/booking"
              onClick={closeMenu}
              className="mt-4 rounded-full bg-[#303520] py-4 text-center text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#7C826F]"
            >
              Check Availability
            </Link>
          </nav>
          
          <div className="mt-auto pt-10 border-t border-[#D6CAB7]/30">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#7C826F]">
              Vancouver, BC
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
