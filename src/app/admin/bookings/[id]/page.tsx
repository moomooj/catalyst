import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";
import {
  isAllInclusivePackage,
  packageToFormValue,
} from "@/features/booking/constants";
import { getBookingById } from "@/features/booking/service";
import { updateBookingAction } from "@/features/booking/actions";
import { BookingEditServiceAndPricingFields } from "./BookingEditServiceAndPricingFields";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ edit?: string; error?: string }>;
};

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function BookingDetailPage({
  params,
  searchParams,
}: PageProps) {
  await requireAdmin();

  const { id } = await params;
  const bookingId = Number(id);
  if (!Number.isFinite(bookingId)) {
    notFound();
  }

  const booking = await getBookingById(bookingId);
  if (!booking) {
    notFound();
  }

  const cocktailsValue = Array.isArray(booking.cocktails)
    ? booking.cocktails.join(", ")
    : "";
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const isEditMode = resolvedSearchParams?.edit === "1";
  const saveError = resolvedSearchParams?.error;

  async function saveBooking(formData: FormData) {
    "use server";
    const result = await updateBookingAction(formData);
    if (result.ok) {
      redirect(`/admin/bookings/${bookingId}`);
    }
    redirect(
      `/admin/bookings/${bookingId}?edit=1&error=${encodeURIComponent(result.error)}`,
    );
  }

  const fieldClass =
    "rounded-md border border-[#D6CAB7] bg-white px-3 py-2 text-sm text-[#303520] shadow-sm focus:border-[#7C826F] focus:outline-none focus:ring-2 focus:ring-[#7C826F]/20";
  const sectionTitleClass =
    "text-xs font-medium uppercase tracking-[0.24em] text-[#7C826F]";
  const savedOptions = Array.isArray(booking.options) ? booking.options : [];
  const savedTaxes = Array.isArray(booking.taxes) ? booking.taxes : [];
  const isPremium = isAllInclusivePackage(booking.package);
  const basePrice = isPremium ? booking.estimatedTotal : 1000;
  
  // Extra charges for Dry Hire (250 per extra hour > 4, 250 per extra cocktail > 2)
  const extraHours = !isPremium ? Math.max(0, booking.hours - 4) : 0;
  const extraCocktails = !isPremium ? Math.max(0, booking.cocktailNumber - 2) : 0;
  const dryHireExtras = (extraHours * 250) + (extraCocktails * 250);

  const packageLabel = isPremium
    ? "All Inclusive Bar Service"
    : "Dry Hire Mobile Bar Service";

  const optionTotal = savedOptions.reduce(
    (sum: number, opt: { price: number }) => sum + opt.price,
    0,
  );
  const subtotalWithOptions = basePrice + dryHireExtras + optionTotal;
  const taxTotal = savedTaxes.reduce(
    (sum: number, tax: { percentage: number }) =>
      sum + Math.round((subtotalWithOptions * tax.percentage) / 100),
    0,
  );
  
  const totalWithTax = subtotalWithOptions + taxTotal;
  const totalPaid = booking.finalPaid ? totalWithTax : (booking.depositPaid ? (booking.depositAmount || 0) : 0);
  const totalDue = Math.max(0, totalWithTax - totalPaid);

  const invoiceItems: {
    label: string;
    detail: string;
    amount: number | null;
  }[] = [
    {
      label: packageLabel,
      detail: `${toIsoDate(booking.date)} · ${booking.guestCount} guests`,
      amount: basePrice,
    },
    {
      label: "2 Cocktails & 4 Hours",
      detail: cocktailsValue.length > 0 ? cocktailsValue : "Professional mobile bar service",
      amount: null,
    },
    ...(extraHours > 0
      ? [
          {
            label: "Extra Service Hours",
            detail: `${extraHours} additional hour(s) × ${formatCurrency(250)}`,
            amount: extraHours * 250,
          },
        ]
      : []),
    ...(extraCocktails > 0
      ? [
          {
            label: "Extra Cocktail Selection",
            detail: `${extraCocktails} additional cocktail slot(s) × ${formatCurrency(250)}`,
            amount: extraCocktails * 250,
          },
        ]
      : []),
    ...(isPremium
      ? [
          {
            label: "Drink Service",
            detail: `${booking.drinkCount} drinks × ${formatCurrency(booking.perDrinkPrice)}`,
            amount: booking.drinkCount * booking.perDrinkPrice,
          },
        ]
      : []),
    ...savedOptions.map((opt: { title: string; description: string; price: number }) => ({
      label: opt.title,
      detail: opt.description || "Custom option",
      amount: opt.price,
    })),
  ];
  const invoiceNumber = `#${String(booking.id).padStart(5, "0")}`;

  return (
    <main className="min-h-dvh bg-[#EAE8E4] px-6 py-12 text-[#303520]">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <header className="rounded-none bg-[#D6D5CE] p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#7C826F]">
                Booking Detail
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
                {booking.name}
              </h1>
              <p className="mt-2 text-sm text-[#7C826F]">
                {booking.email} · {booking.phone}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/admin/dashboard"
                className="rounded-full border border-[#7C826F] px-5 py-2 text-xs font-medium text-[#7C826F] transition hover:bg-white"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
          {booking.emailSentAt ? (
            <p className="mt-3 text-xs text-[#7C826F]">
              Sent on{" "}
              {new Intl.DateTimeFormat("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              }).format(booking.emailSentAt)}
            </p>
          ) : null}
        </header>

        <div className="rounded-none bg-white/70 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#7C826F]">
                Booking Info
              </p>
              <h2 className="mt-2 text-xl font-semibold">
                {booking.eventType.replace("_", " ")} · {booking.venueType}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {isEditMode ? (
                <Link
                  href={`/admin/bookings/${booking.id}`}
                  className="rounded-full border border-[#7C826F] px-5 py-2 text-xs font-medium text-[#7C826F] transition hover:bg-white"
                >
                  Cancel
                </Link>
              ) : (
                <>
                  <Link
                    href={`/admin/bookings/${booking.id}/payment`}
                    className="rounded-full border border-[#7C826F] px-5 py-2 text-xs font-medium text-[#7C826F] transition hover:bg-white"
                  >
                    Payment Info
                  </Link>
                  <Link
                    href={`/admin/bookings/${booking.id}?edit=1`}
                    className="rounded-full bg-[#7C826F] px-5 py-2 text-xs font-medium text-white"
                  >
                    Edit Booking
                  </Link>
                </>
              )}
            </div>
          </div>

          {isEditMode ? (
            <form action={saveBooking} className="mt-6 space-y-6">
              <input type="hidden" name="id" value={booking.id} />

              {saveError ? (
                <div
                  role="alert"
                  className="rounded-md border border-[#C9A0A0] bg-[#FDF2F2] px-4 py-3 text-sm font-medium text-[#8B2E2E]"
                >
                  {saveError}
                </div>
              ) : null}

              <div className="rounded-md border border-[#E0D9C9] bg-[#FDFCF8] p-5">
                <p className={sectionTitleClass}>Schedule &amp; venue</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium text-[#303520]">
                    Date
                    <input
                      type="date"
                      name="date"
                      defaultValue={toIsoDate(booking.date)}
                      className={fieldClass}
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-[#303520]">
                    Status
                    <select
                      name="status"
                      defaultValue={booking.status}
                      className={fieldClass}
                    >
                      <option 
                        value="NEW" 
                        disabled={booking.depositPaid || booking.finalPaid}
                      >
                        New
                      </option>
                      <option 
                        value="CHECKED" 
                        disabled={booking.depositPaid || booking.finalPaid}
                      >
                        Checked
                      </option>
                      <option 
                        value="DEPOSIT_PAID" 
                        disabled={!booking.depositPaid || booking.finalPaid}
                      >
                        Deposit Paid {booking.depositPaid ? "✓" : "(System Only)"}
                      </option>
                      <option 
                        value="CONFIRMED" 
                        disabled={!booking.finalPaid}
                      >
                        Confirmed/Final Paid {booking.finalPaid ? "✓" : "(System Only)"}
                      </option>
                      <option value="CANCELED">Canceled</option>
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-[#303520]">
                    Event type
                    <select
                      name="eventType"
                      defaultValue={booking.eventType}
                      className={fieldClass}
                    >
                      <option value="WEDDING">Wedding</option>
                      <option value="BRAND">Brand</option>
                      <option value="PRIVATE">Private</option>
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-[#303520]">
                    Venue type
                    <select
                      name="venueType"
                      defaultValue={booking.venueType}
                      className={fieldClass}
                    >
                      <option value="INDOOR">Indoor</option>
                      <option value="OUTDOOR">Outdoor</option>
                    </select>
                  </label>
                  <div className="flex items-end pb-2">
                    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-[#303520]">
                      <input
                        type="checkbox"
                        name="eventsPermit"
                        defaultChecked={booking.eventsPermit}
                        className="h-4 w-4 rounded border border-[#D6CAB7] text-[#7C826F] focus:ring-[#7C826F]/30"
                      />
                      Event permit confirmed
                    </label>
                  </div>
                  <label className="grid gap-2 text-sm font-medium text-[#303520] md:col-span-2">
                    Address
                    <input
                      type="text"
                      name="address"
                      defaultValue={booking.address}
                      className={fieldClass}
                    />
                  </label>
                </div>
              </div>

              <BookingEditServiceAndPricingFields
                sectionTitleClass={sectionTitleClass}
                fieldClass={fieldClass}
                defaultPackageValue={packageToFormValue(booking.package)}
                guestCount={booking.guestCount}
                drinkCount={booking.drinkCount}
                baselinePerDrinkPrice={booking.perDrinkPrice}
                cocktailNumber={booking.cocktailNumber}
                hours={booking.hours}
                baselineEstimatedTotal={booking.estimatedTotal}
                baselineTotal={booking.total}
                defaultOptions={savedOptions}
                defaultTaxes={savedTaxes}
              />

              <div className="rounded-md border border-[#E0D9C9] bg-[#FDFCF8] p-5">
                <p className={sectionTitleClass}>Contact</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium text-[#303520] md:col-span-2">
                    Name
                    <input
                      type="text"
                      name="name"
                      defaultValue={booking.name}
                      className={fieldClass}
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-[#303520]">
                    Email
                    <input
                      type="email"
                      name="email"
                      defaultValue={booking.email}
                      className={fieldClass}
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-[#303520]">
                    Phone
                    <input
                      type="tel"
                      name="phone"
                      defaultValue={booking.phone}
                      className={fieldClass}
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-md border border-[#E0D9C9] bg-[#FDFCF8] p-5">
                <p className={sectionTitleClass}>Notes</p>
                <div className="mt-4 grid gap-4">
                  <label className="grid gap-2 text-sm font-medium text-[#303520]">
                    Cocktails (comma separated)
                    <textarea
                      name="cocktails"
                      rows={3}
                      defaultValue={cocktailsValue}
                      className={`${fieldClass} resize-y`}
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-[#303520]">
                    Note
                    <textarea
                      name="note"
                      rows={3}
                      defaultValue={booking.note ?? ""}
                      className={`${fieldClass} resize-y`}
                    />
                  </label>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#E0D9C9] pt-6">
                <button
                  type="submit"
                  className="rounded-full bg-[#7C826F] px-6 py-2 text-xs font-medium text-white transition hover:bg-[#6B7360]"
                >
                  Save changes
                </button>
              </div>
            </form>
          ) : (
            <div id="invoice" className="mt-6 border border-[#D9D4C7] bg-[#FDFCF8] px-6 py-8 md:px-10">
              <div className="flex flex-wrap items-start justify-between gap-6 border-b border-[#D9D4C7] pb-8">
                <div>
                  <p className="text-2xl font-semibold tracking-tight">
                    Catalyst
                  </p>
                  <p className="text-sm text-[#6E7363]">Mobile Bar</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-semibold tracking-tight">
                    INVOICE
                  </p>
                  <p className="mt-2 text-sm font-medium text-[#303520]">
                    booking Number {invoiceNumber}
                  </p>
                </div>
              </div>

              <div className="mt-7 border-b border-[#D9D4C7] pb-7">
                <dl className="grid gap-x-12 gap-y-6 text-sm sm:grid-cols-2">
                  <div className="space-y-6">
                    <div>
                      <dt className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#7C826F]">
                        Name
                      </dt>
                      <dd className="mt-1.5 text-base font-medium leading-snug text-[#303520]">
                        {booking.name}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#7C826F]">
                        Email
                      </dt>
                      <dd className="mt-1.5 break-all leading-snug text-[#303520]">
                        {booking.email}
                      </dd>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <dt className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#7C826F]">
                        Address
                      </dt>
                      <dd className="mt-1.5 leading-snug text-[#303520]">
                        {booking.address} / {booking.venueType}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#7C826F]">
                        Phone
                      </dt>
                      <dd className="mt-1.5 tabular-nums leading-snug text-[#303520]">
                        {booking.phone}
                      </dd>
                    </div>
                  </div>
                </dl>
              </div>

              <div className="mt-7 border-b border-[#D9D4C7] pb-7">
                <p className="text-3xl font-semibold tracking-tight">
                  Description
                </p>
                <div className="mt-5 space-y-3 text-sm">
                  {invoiceItems.map((item) => (
                    <div
                      key={item.label}
                      className="grid grid-cols-[1fr_auto] items-start gap-4 border-b border-[#ECE8DD] pb-2"
                    >
                      <div>
                        <p className="font-medium text-[#303520]">
                          {item.label}
                        </p>
                        <p className="text-xs leading-relaxed text-[#7C826F] break-words">
                          {item.detail}
                        </p>
                      </div>
                      <p className="text-right font-medium text-[#303520]">
                        {item.amount !== null ? (
                          formatCurrency(item.amount)
                        ) : (
                          <span className="text-sm font-normal text-[#7C826F]">
                            Included
                          </span>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-7 flex justify-end">
                <div className="w-full max-w-sm space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[#7C826F]">Subtotal</span>
                    <span className="font-medium">
                      {formatCurrency(subtotalWithOptions)}
                    </span>
                  </div>
                  {savedTaxes.map(
                    (tax: { title: string; percentage: number }) => {
                      const lineAmount = Math.round(
                        (subtotalWithOptions * tax.percentage) / 100,
                      );
                      return (
                        <div
                          key={tax.title}
                          className="flex items-center justify-between"
                        >
                          <span className="text-[#7C826F]">
                            {tax.title} ({tax.percentage}%)
                          </span>
                          <span className="font-medium">
                            {formatCurrency(lineAmount)}
                          </span>
                        </div>
                      );
                    },
                  )}
                  {savedTaxes.length === 0 ? (
                    <div className="flex items-center justify-between">
                      <span className="text-[#7C826F]">Tax</span>
                      <span className="font-medium">{formatCurrency(0)}</span>
                    </div>
                  ) : null}
                  {booking.finalPaid ? (
                    <div className="flex items-center justify-between border-t border-[#D9D4C7] pt-2 text-base">
                      <span className="font-semibold text-[#7C826F]">Status</span>
                      <span className="font-bold text-[#A3B18A] uppercase tracking-[0.2em]">Fully Paid</span>
                    </div>
                  ) : booking.depositPaid && booking.depositAmount > 0 ? (
                    <div className="flex items-center justify-between">
                      <span className="text-[#7C826F]">Deposit Applied</span>
                      <span className="font-medium text-[#8B2E2E]">
                        -{formatCurrency(booking.depositAmount)}
                      </span>
                    </div>
                  ) : null}
                  <div className={`flex items-center justify-between ${booking.finalPaid ? 'mt-1 opacity-50' : 'border-t border-[#D9D4C7] pt-2 text-base'}`}>
                    <span className="font-semibold">Total Due</span>
                    <span className="font-semibold">
                      {formatCurrency(totalDue)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-6 border-t border-[#D9D4C7] pt-6 md:grid-cols-2">
                <div>
                  <p className="text-2xl font-semibold tracking-tight">
                    Bank Details
                  </p>
                  <p className="mt-3 text-sm text-[#5F6555]">
                    Payment details are confirmed directly by Catalyst admin.
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-semibold tracking-tight">Terms</p>
                  <p className="mt-3 text-sm text-[#5F6555]">
                    Deposit and final payment follow your confirmed booking
                    terms. Please keep this invoice for your records.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
