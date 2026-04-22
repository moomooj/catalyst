import { BookingCalendarStep } from "@/features/booking/components/BookingCalendarStep";
import { getBusyDatesService } from "@/features/booking/service";
import { db } from "@/lib/db";

export const metadata = {
  title: "Booking | The Catalyst Mobile Bar",
  description:
    "Start your booking inquiry with event details, guest count, and service style preferences."
};

export default async function BookingPage() {
  const [busyDates, drinks] = await Promise.all([
    getBusyDatesService(),
    db.drink.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    })
  ]);

  return <BookingCalendarStep busyDates={busyDates} drinks={drinks} />;
}
