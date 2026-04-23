"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Raleway } from "next/font/google";

const raleway = Raleway({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Hydration 오류 방지를 위해 마운트 후 상태 활성화
  useEffect(() => {
    setMounted(true);
    // 초기 화면 크기가 작으면 닫아둠
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  }, []);

  const menuItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { name: "Calendar", href: "/admin/calendar", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { name: "Drinks", href: "/admin/drinks", icon: "M9 12l6 6M9 18l6-6M5 3v2a2 2 0 002 2h10a2 2 0 002-2V3M5 3h14M12 7v14m-4 0h8" },
  ];

  // 마운트 전에는 로직 없이 렌더링하여 Hydration mismatch 방지
  if (!mounted) {
    return <div className={raleway.className}>{children}</div>;
  }

  // 로그인 페이지에서는 레이아웃 제외
  if (pathname === "/admin/login") {
    return <div className={raleway.className}>{children}</div>;
  }

  return (
    <div className={`${raleway.className} flex min-h-screen bg-[#FDFCFB] text-[#303520]`}>
      {/* Sidebar Navigation */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-[#D6D5CE] bg-white transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col p-6">
          <div className="mb-10">
            <Link href="/" className="flex items-center gap-1">
              <span className="text-xl font-light tracking-[0.2em]">CATALYST</span>
              <span className="font-bold text-[#7C826F]">.</span>
            </Link>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.3em] text-[#B1AA9A]">Management</p>
          </div>

          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-4 rounded-sm px-4 py-3 text-sm font-medium transition-colors ${
                  pathname === item.href 
                    ? "bg-[#F9F8F6] text-[#303520]" 
                    : "text-[#7C826F] hover:bg-[#F9F8F6] hover:text-[#303520]"
                }`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                </svg>
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-[#F5F2F0]">
            <Link href="/" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#B1AA9A] hover:text-[#303520]">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Exit Site
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex flex-1 flex-col transition-all duration-300 ${isOpen ? "pl-64" : "pl-0"}`}>
        {/* Toggle Bar / Header */}
        <header className="flex h-16 items-center justify-between border-b border-[#D6D5CE] bg-white px-6">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-10 w-10 items-center justify-center border border-[#D6CAB7] text-[#7C826F] transition-colors hover:bg-[#F9F8F6]"
            aria-label="Toggle Menu"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={isOpen ? "M15 19l-7-7 7-7" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
          
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#B1AA9A]">
            Admin Dashboard
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[1px] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
