import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";
import { getBookingById, syncBookingPaymentStatusService } from "@/features/booking/service";
import { EmailActions } from "./EmailActions";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PaymentInfoPage({ params }: PageProps) {
  await requireAdmin();

  const { id } = await params;
  const bookingId = Number(id);
  if (!Number.isFinite(bookingId)) {
    notFound();
  }

  // Sync with Stripe before fetching booking data
  await syncBookingPaymentStatusService(bookingId);

  const booking = await getBookingById(bookingId);
  if (!booking) {
    notFound();
  }

  // Price calculation logic (consistent with detail page)
  const isPremium = booking.package.trim().toLowerCase().includes("premium") || 
                    booking.package.trim().toLowerCase().includes("all inclusive");
  const basePrice = isPremium ? booking.estimatedTotal : 1000;
  const extraHours = !isPremium ? Math.max(0, booking.hours - 4) : 0;
  const extraCocktails = !isPremium ? Math.max(0, booking.cocktailNumber - 2) : 0;
  const dryHireExtras = (extraHours * 250) + (extraCocktails * 250);
  
  const savedOptions = Array.isArray(booking.options) ? (booking.options as any[]) : [];
  const savedTaxes = Array.isArray(booking.taxes) ? (booking.taxes as any[]) : [];
  
  const optionTotal = savedOptions.reduce((sum, opt) => sum + (opt.price || 0), 0);
  const subtotalWithOptions = basePrice + dryHireExtras + optionTotal;
  const taxTotal = savedTaxes.reduce(
    (sum, tax) => sum + Math.round((subtotalWithOptions * (tax.percentage || 0)) / 100),
    0
  );
  
  const totalWithTax = subtotalWithOptions + taxTotal;
  const totalPaid = booking.finalPaid ? totalWithTax : (booking.depositPaid ? (booking.depositAmount || 0) : 0);
  const totalDue = Math.max(0, totalWithTax - totalPaid);

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(amount);

  const sectionTitleClass = "text-xs font-medium uppercase tracking-[0.24em] text-[#7C826F]";
  const cardClass = "rounded-none bg-white p-8 shadow-sm border border-[#D9D4C7]";

  // Parse history from notes
  const historyLogs = (booking.note || "").split("\n")
    .filter(line => line.startsWith("[LOG:"))
    .map(line => {
      try {
        const content = line.substring(line.indexOf("] ") + 2);
        const [date, action, amount] = content.split("|");
        return { date: new Date(date), action, amount };
      } catch (e) {
        return null;
      }
    }).filter(Boolean) as { date: Date, action: string, amount: string }[];

  return (
    <main className="min-h-dvh bg-[#EAE8E4] px-6 py-12 text-[#303520]">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        {/* Simplified Header */}
        <header className="rounded-none bg-[#D6D5CE] p-8 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className={sectionTitleClass}>Payment Management</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              {booking.name}
            </h1>
          </div>
          <Link
            href={`/admin/bookings/${booking.id}`}
            className="rounded-full border border-[#7C826F] px-5 py-2 text-xs font-medium text-[#7C826F] transition hover:bg-white"
          >
            Back to Detail
          </Link>
        </header>

        {/* Payment Summary Section (Light & Professional) */}
        <section className="rounded-none border-t-4 border-[#7C826F] bg-[#FDFCF8] p-8 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7C826F]">
            Payment Summary
          </p>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            <div>
              <p className="text-xs text-[#7C826F]">Total Amount</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-[#303520]">{formatCurrency(totalWithTax)}</p>
            </div>
            <div>
              <p className="text-xs text-[#7C826F]">Total Paid</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-[#7C826F]">{formatCurrency(totalPaid)}</p>
            </div>
            <div className="border-t border-[#ECE8DD] pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7C826F]">Balance Due</p>
              <p className="mt-2 text-4xl font-bold tabular-nums tracking-tight text-[#303520]">{formatCurrency(totalDue)}</p>
            </div>
          </div>
        </section>

        {/* Payment Status Section */}
        <section className={cardClass}>
          <p className={sectionTitleClass}>Payment Status</p>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div className="rounded-md border border-[#E0D9C9] bg-[#FDFCF8] p-4 text-center">
              <p className="text-xs text-[#7C826F]">Deposit Status</p>
              <p className="mt-2 font-semibold uppercase">{booking.depositPaid ? "PAID" : "PENDING"}</p>
            </div>
            <div className="rounded-md border border-[#E0D9C9] bg-[#FDFCF8] p-4 text-center">
              <p className="text-xs text-[#7C826F]">Final Payment</p>
              <p className="mt-2 font-semibold uppercase">{booking.finalPaid ? "PAID" : "PENDING"}</p>
            </div>
            <div className="rounded-md border border-[#E0D9C9] bg-[#FDFCF8] p-4 text-center">
              <p className="text-xs text-[#7C826F]">Stripe Status</p>
              <p className="mt-2 font-semibold uppercase">{booking.paymentStatus}</p>
            </div>
          </div>
        </section>

        {/* Email Actions Section */}
        <section className={cardClass}>
          <p className={sectionTitleClass}>Email Communications</p>
          <div className="mt-6">
            <EmailActions 
              bookingId={booking.id} 
              totalWithTax={totalWithTax} 
              defaultDeposit={Math.round(totalWithTax * 0.5)} 
              isPaid={booking.depositPaid}
              isFinalPaid={booking.finalPaid}
            />
          </div>
        </section>

        {/* Payment History Section (New) */}
        <section className={cardClass}>
          <p className={sectionTitleClass}>Payment History</p>
          <div className="mt-6 space-y-6">
            {/* Timeline Item 1: Booking Created */}
            <div className="relative flex gap-4 pb-6">
              <div className="absolute left-[7px] top-2 h-full w-[2px] bg-[#ECE8DD]"></div>
              <div className="relative z-10 h-4 w-4 rounded-full border-2 border-[#7C826F] bg-white"></div>
              <div>
                <p className="text-xs font-bold text-[#7C826F]">
                  {new Date(booking.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
                <p className="mt-1 text-sm font-medium text-[#303520]">Booking Created</p>
                <p className="text-xs text-[#7C826F]">Initial quote generated for {formatCurrency(totalWithTax)}</p>
              </div>
            </div>

            {/* Dynamic History Logs (Email Sends & Payments) */}
            {historyLogs.map((log, idx) => (
              <div key={`log-${idx}`} className="relative flex gap-4 pb-6">
                <div className="absolute left-[7px] top-2 h-full w-[2px] bg-[#ECE8DD]"></div>
                <div className="relative z-10 h-4 w-4 rounded-full border-2 border-[#7C826F] bg-[#7C826F]"></div>
                <div>
                  <p className="text-xs font-bold text-[#7C826F]">
                    {log.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#303520]">{log.action}</p>
                  <p className="text-xs text-[#7C826F]">Amount: {log.amount}</p>
                </div>
              </div>
            ))}

            {/* Final Indicator */}
            {booking.finalPaid && (
              <div className="relative flex gap-4">
                <div className="relative z-10 h-4 w-4 rounded-full border-2 border-[#A3B18A] bg-[#A3B18A]"></div>
                <div>
                  <p className="text-xs font-bold text-[#A3B18A]">Completed</p>
                  <p className="mt-1 text-sm font-medium text-[#303520]">Payment Fully Settled</p>
                  <p className="text-xs text-[#7C826F]">Thank you for your business.</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Other Options Section */}
        <section className={cardClass}>
          <p className={sectionTitleClass}>Additional Options</p>
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#ECE8DD] pb-4">
              <div>
                <p className="font-medium">Manual Adjustment</p>
                <p className="text-xs text-[#7C826F]">Override the total amount or add discounts</p>
              </div>
              <button className="text-xs font-medium text-[#7C826F] underline opacity-50 cursor-not-allowed">
                Open Adjustments
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Refund Process</p>
                <p className="text-xs text-[#7C826F]">Issue a partial or full refund through Stripe</p>
              </div>
              <button className="text-xs font-medium text-[#8B2E2E] underline opacity-50 cursor-not-allowed">
                Refund Settings
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
