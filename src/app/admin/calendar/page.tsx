import { CalendarClient } from "./CalendarClient";
import { db } from "@/lib/db";
import { listAllBusyDatesService } from "@/features/booking/service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Calendar | Admin Dashboard",
};

export default async function AdminCalendarPage() {
  const [bookings, busyDates] = await Promise.all([
    db.booking.findMany({
      where: { isActive: true },
      select: {
        id: true,
        date: true,
        name: true,
        eventType: true,
        status: true,
      },
      orderBy: { date: "asc" },
    }),
    listAllBusyDatesService()
  ]);

  // Date 객체를 ISO 문자열로 변환하여 클라이언트로 전달 (Next.js 캐싱 고려)
  const serializedBookings = bookings.map(b => ({
    ...b,
    date: b.date.toISOString()
  }));

  return (
    <main className="min-h-dvh bg-[#EAE8E4] px-6 py-12 text-[#303520]">
      <CalendarClient 
        initialBookings={serializedBookings as any} 
        initialBusyDates={busyDates} 
      />
    </main>
  );
}
