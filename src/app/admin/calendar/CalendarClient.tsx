"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type BookingSummary = {
  id: number;
  date: Date;
  name: string;
  eventType: string;
  status: string;
};

type Props = {
  initialBookings: BookingSummary[];
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function CalendarClient({ initialBookings }: Props) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());

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

  const changeYear = (newYear: number) => {
    setCurrentDate(new Date(newYear, month, 1));
  };

  const getBookingsForDate = (date: Date) => {
    return initialBookings.filter(b => {
      const bDate = new Date(b.date);
      return bDate.getFullYear() === date.getFullYear() &&
             bDate.getMonth() === date.getMonth() &&
             bDate.getDate() === date.getDate();
    });
  };

  const yearOptions = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i);
  const sectionTitleClass = "text-xs font-medium uppercase tracking-[0.24em] text-[#7C826F]";
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-[#D6D5CE] pb-8">
        <div className="space-y-1">
          <p className={sectionTitleClass}>Administration</p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Booking Calendar</h1>
        </div>
        <Link href="/admin/dashboard" className="rounded-full border border-[#7C826F] px-5 py-2 text-xs font-medium text-[#7C826F] transition hover:bg-white">Back to Dashboard</Link>
      </header>

      <section className="flex flex-wrap items-center justify-between gap-4 bg-white border border-[#D9D4C7] p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => changeMonth(-1)} className="p-2 text-[#7C826F] hover:bg-[#FDFCF8] rounded-full transition">&larr;</button>
          <h2 className="text-xl font-bold tracking-tight min-w-[200px] text-center text-[#303520]">{MONTHS[month]} {year}</h2>
          <button onClick={() => changeMonth(1)} className="p-2 text-[#7C826F] hover:bg-[#FDFCF8] rounded-full transition">&rarr;</button>
        </div>
        <div className="flex items-center gap-2">
          <select value={month} onChange={(e) => setCurrentDate(new Date(year, Number(e.target.value), 1))} className="rounded-md border border-[#D6CAB7] bg-[#FDFCF8] px-3 py-2 text-sm text-[#303520] focus:outline-none">
            {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>
          <select value={year} onChange={(e) => changeYear(Number(e.target.value))} className="rounded-md border border-[#D6CAB7] bg-[#FDFCF8] px-3 py-2 text-sm text-[#303520] focus:outline-none">
            {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={() => setCurrentDate(new Date())} className="ml-2 rounded-full bg-[#7C826F] px-4 py-2 text-xs font-medium text-white hover:bg-[#6B7360]">Today</button>
        </div>
      </section>

      <section className="border border-[#D9D4C7] bg-white shadow-xl overflow-hidden rounded-lg">
        <div className="grid grid-cols-7 text-center bg-[#D6D5CE]">
          {daysOfWeek.map((day) => (
            <div key={day} className="py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#7C826F] border-r border-[#D9D4C7]/50 last:border-r-0">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 border-b border-[#D9D4C7]">
          {calendarDays.map((dateObj, i) => {
            const isToday = new Date().toDateString() === dateObj.fullDate.toDateString();
            const bookingsOnThisDate = getBookingsForDate(dateObj.fullDate);
            const hasBookings = bookingsOnThisDate.length > 0;
            
            return (
              <div key={i} className={`min-h-[160px] p-2 border-r border-b border-[#D9D4C7] transition group relative ${!dateObj.currentMonth ? "bg-[#F7F5F0]/30" : hasBookings ? "bg-[#FDFCF8]" : "bg-white"}`}>
                <div className="flex justify-between items-start mb-2 p-1">
                  <span className={`text-[11px] font-bold ${!dateObj.currentMonth ? "text-[#D6D5CE]" : isToday ? "bg-[#303520] text-white h-6 w-6 flex items-center justify-center rounded-full shadow-md" : "text-[#7C826F]"}`}>
                    {dateObj.day}
                  </span>
                  {isToday && <span className="text-[8px] font-bold uppercase text-[#7C826F] tracking-tighter">Today</span>}
                </div>
                
                <div className="space-y-1.5 overflow-y-auto max-h-[110px] custom-scrollbar px-1">
                  {bookingsOnThisDate.map(booking => {
                    const isFullyPaid = booking.status === "CONFIRMED" || booking.status === "DEPOSIT_PAID";
                    const isCanceled = booking.status === "CANCELED";
                    const isNew = booking.status === "NEW";
                    
                    return (
                      <div 
                        key={booking.id}
                        onClick={() => router.push(`/admin/bookings/${booking.id}`)}
                        className={`flex flex-col p-2 rounded-md shadow-sm border transition cursor-pointer hover:scale-[1.02] active:scale-100 ${
                          isCanceled ? "bg-gray-50 border-gray-200 text-gray-400 line-through opacity-60" :
                          isFullyPaid ? "bg-[#303520] border-[#303520] text-[#EAE8E4]" :
                          isNew ? "bg-[#FDFCF8] border-[#7C826F] text-[#303520]" :
                          "bg-[#7C826F] border-[#7C826F] text-white"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="truncate text-[10px] font-bold leading-tight">{booking.name}</span>
                          {isFullyPaid && <svg className="h-2.5 w-2.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                        </div>
                        <div className={`mt-0.5 text-[8px] font-bold uppercase tracking-wider ${isFullyPaid ? "text-[#7C826F]" : "text-[#7C826F]"}`}>
                          {booking.status.replace('_', ' ')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="flex flex-wrap items-center gap-x-8 gap-y-4 bg-white/50 p-6 rounded-lg border border-[#D9D4C7] text-[10px] font-bold uppercase tracking-widest text-[#7C826F]">
        <div className="flex items-center gap-2"><div className="h-4 w-4 bg-[#303520] rounded-sm shadow-sm"></div><span>Confirmed / Deposit Paid</span></div>
        <div className="flex items-center gap-2"><div className="h-4 w-4 bg-[#7C826F] rounded-sm shadow-sm"></div><span>Checked</span></div>
        <div className="flex items-center gap-2"><div className="h-4 w-4 bg-[#FDFCF8] border border-[#7C826F] rounded-sm shadow-sm"></div><span>New Inquiry</span></div>
        <div className="flex items-center gap-2"><div className="h-4 w-4 bg-gray-50 border border-gray-200 rounded-sm opacity-60"></div><span className="text-gray-400">Canceled</span></div>
      </footer>
    </div>
  );
}
