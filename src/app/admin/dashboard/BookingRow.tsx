"use client";

import { useRouter } from "next/navigation";
import { DeleteBookingButton } from "./DeleteBookingButton";

type Props = {
  booking: {
    id: number;
    date: Date;
    name: string;
    email: string;
    status: string;
    depositPaid: boolean;
    finalPaid: boolean;
  };
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(date));
}

function formatStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

export function BookingRow({ booking }: Props) {
  const router = useRouter();

  const handleRowClick = () => {
    router.push(`/admin/bookings/${booking.id}`);
  };

  return (
    <tr 
      onClick={handleRowClick}
      className="group cursor-pointer transition hover:bg-[#FDFCF8]"
    >
      <td className="px-4 py-4">
        <span className="block text-xs font-medium uppercase tracking-[0.15em] text-[#7C826F] group-hover:text-[#303520]">
          {formatDate(booking.date)}
        </span>
      </td>
      <td className="px-4 py-4 font-medium text-[#303520]">
        {booking.name}
      </td>
      <td className="px-4 py-4 text-[#7C826F]">
        {booking.email}
      </td>
      <td className="px-4 py-4">
        <span className="inline-flex rounded-full border border-[#D6CAB7] bg-[#FDFCF8] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#7C826F]">
          {formatStatus(booking.status)}
        </span>
      </td>
      <td className="px-4 py-4">
        <span className={booking.depositPaid ? "text-[#A3B18A] font-semibold" : "text-[#B1AA9A]"}>
          {booking.depositPaid ? "PAID" : "UNPAID"}
        </span>
      </td>
      <td className="px-4 py-4">
        <span className={booking.finalPaid ? "text-[#A3B18A] font-semibold" : "text-[#B1AA9A]"}>
          {booking.finalPaid ? "PAID" : "UNPAID"}
        </span>
      </td>
      <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
        <DeleteBookingButton bookingId={booking.id} bookingName={booking.name} />
      </td>
    </tr>
  );
}
