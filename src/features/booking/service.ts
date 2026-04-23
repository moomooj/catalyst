import "server-only";

import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { getAppBaseUrl, stripe } from "@/lib/stripe";
import type { BookingCreateInput, BookingUpdateInput } from "./schema";
import type { Result } from "./types";

type BookingCreateResult = {
  id: number;
};

const EVENT_TYPE_MAP: Record<
  BookingCreateInput["eventType"],
  "WEDDING" | "BRAND" | "PRIVATE"
> = {
  Wedding: "WEDDING",
  "Corporate Event": "BRAND",
  "Private Party": "PRIVATE",
};

const VENUE_TYPE_MAP: Record<
  BookingCreateInput["venueType"],
  "INDOOR" | "OUTDOOR"
> = {
  Indoor: "INDOOR",
  Outdoor: "OUTDOOR",
};

export async function createBookingService(
  input: BookingCreateInput,
): Promise<Result<BookingCreateResult>> {
  const bookingDate = new Date(input.date);
  const dayStart = new Date(bookingDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(bookingDate);
  dayEnd.setHours(23, 59, 59, 999);
  const duplicateWindowStart = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const existing = await db.booking.findFirst({
    where: {
      email: input.email,
      phone: input.phone,
      date: {
        gte: dayStart,
        lte: dayEnd,
      },
      createdAt: {
        gte: duplicateWindowStart,
      },
    },
    select: { id: true },
  });

  if (existing) {
    return {
      ok: false,
      error:
        "A booking request for this date already exists. We will reach out within 24 hours.",
    };
  }

  const booking = await db.booking.create({
    data: {
      date: bookingDate,
      eventType: EVENT_TYPE_MAP[input.eventType],
      address: input.address,
      venueType: VENUE_TYPE_MAP[input.venueType],
      guestCount: input.guestCount,
      drinkCount: input.drinkCount,
      perDrinkPrice: input.perDrinkPrice,
      package: input.package,
      cocktailNumber: input.cocktailNumber,
      hours: input.hours,
      estimatedTotal: input.estimatedTotal,
      total: input.total,
      cocktails: input.cocktails,
      name: input.name,
      email: input.email,
      phone: input.phone,
      note: input.note ?? null,
    },
    select: { id: true },
  });

  if (process.env.NODE_ENV !== "production") {
    const safeDate = bookingDate.toISOString().slice(0, 10);
    console.info(`[booking] created id=${booking.id} date=${safeDate}`);
  }

  return { ok: true, data: { id: booking.id } };
}

export async function getBusyDatesService(): Promise<{ date: string; eventType: string }[]> {
  const [bookings, adminBusyDates] = await Promise.all([
    db.booking.findMany({
      where: {
        OR: [{ depositPaid: true }, { finalPaid: true }],
        isActive: true,
      },
      select: { date: true, eventType: true },
    }),
    db.busyDate.findMany({
      select: { date: true, note: true }
    })
  ]);

  const bookingDates = bookings.map((b) => ({
    date: b.date.toISOString().slice(0, 10),
    eventType: b.eventType,
  }));

  const adminDates = adminBusyDates.map((b) => ({
    date: b.date.toISOString().slice(0, 10),
    eventType: "PRIVATE", // 어드민 차단 날짜는 프라이빗으로 표시
  }));

  return [...bookingDates, ...adminDates];
}

export type BookingDashboardItem = {
  id: number;
  date: Date;
  eventType: "WEDDING" | "BRAND" | "PRIVATE";
  venueType: "INDOOR" | "OUTDOOR";
  guestCount: number;
  drinkCount: number;
  perDrinkPrice: number;
  package: string;
  status: "NEW" | "CHECKED" | "DEPOSIT_PAID" | "CONFIRMED" | "CANCELED";
  cocktailNumber: number;
  hours: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  depositPaid: boolean;
  finalPaid: boolean;
  createdAt: Date;
};

export type BookingListFilters = {
  status?: "NEW" | "CHECKED" | "DEPOSIT_PAID" | "CONFIRMED" | "CANCELED";
  depositPaid?: boolean;
  finalPaid?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  dateOrder?: "asc" | "desc";
  query?: string;
  page?: number;
  pageSize?: number;
};

export async function listBookingsForDashboard(
  filters: BookingListFilters = {},
): Promise<BookingDashboardItem[]> {
  const pageSize = Math.max(1, Math.min(filters.pageSize ?? 20, 100));
  const page = Math.max(1, filters.page ?? 1);
  const skip = (page - 1) * pageSize;

  return db.booking.findMany({
    where: {
      isActive: true,
      ...(filters.status ? { status: filters.status } : {}),
      ...(typeof filters.depositPaid === "boolean"
        ? { depositPaid: filters.depositPaid }
        : {}),
      ...(typeof filters.finalPaid === "boolean"
        ? { finalPaid: filters.finalPaid }
        : {}),
      ...((filters.dateFrom || filters.dateTo) && {
        date: {
          ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
          ...(filters.dateTo ? { lte: filters.dateTo } : {}),
        },
      }),
      ...(filters.query
        ? {
            OR: [
              { name: { contains: filters.query } },
              { email: { contains: filters.query } },
              { phone: { contains: filters.query } },
            ],
          }
        : {}),
    },
    orderBy: { date: filters.dateOrder ?? "desc" },
    take: pageSize,
    skip,
    select: {
      id: true,
      date: true,
      eventType: true,
      venueType: true,
      guestCount: true,
      drinkCount: true,
      perDrinkPrice: true,
      package: true,
      status: true,
      cocktailNumber: true,
      hours: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      depositPaid: true,
      finalPaid: true,
      createdAt: true,
    },
  });
}

export async function countBookingsForDashboard(
  filters: BookingListFilters = {},
): Promise<number> {
  return db.booking.count({
    where: {
      isActive: true,
      ...(filters.status ? { status: filters.status } : {}),
      ...(typeof filters.depositPaid === "boolean"
        ? { depositPaid: filters.depositPaid }
        : {}),
      ...(typeof filters.finalPaid === "boolean"
        ? { finalPaid: filters.finalPaid }
        : {}),
      ...((filters.dateFrom || filters.dateTo) && {
        date: {
          ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
          ...(filters.dateTo ? { lte: filters.dateTo } : {}),
        },
      }),
      ...(filters.query
        ? {
            OR: [
              { name: { contains: filters.query } },
              { email: { contains: filters.query } },
              { phone: { contains: filters.query } },
            ],
          }
        : {}),
    },
  });
}

export type BookingDetail = {
  id: number;
  date: Date;
  eventType: "WEDDING" | "BRAND" | "PRIVATE";
  address: string;
  venueType: "INDOOR" | "OUTDOOR";
  guestCount: number;
  drinkCount: number;
  perDrinkPrice: number;
  package: string;
  cocktailNumber: number;
  hours: number;
  estimatedTotal: number;
  total: number;
  cocktails: string[];
  name: string;
  email: string;
  phone: string;
  note: string | null;
  status: "NEW" | "CHECKED" | "DEPOSIT_PAID" | "CONFIRMED" | "CANCELED";
  eventsPermit: boolean;
  depositPaid: boolean;
  finalPaid: boolean;
  emailSentAt: Date | null;
  depositAmount: number;
  paymentStatus: "PENDING" | "PAID";
  paymentLinkSentAt: Date | null;
  stripeCheckoutSessionId: string | null;
  stripePaymentIntentId: string | null;
  options: Array<{ title: string; description: string; price: number }>;
  taxes: Array<{ title: string; percentage: number }>;
  createdAt: Date;
  updatedAt: Date;
};

export async function getBookingById(
  id: number,
): Promise<BookingDetail | null> {
  return db.booking.findUnique({
    where: { id, isActive: true },
    select: {
      id: true,
      date: true,
      eventType: true,
      address: true,
      venueType: true,
      guestCount: true,
      drinkCount: true,
      perDrinkPrice: true,
      package: true,
      cocktailNumber: true,
      hours: true,
      estimatedTotal: true,
      total: true,
      cocktails: true,
      name: true,
      email: true,
      phone: true,
      note: true,
      status: true,
      eventsPermit: true,
      depositPaid: true,
      finalPaid: true,
      emailSentAt: true,
      depositAmount: true,
      paymentStatus: true,
      paymentLinkSentAt: true,
      stripeCheckoutSessionId: true,
      stripePaymentIntentId: true,
      options: true,
      taxes: true,
      createdAt: true,
      updatedAt: true,
    },
  }) as Promise<BookingDetail | null>;
}

export async function updateBookingService(
  input: BookingUpdateInput,
): Promise<Result<{ id: number }>> {
  const updated = await db.booking.update({
    where: { id: input.id },
    data: {
      date: new Date(input.date),
      eventType: input.eventType,
      address: input.address,
      venueType: input.venueType,
      guestCount: input.guestCount,
      drinkCount: input.drinkCount,
      perDrinkPrice: input.perDrinkPrice,
      package: input.package,
      cocktailNumber: input.cocktailNumber,
      hours: input.hours,
      estimatedTotal: input.estimatedTotal,
      total: input.total,
      cocktails: input.cocktails,
      name: input.name,
      email: input.email,
      phone: input.phone,
      note: input.note ?? null,
      status: input.status,
      eventsPermit: input.eventsPermit,
      options: input.options,
      taxes: input.taxes,
    },
    select: { id: true },
  });

  return { ok: true, data: { id: updated.id } };
}

export async function deleteBookingService(
  id: number,
): Promise<Result<{ id: number }>> {
  await db.booking.update({
    where: { id },
    data: { isActive: false },
  });
  return { ok: true, data: { id } };
}

export async function sendBookingEmailService(
  bookingId: number,
): Promise<Result<{ id: number }>> {
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      date: true,
      eventType: true,
      venueType: true,
      guestCount: true,
      package: true,
      hours: true,
      cocktailNumber: true,
      cocktails: true,
      name: true,
      email: true,
      emailSentAt: true,
    },
  });

  if (!booking) {
    return { ok: false, error: "Booking not found." };
  }

  if (booking.emailSentAt) {
    return { ok: false, error: "Email already sent for this booking." };
  }

  const dateLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(booking.date);

  const cocktails = Array.isArray(booking.cocktails)
    ? booking.cocktails.join(", ")
    : "";

  const subject = "Your Catalyst Mobile Bar booking request";
  const html = `
    <div style="margin:0; padding:24px; background:#EAE8E4; font-family: 'Raleway', Arial, sans-serif; color:#303520;">
      <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #D6D5CE; padding:24px;">
        <p style="letter-spacing:3px; text-transform:uppercase; font-size:11px; color:#7C826F; margin:0 0 12px 0;">
          Catalyst Mobile Bar
        </p>
        <h2 style="font-size:22px; margin:0 0 12px 0; font-weight:600;">
          Hi ${booking.name},
        </h2>
        <p style="margin:0 0 16px 0; color:#7C826F;">
          Thanks for reaching out. Here is a quick summary of your booking request:
        </p>
        <div style="background:#F7F5F0; border:1px solid #E0D9C9; padding:16px; margin-bottom:16px;">
          <table style="width:100%; border-collapse:collapse; font-size:14px;">
            <tr>
              <td style="padding:6px 0; color:#7C826F;">Date</td>
              <td style="padding:6px 0; font-weight:600; text-align:right;">${dateLabel}</td>
            </tr>
            <tr>
              <td style="padding:6px 0; color:#7C826F;">Event</td>
              <td style="padding:6px 0; font-weight:600; text-align:right;">${booking.eventType}</td>
            </tr>
            <tr>
              <td style="padding:6px 0; color:#7C826F;">Venue</td>
              <td style="padding:6px 0; font-weight:600; text-align:right;">${booking.venueType}</td>
            </tr>
            <tr>
              <td style="padding:6px 0; color:#7C826F;">Guests</td>
              <td style="padding:6px 0; font-weight:600; text-align:right;">${booking.guestCount}</td>
            </tr>
            <tr>
              <td style="padding:6px 0; color:#7C826F;">Package</td>
              <td style="padding:6px 0; font-weight:600; text-align:right;">${booking.package}</td>
            </tr>
            <tr>
              <td style="padding:6px 0; color:#7C826F;">Service</td>
              <td style="padding:6px 0; font-weight:600; text-align:right;">
                ${booking.hours} hours, ${booking.cocktailNumber} cocktails
              </td>
            </tr>
            <tr>
              <td style="padding:6px 0; color:#7C826F;">Cocktails</td>
              <td style="padding:6px 0; font-weight:600; text-align:right;">${cocktails || "-"}</td>
            </tr>
          </table>
        </div>
        <p style="margin:0 0 16px 0; color:#7C826F;">
          We will follow up within 24 hours to confirm details.
        </p>
        <p style="margin:0; font-weight:600;">— Catalyst Mobile Bar</p>
      </div>
    </div>
  `;

  await sendEmail({
    to: booking.email,
    subject,
    html,
  });

  await db.booking.update({
    where: { id: booking.id },
    data: { emailSentAt: new Date() },
  });

  return { ok: true, data: { id: booking.id } };
}

export async function sendBookingPaymentLinkService(
  bookingId: number,
): Promise<Result<{ id: number }>> {
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      name: true,
      email: true,
      total: true,
      paymentStatus: true,
      stripeCheckoutSessionId: true,
    },
  });

  if (!booking) {
    return { ok: false, error: "Booking not found." };
  }

  if (booking.paymentStatus === "PAID") {
    return { ok: false, error: "Deposit already paid." };
  }

  if (booking.stripeCheckoutSessionId) {
    return { ok: false, error: "Payment link already sent." };
  }

  if (!booking.total || booking.total <= 0) {
    return { ok: false, error: "Total amount must be set before payment." };
  }

  const depositAmount = Math.round(booking.total * 0.5);
  const depositAmountCents = depositAmount * 100;
  const baseUrl = getAppBaseUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: booking.email,
    success_url: `${baseUrl}/booking?payment=success`,
    cancel_url: `${baseUrl}/booking?payment=cancel`,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "cad",
          unit_amount: depositAmountCents,
          product_data: {
            name: "Catalyst Mobile Bar Deposit (50%)",
          },
        },
      },
    ],
    metadata: {
      bookingId: String(booking.id),
    },
  });

  await db.booking.update({
    where: { id: booking.id },
    data: {
      depositAmount,
      stripeCheckoutSessionId: session.id,
      paymentStatus: "PENDING",
      paymentLinkSentAt: new Date(),
    },
  });

  const subject = "Catalyst Mobile Bar deposit payment";
  const html = `
    <div style="margin:0; padding:24px; background:#EAE8E4; font-family: 'Raleway', Arial, sans-serif; color:#303520;">
      <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #D6D5CE; padding:24px;">
        <p style="letter-spacing:3px; text-transform:uppercase; font-size:11px; color:#7C826F; margin:0 0 12px 0;">
          Catalyst Mobile Bar
        </p>
        <h2 style="font-size:22px; margin:0 0 12px 0; font-weight:600;">
          Hi ${booking.name},
        </h2>
        <p style="margin:0 0 16px 0; color:#7C826F;">
          Please complete your deposit payment to secure your booking date.
        </p>
        <p style="margin:0 0 24px 0; font-size:16px; font-weight:600;">
          Deposit Amount: CAD $${depositAmount}
        </p>
        <a href="${session.url}" style="display:inline-block; background:#7C826F; color:#ffffff; padding:12px 20px; text-decoration:none; font-weight:600; border-radius:999px;">
          Pay Deposit
        </a>
      </div>
    </div>
  `;

  await sendEmail({
    to: booking.email,
    subject,
    html,
  });

  return { ok: true, data: { id: booking.id } };
}

/**
 * Shared function to generate the professional invoice HTML used in emails.
 */
function generateInvoiceHtml(booking: any, amountToPay: number, paymentTitle: string, paymentDetail: string, sessionUrl: string) {
  const isPremium = (booking.package || "").trim().toLowerCase().includes("premium") || 
                    (booking.package || "").trim().toLowerCase().includes("all inclusive");
  const basePrice = isPremium ? (booking.estimatedTotal || 0) : 1000;
  const extraHours = !isPremium ? Math.max(0, (booking.hours || 0) - 4) : 0;
  const extraCocktails = !isPremium ? Math.max(0, (booking.cocktailNumber || 0) - 2) : 0;
  const packageLabel = isPremium ? "All Inclusive Bar Service" : "Dry Hire Mobile Bar Service";
  const options = Array.isArray(booking.options) ? (booking.options as any[]) : [];
  const taxes = Array.isArray(booking.taxes) ? (booking.taxes as any[]) : [];
  const formatEmailCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  const invoiceNumber = `#${String(booking.id).padStart(5, "0")}`;
  const dateStr = new Date(booking.date || "").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const optionTotal = options.reduce((sum, opt) => sum + (opt.price || 0), 0);
  const subtotalWithOptions = basePrice + (extraHours * 250) + (extraCocktails * 250) + optionTotal;
  const taxTotal = taxes.reduce((sum, tax) => sum + Math.round((subtotalWithOptions * (tax.percentage || 0)) / 100), 0);
  const subtotalWithTax = subtotalWithOptions + taxTotal;

  let rows = `
    <tr><td style="padding:8px 0; border-bottom:1px solid #ECE8DD;"><b>${packageLabel}</b><br/>${booking.guestCount} guests</td><td style="text-align:right; font-weight:600;">${formatEmailCurrency(basePrice)}</td></tr>
    <tr><td style="padding:8px 0; border-bottom:1px solid #ECE8DD;"><b>2 Cocktails & 4 Hours</b><br/>Standard base package</td><td style="text-align:right; color:#7C826F;">Included</td></tr>
  `;
  if (extraHours > 0) rows += `<tr><td style="padding:8px 0; border-bottom:1px solid #ECE8DD;">Extra Hours</td><td style="text-align:right; font-weight:600;">${formatEmailCurrency(extraHours * 250)}</td></tr>`;
  if (extraCocktails > 0) rows += `<tr><td style="padding:8px 0; border-bottom:1px solid #ECE8DD;">Extra Cocktails</td><td style="text-align:right; font-weight:600;">${formatEmailCurrency(extraCocktails * 250)}</td></tr>`;
  options.forEach(opt => rows += `<tr><td style="padding:8px 0; border-bottom:1px solid #ECE8DD;">${opt.title}</td><td style="text-align:right; font-weight:600;">${formatEmailCurrency(opt.price)}</td></tr>`);
  taxes.forEach(tax => {
    const taxAmount = Math.round(((basePrice + (extraHours * 250) + (extraCocktails * 250) + options.reduce((s,o)=>s+(o.price||0),0)) * (tax.percentage || 0)) / 100);
    rows += `<tr><td style="padding:8px 0; border-bottom:1px solid #ECE8DD; color:#7C826F;">${tax.title} (${tax.percentage}%)</td><td style="text-align:right; font-weight:600;">${formatEmailCurrency(taxAmount)}</td></tr>`;
  });

  const depositPaid = booking.depositPaid && booking.depositAmount > 0 ? booking.depositAmount : 0;

  return `
    <div style="margin:0; padding:48px 24px; background:#EAE8E4; font-family: sans-serif; color:#303520;">
      <div style="max-width:800px; margin:0 auto;">
        <div style="background:#FDFCF8; border:1px solid #D9D4C7; padding:40px; box-shadow:0 4px 6px rgba(0,0,0,0.02);">
          
          <table style="width:100%; border-bottom:1px solid #D9D4C7; padding-bottom:32px; margin-bottom:28px;">
            <tr>
              <td><div style="font-size:24px; font-weight:700;">Catalyst</div><div style="font-size:14px; color:#6E7363;">Mobile Bar</div></td>
              <td style="text-align:right;"><div style="font-size:32px; font-weight:700;">INVOICE</div><div style="font-size:14px;">Booking Number ${invoiceNumber}</div></td>
            </tr>
          </table>

          <table style="width:100%; border-bottom:1px solid #D9D4C7; padding-bottom:28px; margin-bottom:28px;">
            <tr>
              <td style="width:50%;"><div style="font-size:11px; color:#7C826F; font-weight:600;">NAME</div><div>${booking.name}</div></td>
              <td style="width:50%;"><div style="font-size:11px; color:#7C826F; font-weight:600;">DATE</div><div>${dateStr}</div></td>
            </tr>
          </table>

          <div style="font-size:24px; font-weight:700; margin-bottom:20px;">Description</div>
          <table style="width:100%; border-collapse:collapse; font-size:14px;">${rows}</table>

          <div style="margin-top:40px; border-top:1px solid #D9D4C7; padding-top:32px;">
            <table style="width:100%; border-collapse:collapse; font-size:15px; margin-bottom:32px;">
              <tr>
                <td style="padding:4px 0; color:#7C826F;">Subtotal (inc. Tax)</td>
                <td style="padding:4px 0; text-align:right; font-weight:500;">${formatEmailCurrency(subtotalWithTax)}</td>
              </tr>
              ${depositPaid > 0 ? `
              <tr>
                <td style="padding:4px 0; color:#7C826F;">Deposit Applied</td>
                <td style="padding:4px 0; text-align:right; font-weight:500; color:#8B2E2E;">-${formatEmailCurrency(depositPaid)}</td>
              </tr>` : ''}
              <tr>
                <td style="padding:16px 0; border-top:2px solid #303520; font-weight:700; font-size:18px; color:#303520;">Total Due</td>
                <td style="padding:16px 0; border-top:2px solid #303520; text-align:right; font-weight:700; font-size:18px; color:#303520;">
                  ${formatEmailCurrency(amountToPay)}
                </td>
              </tr>
            </table>

            <div style="background:#FDFCF8; padding:32px; border:1px solid #D9D4C7; border-left:4px solid #7C826F;">
              <table style="width:100%; border-collapse:collapse;">
                <tr>
                  <td style="vertical-align:middle;">
                    <div style="font-size:10px; font-weight:700; text-transform:uppercase; tracking:0.2em; color:#7C826F; margin-bottom:4px;">${paymentTitle}</div>
                    <div style="font-size:14px; margin-bottom:4px;">${paymentDetail}</div>
                    <div style="font-size:32px; font-weight:700; color:#303520;">${formatEmailCurrency(amountToPay)}</div>
                  </td>
                  <td style="vertical-align:middle; text-align:right;">
                    <a href="${sessionUrl}" style="display:inline-block; background-color:#7C826F; color:#ffffff; padding:14px 32px; text-decoration:none; font-weight:700; border-radius:999px; font-size:15px; white-space:nowrap; text-align:center;">
                      Pay Online Now
                    </a>
                  </td>
                </tr>
              </table>
            </div>
          </div>
        </div>
        <div style="text-align:center; margin-top:32px; font-size:12px; color:#7C826F;">
          <p>© ${new Date().getFullYear()} Catalyst Mobile Bar. All rights reserved.</p>
        </div>
      </div>
    </div>
  `;
}

export async function sendCustomDepositInvoiceService(bookingId: number, customAmount: number): Promise<Result<{ id: number }>> {
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, name: true, email: true, total: true, paymentStatus: true, package: true, hours: true, cocktailNumber: true, estimatedTotal: true, options: true, taxes: true, date: true, guestCount: true, note: true }
  });
  if (!booking) return { ok: false, error: "Booking not found." };
  if (booking.paymentStatus === "PAID") return { ok: false, error: "Paid already." };

  const baseUrl = getAppBaseUrl();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: booking.email,
    success_url: `${baseUrl}/booking?payment=success`,
    cancel_url: `${baseUrl}/booking?payment=cancel`,
    line_items: [{ quantity: 1, price_data: { currency: "cad", unit_amount: Math.round(customAmount * 100), product_data: { name: "Catalyst Mobile Bar Deposit" } } }],
    metadata: { bookingId: String(booking.id), type: "deposit" },
  });

  await db.booking.update({
    where: { id: booking.id },
    data: {
      depositAmount: customAmount,
      stripeCheckoutSessionId: session.id,
      paymentStatus: "PENDING",
      paymentLinkSentAt: new Date(),
      note: (booking.note ? booking.note + "\n" : "") + `[LOG:EMAIL_SENT] ${new Date().toISOString()}|Deposit Invoice Sent|$${customAmount}`,
    },
  });

  const html = generateInvoiceHtml(booking, customAmount, "Payment Due Now", "Deposit to confirm booking", session.url!);
  await sendEmail({ to: booking.email, subject: "Deposit Invoice - Catalyst Mobile Bar", html });
  return { ok: true, data: { id: booking.id } };
}

export async function sendFinalBalanceInvoiceService(bookingId: number): Promise<Result<{ id: number }>> {
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, name: true, email: true, total: true, depositAmount: true, depositPaid: true, finalPaid: true, package: true, hours: true, cocktailNumber: true, estimatedTotal: true, options: true, taxes: true, date: true, guestCount: true, note: true }
  });
  if (!booking) return { ok: false, error: "Booking not found." };
  if (booking.finalPaid) return { ok: false, error: "Final payment already completed." };
  if (!booking.depositPaid) return { ok: false, error: "Deposit must be paid first." };

  const balanceDue = Math.max(0, (booking.total || 0) - (booking.depositAmount || 0));
  if (balanceDue <= 0) return { ok: false, error: "No remaining balance to pay." };

  const baseUrl = getAppBaseUrl();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: booking.email,
    success_url: `${baseUrl}/booking?payment=success`,
    cancel_url: `${baseUrl}/booking?payment=cancel`,
    line_items: [{ quantity: 1, price_data: { currency: "cad", unit_amount: Math.round(balanceDue * 100), product_data: { name: "Catalyst Mobile Bar Final Balance" } } }],
    metadata: { bookingId: String(booking.id), type: "final" },
  });

  await db.booking.update({
    where: { id: booking.id },
    data: {
      stripeCheckoutSessionId: session.id,
      note: (booking.note ? booking.note + "\n" : "") + `[LOG:EMAIL_SENT] ${new Date().toISOString()}|Final Balance Invoice Sent|$${balanceDue}`,
    },
  });

  const html = generateInvoiceHtml(booking, balanceDue, "Final Payment Due", "Remaining balance for your booking", session.url!);
  await sendEmail({ to: booking.email, subject: "Final Balance Invoice - Catalyst Mobile Bar", html });
  return { ok: true, data: { id: booking.id } };
}

export async function syncBookingPaymentStatusService(bookingId: number): Promise<void> {
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, stripeCheckoutSessionId: true, paymentStatus: true, note: true, depositPaid: true, finalPaid: true }
  });
  
  // Only stop if everything is already paid
  if (!booking || !booking.stripeCheckoutSessionId || booking.finalPaid) return;

  try {
    const session = await stripe.checkout.sessions.retrieve(booking.stripeCheckoutSessionId);
    if (session.payment_status === "paid") {
      const isFinal = session.metadata?.type === "final";
      const amountPaid = session.amount_total ? session.amount_total / 100 : 0;
      
      // Prevent duplicate log if already marked as PAID and it's just a refresh
      if (isFinal && booking.finalPaid) return;
      if (!isFinal && booking.depositPaid && booking.paymentStatus === "PAID") return;

      await db.booking.update({
        where: { id: booking.id },
        data: {
          depositPaid: true,
          finalPaid: isFinal,
          status: isFinal ? "CONFIRMED" : "DEPOSIT_PAID",
          paymentStatus: "PAID",
          note: (booking.note ? booking.note + "\n" : "") + `[LOG:PAYMENT] ${new Date().toISOString()}|${isFinal ? "Final Payment" : "Deposit Payment"} Received|$${amountPaid}`,
        }
      });
    }
  } catch (error) {
    console.error("[sync-error]", error);
  }
}

export async function toggleBusyDateService(dateStr: string) {
  // YYYY-MM-DD 형식을 직접 쪼개어 로컬 타임존 기준으로 생성
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day, 0, 0, 0, 0);

  const existing = await db.busyDate.findUnique({
    where: { date }
  });

  if (existing) {
    await db.busyDate.delete({ where: { id: existing.id } });
    return { ok: true, status: "removed" };
  } else {
    await db.busyDate.create({
      data: { date }
    });
    return { ok: true, status: "added" };
  }
}

export async function listAllBusyDatesService() {
  const dates = await db.busyDate.findMany();
  return dates.map(d => d.date.toISOString().split("T")[0]);
}
