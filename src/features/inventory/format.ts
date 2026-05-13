export function parseCurrencyToCents(value: string): number | null {
  const normalized = value.trim().replace(/[$,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;

  const [dollars, cents = ""] = normalized.split(".");
  return Number(dollars) * 100 + Number(cents.padEnd(2, "0"));
}

export function formatCurrencyFromCents(cents: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(cents / 100);
}

export function normalizeDecimalInput(value: string): string | null {
  const trimmed = value.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;

  const numberValue = Number(trimmed);
  if (!Number.isFinite(numberValue)) return null;

  return trimmed.includes(".") ? trimmed.replace(/\.?0+$/, "") : trimmed;
}

export function formatOrderPriceLabel(priceCents: number, minimumOrderQuantity: string, unitName: string): string {
  return `${formatCurrencyFromCents(priceCents)} / ${formatDecimalLabel(minimumOrderQuantity)} ${unitName}`;
}

export function formatDecimalLabel(value: string): string {
  return value.includes(".") ? value.replace(/\.?0+$/, "") : value;
}

export function formatDateInput(value: Date | null): string {
  if (!value) return "";
  return value.toISOString().slice(0, 10);
}
