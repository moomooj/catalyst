"use server";

import { requireAdmin } from "@/lib/auth/admin";
import { revalidatePath } from "next/cache";
import {
  ALL_INCLUSIVE_MIN_COCKTAIL_COUNT,
  ALL_INCLUSIVE_MIN_HOURS,
  BOOKING_PACKAGE_ALL_INCLUSIVE,
  BOOKING_PACKAGE_DRY_HIRE,
  DRY_HIRE_BASE_PRICE,
  DRY_HIRE_COCKTAIL_UNIT_PRICE,
  DRY_HIRE_INCLUDED_COCKTAIL_COUNT,
  DRY_HIRE_HOUR_UNIT_PRICE,
  DRY_HIRE_MIN_COCKTAIL_COUNT,
  DRY_HIRE_MIN_HOURS,
  MIN_GUARANTEED_DRINK_COUNT,
  PER_DRINK_PRICE,
} from "@/features/booking/constants";
import { bookingCreateSchema, bookingUpdateSchema } from "./schema";
import {
  createBookingService,
  deleteBookingService,
  sendBookingEmailService,
  sendBookingPaymentLinkService,
  sendCustomDepositInvoiceService,
  sendFinalBalanceInvoiceService,
  updateBookingService,
} from "./service";
import type { Result } from "./types";

export async function createBookingAction(
  input: unknown,
): Promise<Result<{ id: number }>> {
  const parsed = bookingCreateSchema.safeParse(input);
  if (!parsed.success) {
    const fields = Object.keys(parsed.error.flatten().fieldErrors).filter(
      (key) => key.length > 0,
    );
    const message =
      fields.length > 0
        ? `Please check the required fields: ${fields.join(", ")}.`
        : "Please check the required fields.";
    return { ok: false, error: message };
  }

  return createBookingService(parsed.data);
}

function readBoolean(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

function readInt(formData: FormData, key: string, fallback: number): number {
  const v = Number(formData.get(key));
  return Number.isFinite(v) ? Math.trunc(v) : fallback;
}

export async function updateBookingAction(
  formData: FormData,
): Promise<Result<{ id: number }>> {
  await requireAdmin();

  const packageValue = String(formData.get("package") ?? "");
  const drinkInput = readInt(formData, "drinkCount", 0);
  const cocktailInput = readInt(formData, "cocktailNumber", 0);
  const hoursInput = readInt(formData, "hours", 1);
  const cocktailNumber =
    packageValue === BOOKING_PACKAGE_DRY_HIRE
      ? Math.max(DRY_HIRE_MIN_COCKTAIL_COUNT, cocktailInput)
      : packageValue === BOOKING_PACKAGE_ALL_INCLUSIVE
        ? Math.max(ALL_INCLUSIVE_MIN_COCKTAIL_COUNT, cocktailInput)
        : Math.max(0, cocktailInput);
  const hours =
    packageValue === BOOKING_PACKAGE_DRY_HIRE
      ? Math.max(DRY_HIRE_MIN_HOURS, hoursInput)
      : packageValue === BOOKING_PACKAGE_ALL_INCLUSIVE
        ? Math.max(ALL_INCLUSIVE_MIN_HOURS, hoursInput)
        : Math.max(1, hoursInput);
  const perDrinkPrice = Math.min(
    999,
    Math.max(
      PER_DRINK_PRICE,
      readInt(formData, "perDrinkPrice", PER_DRINK_PRICE),
    ),
  );
  const drinkCount =
    packageValue === BOOKING_PACKAGE_ALL_INCLUSIVE
      ? Math.max(MIN_GUARANTEED_DRINK_COUNT, drinkInput)
      : Math.max(0, drinkInput);
  const computedEstimatedTotal =
    packageValue === BOOKING_PACKAGE_DRY_HIRE
      ? DRY_HIRE_BASE_PRICE +
        Math.max(0, cocktailNumber - DRY_HIRE_INCLUDED_COCKTAIL_COUNT) *
          DRY_HIRE_COCKTAIL_UNIT_PRICE +
        Math.max(0, hours - DRY_HIRE_MIN_HOURS) * DRY_HIRE_HOUR_UNIT_PRICE
      : drinkCount * perDrinkPrice +
        Math.max(0, cocktailNumber - ALL_INCLUSIVE_MIN_COCKTAIL_COUNT) *
          DRY_HIRE_COCKTAIL_UNIT_PRICE +
        Math.max(0, hours - ALL_INCLUSIVE_MIN_HOURS) * DRY_HIRE_HOUR_UNIT_PRICE;

  let parsedOptions: unknown = [];
  let parsedTaxes: unknown = [];
  try {
    parsedOptions = JSON.parse(String(formData.get("options") ?? "[]"));
  } catch {}
  try {
    parsedTaxes = JSON.parse(String(formData.get("taxes") ?? "[]"));
  } catch {}

  const optArr = Array.isArray(parsedOptions)
    ? (parsedOptions as Array<{ price?: unknown }>)
    : [];
  const taxArr = Array.isArray(parsedTaxes)
    ? (parsedTaxes as Array<{ percentage?: unknown }>)
    : [];

  const optionTotal = optArr.reduce((sum, opt) => {
    const p = typeof opt?.price === "number" ? opt.price : 0;
    return sum + Math.max(0, Math.trunc(p));
  }, 0);
  const subtotalWithOptions = computedEstimatedTotal + optionTotal;
  const taxTotal = taxArr.reduce((sum, tax) => {
    const pct = typeof tax?.percentage === "number" ? tax.percentage : 0;
    return sum + Math.round((subtotalWithOptions * Math.max(0, pct)) / 100);
  }, 0);
  const finalTotal = subtotalWithOptions + taxTotal;

  const payload = {
    id: Number(formData.get("id")),
    date: String(formData.get("date") ?? ""),
    eventType: String(formData.get("eventType") ?? ""),
    address: String(formData.get("address") ?? ""),
    venueType: String(formData.get("venueType") ?? ""),
    guestCount: Math.max(1, readInt(formData, "guestCount", 1)),
    drinkCount,
    perDrinkPrice,
    package: packageValue,
    cocktailNumber,
    hours,
    estimatedTotal: computedEstimatedTotal,
    total: finalTotal,
    cocktails: String(formData.get("cocktails") ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    note: String(formData.get("note") ?? "").trim() || undefined,
    status: String(formData.get("status") ?? ""),
    eventsPermit: readBoolean(formData.get("eventsPermit")),
    options: parsedOptions,
    taxes: parsedTaxes,
  };

  const parsed = bookingUpdateSchema.safeParse(payload);
  if (!parsed.success) {
    const fields = Object.keys(parsed.error.flatten().fieldErrors).filter(
      (key) => key.length > 0,
    );
    const message =
      fields.length > 0
        ? `Please check the required fields: ${fields.join(", ")}.`
        : "Please check the required fields.";
    return { ok: false, error: message };
  }

  return updateBookingService(parsed.data);
}

export async function deleteBookingAction(
  formData: FormData,
): Promise<Result<{ id: number }>> {
  await requireAdmin();
  const bookingId = Number(formData.get("id"));

  if (!Number.isFinite(bookingId) || bookingId <= 0) {
    return { ok: false, error: "Invalid booking ID." };
  }

  const result = await deleteBookingService(bookingId);
  if (result.ok) {
    revalidatePath("/admin/dashboard");
  }
  return result;
}

export async function sendBookingEmailAction(
  formData: FormData,
): Promise<Result<{ id: number }>> {
  await requireAdmin();
  const bookingId = Number(formData.get("id"));

  if (!Number.isFinite(bookingId) || bookingId <= 0) {
    return { ok: false, error: "Invalid booking ID." };
  }

  return sendBookingEmailService(bookingId);
}

export async function sendBookingPaymentLinkAction(
  formData: FormData,
): Promise<Result<{ id: number }>> {
  await requireAdmin();
  const bookingId = Number(formData.get("id"));

  if (!Number.isFinite(bookingId) || bookingId <= 0) {
    return { ok: false, error: "Invalid booking ID." };
  }

  return sendBookingPaymentLinkService(bookingId);
}

export async function sendCustomDepositInvoiceAction(
  formData: FormData,
): Promise<Result<{ id: number }>> {
  await requireAdmin();
  const bookingId = Number(formData.get("id"));
  const amount = Number(formData.get("amount"));

  if (!Number.isFinite(bookingId) || bookingId <= 0) {
    return { ok: false, error: "Invalid booking ID." };
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "Invalid amount." };
  }

  return sendCustomDepositInvoiceService(bookingId, amount);
}

export async function sendFinalBalanceInvoiceAction(
  formData: FormData,
): Promise<Result<{ id: number }>> {
  await requireAdmin();
  const bookingId = Number(formData.get("id"));

  if (!Number.isFinite(bookingId) || bookingId <= 0) {
    return { ok: false, error: "Invalid booking ID." };
  }

  return sendFinalBalanceInvoiceService(bookingId);
}
