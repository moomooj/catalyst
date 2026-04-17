import { z } from "zod";
import {
  BOOKING_PACKAGE_ALL_INCLUSIVE,
  MIN_GUARANTEED_DRINK_COUNT,
  PER_DRINK_PRICE,
} from "./constants";

export const bookingCreateSchema = z
  .object({
    date: z.string().min(1, "Date is required."),
    eventType: z.enum(["Wedding", "Corporate Event", "Private Party"]),
    address: z.string().trim().min(1, "Address is required."),
    venueType: z.enum(["Indoor", "Outdoor"]),
    guestCount: z.number().int().positive(),
    drinkCount: z.number().int().nonnegative().default(0),
    perDrinkPrice: z
      .number()
      .int()
      .min(PER_DRINK_PRICE)
      .max(999)
      .default(PER_DRINK_PRICE),
    package: z.string().min(1),
    cocktailNumber: z.number().int().nonnegative(),
    hours: z.number().int().positive(),
    estimatedTotal: z.number().int().nonnegative().default(0),
    total: z.number().int().nonnegative().default(0),
    cocktails: z.array(z.string().min(1)).default([]),
    name: z.string().trim().min(1, "Name is required."),
    email: z.string().trim().email("Enter a valid email address."),
    phone: z.string().trim().min(1, "Phone is required."),
    note: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.package === BOOKING_PACKAGE_ALL_INCLUSIVE &&
      data.drinkCount < MIN_GUARANTEED_DRINK_COUNT
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["drinkCount"],
        message: `Drink count must be at least ${MIN_GUARANTEED_DRINK_COUNT} for all inclusive.`,
      });
    }
  });

export type BookingCreateInput = z.infer<typeof bookingCreateSchema>;

export const bookingUpdateSchema = z
  .object({
    id: z.number().int().positive(),
    date: z.string().min(1, "Date is required."),
    eventType: z.enum(["WEDDING", "BRAND", "PRIVATE"]),
    address: z.string().trim().min(1, "Address is required."),
    venueType: z.enum(["INDOOR", "OUTDOOR"]),
    guestCount: z.number().int().positive(),
    drinkCount: z.number().int().nonnegative().default(0),
    perDrinkPrice: z.number().int().min(PER_DRINK_PRICE).max(999),
    package: z.string().min(1),
    cocktailNumber: z.number().int().nonnegative(),
    hours: z.number().int().positive(),
    estimatedTotal: z.number().int().nonnegative().default(0),
    total: z.number().int().nonnegative().default(0),
    cocktails: z.array(z.string().min(1)).default([]),
    name: z.string().trim().min(1, "Name is required."),
    email: z.string().trim().email("Enter a valid email address."),
    phone: z.string().trim().min(1, "Phone is required."),
    note: z.string().trim().optional(),
    status: z.enum(["NEW", "CHECKED", "DEPOSIT_PAID", "CONFIRMED", "CANCELED"]),
    eventsPermit: z.boolean(),
    options: z
      .array(
        z.object({
          title: z.string().min(1),
          description: z.string().default(""),
          price: z.number().int().nonnegative(),
        }),
      )
      .default([]),
    taxes: z
      .array(
        z.object({
          title: z.string().min(1).default("Tax"),
          percentage: z.number().int().nonnegative(),
        }),
      )
      .default([]),
  })
  .superRefine((data, ctx) => {
    if (
      data.package === BOOKING_PACKAGE_ALL_INCLUSIVE &&
      data.drinkCount < MIN_GUARANTEED_DRINK_COUNT
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["drinkCount"],
        message: `Drink count must be at least ${MIN_GUARANTEED_DRINK_COUNT} for all inclusive.`,
      });
    }
  });

export type BookingUpdateInput = z.infer<typeof bookingUpdateSchema>;
