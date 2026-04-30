/** All Inclusive: additional drinks billed at this rate (CAD per drink). */
export const PER_DRINK_PRICE = 9;

/** All Inclusive: default / minimum guaranteed drink count (glasses). */
export const MIN_GUARANTEED_DRINK_COUNT = 150;

/** All Inclusive: minimum cocktail count included. */
export const ALL_INCLUSIVE_MIN_COCKTAIL_COUNT = 2;

/** All Inclusive: minimum hours included. */
export const ALL_INCLUSIVE_MIN_HOURS = 4;

/** Dry hire: default / minimum base price (CAD). */
export const DRY_HIRE_BASE_PRICE = 1000;

/** Stored on `Booking.package` from the public booking flow. */
export const BOOKING_PACKAGE_DRY_HIRE = "standard";

/** Stored on `Booking.package` from the public booking flow. */
export const BOOKING_PACKAGE_ALL_INCLUSIVE = "premium";

export function isAllInclusivePackage(packageField: string): boolean {
  const p = packageField.trim().toLowerCase();
  return (
    p === BOOKING_PACKAGE_ALL_INCLUSIVE ||
    p.includes("all inclusive") ||
    p.includes("all-inclusive")
  );
}

/** Normalizes legacy/free-text package values to the canonical form select value. */
export function packageToFormValue(packageField: string): string {
  return isAllInclusivePackage(packageField)
    ? BOOKING_PACKAGE_ALL_INCLUSIVE
    : BOOKING_PACKAGE_DRY_HIRE;
}

/** Dry hire: per-cocktail unit price (CAD). */
export const DRY_HIRE_COCKTAIL_UNIT_PRICE = 250;

/** Dry hire: per-hour unit price (CAD). */
export const DRY_HIRE_HOUR_UNIT_PRICE = 250;

/** Dry hire: minimum cocktail count. */
export const DRY_HIRE_MIN_COCKTAIL_COUNT = 2;

/** Dry hire: cocktails included before extra fee (extra starts at 3rd). */
export const DRY_HIRE_INCLUDED_COCKTAIL_COUNT = 2;

/** Dry hire: minimum hours. */
export const DRY_HIRE_MIN_HOURS = 4;

/** Minimum days in advance for a booking. */
export const MIN_LEAD_DAYS = 21;
