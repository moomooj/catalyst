import { BookingCalendarStep } from "@/features/booking/components/BookingCalendarStep";
import { getBusyDatesService } from "@/features/booking/service";
import { db } from "@/lib/db";

export const metadata = {
  title: "Book Your Event",
  description:
    "Check availability and get a quote for your Vancouver event. Start your booking inquiry for premium mobile bar services today.",
  openGraph: {
    title: "Book Your Event | The Catalyst Mobile Bar",
    description: "Check availability and get a quote for your Vancouver event today.",
  },
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
