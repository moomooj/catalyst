"use client";

import { useState, useMemo } from "react";
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
    if (hasBookings) return;
    if (isToggling) return;
    setIsToggling(true);
    try {
      await toggleBusyDateAction(toLocalDateString(date));
      router.refresh();
    } catch (err) {
      alert("Failed to update date status.");
    } finally {
      setIsToggling(false);
    }
  };

  const yearOptions = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i);
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="flex h-[calc(100vh-64px)] w-full flex-col overflow-hidden">
      {/* Mini Controls Bar - Replaces Large Header */}
      <section className="flex items-center justify-between px-8 py-4 bg-[#FDFCFB] border-b border-[#D6CAB7] shrink-0">
        <div className="flex items-center gap-6">
          <h1 className="text-sm font-bold uppercase tracking-[0.4em] text-[#303520]">Calendar</h1>
          <div className="h-4 w-px bg-[#D6D5CE]" />
          <div className="flex items-center gap-3">
            <button onClick={() => changeMonth(-1)} className="p-1.5 text-[#7C826F] hover:bg-[#F9F8F6] transition">&larr;</button>
            <h2 className="text-sm font-bold tracking-widest min-w-[150px] text-center text-[#303520] uppercase">{MONTHS[month]} {year}</h2>
            <button onClick={() => changeMonth(1)} className="p-1.5 text-[#7C826F] hover:bg-[#F9F8F6] transition">&rarr;</button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            <select value={month} onChange={(e) => setCurrentDate(new Date(year, Number(e.target.value), 1))} className="rounded-none border border-[#D6CAB7] bg-white px-2 py-1 text-[9px] font-bold uppercase text-[#303520] focus:outline-none">
              {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
            <select value={year} onChange={(e) => setCurrentDate(new Date(Number(e.target.value), month, 1))} className="rounded-none border border-[#D6CAB7] bg-white px-2 py-1 text-[9px] font-bold uppercase text-[#303520] focus:outline-none">
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <button onClick={() => setCurrentDate(new Date())} className="rounded-none bg-[#303520] px-4 py-1.5 text-[9px] font-bold uppercase text-white hover:bg-[#7C826F] transition-all">Today</button>
        </div>
      </section>

      {/* Main Calendar Grid */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="grid grid-cols-7 text-center bg-[#F9F8F6] border-b border-[#D6CAB7] shrink-0">
          {daysOfWeek.map((day) => (
            <div key={day} className="py-2.5 text-[9px] font-bold uppercase tracking-[0.3em] text-[#7C826F] border-r border-[#D6CAB7]/30 last:border-r-0">{day}</div>
          ))}
        </div>

        <div className="flex-1 grid grid-cols-7 min-h-0 bg-white">
          {calendarDays.map((dateObj, i) => {
            const isToday = new Date().toDateString() === dateObj.fullDate.toDateString();
            const bookingsOnThisDate = getBookingsForDate(dateObj.fullDate);
            const hasBookings = bookingsOnThisDate.length > 0;
            const busy = isDateBusy(dateObj.fullDate);
            
            return (
              <div 
                key={i} 
                onClick={() => handleDateClick(dateObj.fullDate, hasBookings)}
                className={`flex flex-col p-1.5 border-r border-b border-[#F5F2F0] transition-colors relative cursor-pointer min-h-0 group ${
                  !dateObj.currentMonth ? "bg-[#F9F8F6]/30 opacity-30" : 
                  busy ? "bg-[#D6CAB7]/40" : 
                  hasBookings ? "bg-[#FDFCFB]" : "bg-white hover:bg-[#FDFCFB]"
                }`}
              >
                <div className="flex justify-between items-start mb-1 shrink-0 relative z-10">
                  <span className={`text-[10px] font-black ${
                    !dateObj.currentMonth ? "text-[#D6D5CE]" : 
                    isToday ? "bg-[#303520] text-white h-5 w-5 flex items-center justify-center shadow-md" : "text-[#B1AA9A]"
                  }`}>
                    {dateObj.day}
                  </span>
                  {busy && <span className="text-[7px] font-black uppercase text-white bg-[#7C826F] px-1.5 py-0.5 tracking-tighter">Private Block</span>}
                </div>
                
                <div className="flex-1 space-y-1 overflow-hidden relative z-10">
                  {bookingsOnThisDate.map(booking => {
                    const isFullyPaid = booking.status === "CONFIRMED" || booking.status === "DEPOSIT_PAID";
                    const isCanceled = booking.status === "CANCELED";
                    
                    return (
                      <div 
                        key={booking.id}
                        onClick={(e) => { e.stopPropagation(); router.push(`/admin/bookings/${booking.id}`); }}
                        className={`flex flex-col p-1 border transition-all hover:scale-[1.02] active:scale-100 shrink-0 ${
                          isCanceled ? "bg-gray-100 border-gray-300 text-gray-400 line-through opacity-50" :
                          isFullyPaid ? "bg-[#1A1C14] border-[#1A1C14] text-[#D6CAB7] shadow-md" :
                          "bg-white border-[#7C826F] text-[#303520]"
                        }`}
                      >
                        <span className="truncate text-[9px] font-bold uppercase tracking-tight">{booking.name}</span>
                        <div className="mt-0.5 text-[6px] font-bold uppercase tracking-widest opacity-80">{booking.status}</div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Diagonal Stripes for Busy Date */}
                {busy && !hasBookings && (
                  <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{ backgroundImage: 'linear-gradient(45deg, #303520 25%, transparent 25%, transparent 50%, #303520 50%, #303520 75%, transparent 75%, transparent)' , backgroundSize: '10px 10px' }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <footer className="flex flex-wrap items-center gap-x-8 px-8 py-3 bg-white border-t border-[#D6CAB7] text-[8px] font-bold uppercase tracking-[0.2em] text-[#7C826F] shrink-0">
        <div className="flex items-center gap-2"><div className="h-2.5 w-2.5 bg-[#1A1C14]"></div><span>Confirmed / Paid</span></div>
        <div className="flex items-center gap-2"><div className="h-2.5 w-2.5 border border-[#7C826F]"></div><span>Inquiry / Pending</span></div>
        <div className="flex items-center gap-2"><div className="h-2.5 w-2.5 bg-[#D6CAB7]"></div><span>Admin Private Block</span></div>
        <p className="ml-auto text-[#B1AA9A] font-medium tracking-normal normal-case italic opacity-80">Click any empty cell to toggle private schedule block.</p>
      </footer>
    </div>
  );
}
