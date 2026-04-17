import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { CalendarClient } from "./CalendarClient";

export default async function AdminCalendarPage() {
  await requireAdmin();

  // Fetch basic booking info for the calendar
  const bookings = await db.booking.findMany({
    where: { isActive: true },
    select: {
      id: true,
      date: true,
      name: true,
      eventType: true,
      status: true,
    },
  });

  // Convert dates to a serializable format for the Client Component
  const serializableBookings = bookings.map(b => ({
    ...b,
    date: b.date,
  }));

  return (
    <main className="min-h-dvh bg-[#EAE8E4] px-6 py-12 text-[#303520]">
      <CalendarClient initialBookings={serializableBookings} />
    </main>
  );
}
