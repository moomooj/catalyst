export const FALLBACK_CATEGORY_NAME = "Uncategorized";
export const FALLBACK_UNIT_NAME = "unit";

export function normalizeInventoryOptionName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function isProtectedInventoryOption(name: string, isSystem: boolean): boolean {
  return isSystem && (name === FALLBACK_CATEGORY_NAME || name === FALLBACK_UNIT_NAME);
}
