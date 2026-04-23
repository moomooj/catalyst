"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

export function BookingFilters({ 
  initialQuery = "", 
  initialStatus = "", 
  initialSort = "desc",
  baseUrl = "/admin/dashboard"
}: { 
  initialQuery?: string; 
  initialStatus?: string; 
  initialSort?: string;
  baseUrl?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialQuery);

  // URL 업데이트 함수
  const updateFilters = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    // 페이지 번호는 초기화
    params.delete("page");
    
    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);

  // 검색어 입력 시 Debounce 적용 (300ms)
  useEffect(() => {
    if (query === initialQuery) return;

    const timer = setTimeout(() => {
      updateFilters({ query });
    }, 300);

    return () => clearTimeout(timer);
  }, [query, initialQuery, updateFilters]);

  return (
    <div className="flex flex-wrap items-end gap-4">
      <label className="grid gap-2 text-xs font-bold uppercase tracking-widest text-[#7C826F]">
        Search
        <input
          type="text"
          placeholder="Name, email, #ID..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="rounded-none border border-[#D6CAB7] bg-white px-3 py-2 text-sm focus:border-[#7C826F] focus:outline-none"
        />
      </label>
      
      <label className="grid gap-2 text-xs font-bold uppercase tracking-widest text-[#7C826F]">
        Status
        <select
          value={initialStatus}
          onChange={(e) => updateFilters({ status: e.target.value })}
          className="rounded-none border border-[#D6CAB7] bg-white px-3 py-2 text-sm focus:border-[#7C826F] focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="NEW">New</option>
          <option value="CHECKED">Checked</option>
          <option value="DEPOSIT_PAID">Deposit Paid</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANCELED">Canceled</option>
        </select>
      </label>

      <label className="grid gap-2 text-xs font-bold uppercase tracking-widest text-[#7C826F]">
        Sort
        <select
          value={initialSort}
          onChange={(e) => updateFilters({ sort: e.target.value })}
          className="rounded-none border border-[#D6CAB7] bg-white px-3 py-2 text-sm focus:border-[#7C826F] focus:outline-none"
        >
          <option value="desc">Date desc</option>
          <option value="asc">Date asc</option>
        </select>
      </label>

      <Link
        href={baseUrl}
        onClick={() => setQuery("")}
        className="rounded-full border border-[#7C826F] px-5 py-2 text-xs font-medium text-[#7C826F] transition hover:bg-white"
      >
        Reset
      </Link>
    </div>
  );
}
