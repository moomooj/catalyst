"use client";

import { useState, useMemo, transition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toggleBusyDateAction } from "@/features/booking/actions";

type BookingSummary = {
  id: number;
  date: string | Date;
  name: string;
  eventType: string;
  status: string;
};

type Props = {
  initialBookings: BookingSummary[];
  initialBusyDates: string[];
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function CalendarClient({ initialBookings, initialBusyDates }: Props) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isToggling, setIsToggling] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const days = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({ day: prevMonthLastDay - i, currentMonth: false, fullDate: new Date(year, month - 1, prevMonthLastDay - i) });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, currentMonth: true, fullDate: new Date(year, month, i) });
    }
    const remainingSlots = 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      days.push({ day: i, currentMonth: false, fullDate: new Date(year, month + 1, i) });
    }
    return days;
  }, [year, month, daysInMonth, firstDayOfMonth]);

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(year, month + offset, 1));
  };

  const getBookingsForDate = (date: Date) => {
    return initialBookings.filter(b => {
      const bDate = new Date(b.date);
      return bDate.getFullYear() === date.getFullYear() &&
             bDate.getMonth() === date.getMonth() &&
             bDate.getDate() === date.getDate();
    });
  };

  const toLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isDateBusy = (date: Date) => {
    const dateStr = toLocalDateString(date);
    return initialBusyDates.includes(dateStr);
  };

  const handleDateClick = async (date: Date, hasBookings: boolean) => {
    if (hasBookings) return; // 예약이 있으면 차단 불가
    if (isToggling) return;

    setIsToggling(true);
    const dateStr = toLocalDateString(date);
    
    try {
      await toggleBusyDateAction(dateStr);
      router.refresh(); // 최신 데이터 반영
    } catch (err) {
      alert("Failed to update date status.");
    } finally {
      setIsToggling(false);
    }
  };

  const yearOptions = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i);
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-[#D6D5CE] pb-8">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#7C826F]">Administration</p>
          <h1 className="text-4xl font-light tracking-tight text-[#303520] md:text-5xl">Calendar</h1>
        </div>
        <Link href="/admin/dashboard" className="rounded-none border border-[#7C826F] px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#7C826F] transition-all hover:bg-[#7C826F] hover:text-white">Dashboard</Link>
      </header>

      <section className="flex flex-wrap items-center justify-between gap-4 bg-white border border-[#D6CAB7] p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => changeMonth(-1)} className="p-2 text-[#7C826F] hover:bg-[#F9F8F6] transition">&larr;</button>
          <h2 className="text-xl font-light tracking-tight min-w-[200px] text-center text-[#303520] uppercase">{MONTHS[month]} {year}</h2>
          <button onClick={() => changeMonth(1)} className="p-2 text-[#7C826F] hover:bg-[#F9F8F6] transition">&rarr;</button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <select value={month} onChange={(e) => setCurrentDate(new Date(year, Number(e.target.value), 1))} className="rounded-none border border-[#D6CAB7] bg-white px-3 py-2 text-[10px] font-bold uppercase text-[#303520] focus:outline-none">
              {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
            <select value={year} onChange={(e) => setCurrentDate(new Date(Number(e.target.value), month, 1))} className="rounded-none border border-[#D6CAB7] bg-white px-3 py-2 text-[10px] font-bold uppercase text-[#303520] focus:outline-none">
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <button onClick={() => setCurrentDate(new Date())} className="rounded-none bg-[#303520] px-6 py-2 text-[10px] font-bold uppercase text-white hover:bg-[#7C826F] transition-all">Today</button>
        </div>
      </section>

      <div className="border border-[#D6CAB7] bg-white shadow-xl overflow-hidden">
        <div className="grid grid-cols-7 text-center bg-[#F9F8F6] border-b border-[#D6CAB7]">
          {daysOfWeek.map((day) => (
            <div key={day} className="py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-[#7C826F]">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {calendarDays.map((dateObj, i) => {
            const isToday = new Date().toDateString() === dateObj.fullDate.toDateString();
            const bookingsOnThisDate = getBookingsForDate(dateObj.fullDate);
            const hasBookings = bookingsOnThisDate.length > 0;
            const busy = isDateBusy(dateObj.fullDate);
            
            return (
              <div 
                key={i} 
                onClick={() => handleDateClick(dateObj.fullDate, hasBookings)}
                className={`min-h-[160px] p-2 border-r border-b border-[#F5F2F0] transition group relative cursor-pointer ${
                  !dateObj.currentMonth ? "bg-[#F9F8F6]/30 opacity-40" : 
                  busy ? "bg-[#F5F2F0]" : 
                  hasBookings ? "bg-[#FDFCFB]" : "bg-white hover:bg-[#FDFCFB]"
                }`}
              >
                <div className="flex justify-between items-start mb-2 p-1">
                  <span className={`text-[11px] font-bold ${
                    !dateObj.currentMonth ? "text-[#D6D5CE]" : 
                    isToday ? "bg-[#7C826F] text-white h-6 w-6 flex items-center justify-center shadow-md" : "text-[#B1AA9A]"
                  }`}>
                    {dateObj.day}
                  </span>
                  {busy && <span className="text-[7px] font-bold uppercase text-[#7C826F] bg-white px-1.5 py-0.5 border border-[#D6CAB7]">Private</span>}
                </div>
                
                <div className="space-y-1.5 overflow-y-auto max-h-[110px] custom-scrollbar px-1">
                  {bookingsOnThisDate.map(booking => {
                    const isFullyPaid = booking.status === "CONFIRMED" || booking.status === "DEPOSIT_PAID";
                    const isCanceled = booking.status === "CANCELED";
                    
                    return (
                      <div 
                        key={booking.id}
                        onClick={(e) => { e.stopPropagation(); router.push(`/admin/bookings/${booking.id}`); }}
                        className={`flex flex-col p-2 border transition cursor-pointer hover:shadow-md ${
                          isCanceled ? "bg-gray-50 border-gray-200 text-gray-400 line-through opacity-60" :
                          isFullyPaid ? "bg-[#303520] border-[#303520] text-[#EAE8E4]" :
                          "bg-white border-[#D6CAB7] text-[#303520]"
                        }`}
                      >
                        <span className="truncate text-[10px] font-bold uppercase tracking-tight">{booking.name}</span>
                        <div className="mt-0.5 text-[7px] font-bold uppercase tracking-widest opacity-70">
                          {booking.status}
                        </div>
                      </div>
                    );
                  })}
                  {busy && !hasBookings && (
                    <div className="h-full flex items-center justify-center pt-8">
                       <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#B1AA9A]">Schedule Blocked</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <footer className="flex flex-wrap items-center gap-x-10 gap-y-4 bg-white p-8 border border-[#D6CAB7] text-[10px] font-bold uppercase tracking-[0.2em] text-[#7C826F]">
        <div className="flex items-center gap-3"><div className="h-3 w-3 bg-[#303520]"></div><span>Booked & Paid</span></div>
        <div className="flex items-center gap-3"><div className="h-3 w-3 border border-[#D6CAB7]"></div><span>Pending</span></div>
        <div className="flex items-center gap-3"><div className="h-3 w-3 bg-[#F5F2F0] border border-[#D6CAB7]"></div><span>Admin Blocked (Private)</span></div>
        <p className="ml-auto text-[#B1AA9A] font-normal italic lowercase">Tip: Click an empty date to toggle private block.</p>
      </footer>
    </div>
  );
}
