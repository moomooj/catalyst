import { BookingCalendarStep } from "@/features/booking/components/BookingCalendarStep";
import { getBusyDatesService } from "@/features/booking/service";

export const metadata = {
  title: "Booking | The Catalyst Mobile Bar",
  description:
    "Start your booking inquiry with event details, guest count, and service style preferences."
};

export default async function BookingPage() {
  const busyDates = await getBusyDatesService();
  return <BookingCalendarStep busyDates={busyDates} />;
}
