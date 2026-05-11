const BOOKING_DATE_TIME_ZONE = "UTC";

export function formatBookingDateLabel(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: BOOKING_DATE_TIME_ZONE,
  }).format(new Date(date));
}
