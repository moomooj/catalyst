"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { formatDateInput, normalizeDecimalInput, parseCurrencyToCents } from "./format";
import {
  FALLBACK_CATEGORY_NAME,
  FALLBACK_UNIT_NAME,
  isProtectedInventoryOption,
  normalizeInventoryOptionName,
} from "./optionRules";
import { inventoryItemFormSchema, inventoryOptionFormSchema } from "./schema";

export type InventoryActionState = {
  ok: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function getOptionalDate(value: string): Date | null {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00.000`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function upsertInventoryItemAction(_prevState: InventoryActionState | null, formData: FormData) {
  await requireAdmin();

  const parsed = inventoryItemFormSchema.safeParse({
    id: getString(formData, "id") ? getString(formData, "id") : undefined,
    name: getString(formData, "name"),
    categoryId: getString(formData, "categoryId"),
    unitId: getString(formData, "unitId"),
    supplierName: getString(formData, "supplierName"),
    supplierUrl: getString(formData, "supplierUrl"),
    price: getString(formData, "price"),
    minimumOrderQuantity: getString(formData, "minimumOrderQuantity"),
    quantity: getString(formData, "quantity"),
    stockStatus: getString(formData, "stockStatus"),
    expirationDate: getString(formData, "expirationDate"),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const priceCents = parseCurrencyToCents(parsed.data.price);
  const minimumOrderQuantity = normalizeDecimalInput(parsed.data.minimumOrderQuantity);
  const quantity = normalizeDecimalInput(parsed.data.quantity);
  const expirationDate = getOptionalDate(parsed.data.expirationDate ?? "");

  if (priceCents === null) {
    return { ok: false, fieldErrors: { price: ["Use a valid pre-tax price, like 24.99"] } };
  }

  if (minimumOrderQuantity === null || Number(minimumOrderQuantity) <= 0) {
    return { ok: false, fieldErrors: { minimumOrderQuantity: ["Use a quantity greater than 0"] } };
  }

  if (quantity === null) {
    return { ok: false, fieldErrors: { quantity: ["Use a valid current stock quantity"] } };
  }

  if ((parsed.data.expirationDate ?? "") && !expirationDate) {
    return { ok: false, fieldErrors: { expirationDate: ["Use a valid expiration date"] } };
  }

  const supplierUrl = parsed.data.supplierUrl || null;
  if (supplierUrl) {
    try {
      new URL(supplierUrl);
    } catch {
      return { ok: false, fieldErrors: { supplierUrl: ["Use a valid supplier link"] } };
    }
  }

  const data = {
    name: parsed.data.name,
    categoryId: parsed.data.categoryId,
    unitId: parsed.data.unitId,
    supplierName: parsed.data.supplierName || null,
    supplierUrl,
    priceCents,
    minimumOrderQuantity,
    quantity,
    stockStatus: parsed.data.stockStatus,
    expirationDate,
    isActive: parsed.data.isActive,
  };

  try {
    if (parsed.data.id) {
      await db.inventoryItem.update({
        where: { id: parsed.data.id },
        data,
      });
    } else {
      await db.inventoryItem.create({ data });
    }
  } catch (error) {
    console.error("Inventory save failed:", error);
    return { ok: false, error: "Inventory item could not be saved." };
  }

  revalidatePath("/admin/inventory");
  return { ok: true, message: `Inventory item saved at ${formatDateInput(new Date())}.` };
}

export async function deactivateInventoryItemAction(_prevState: InventoryActionState | null, formData: FormData) {
  await requireAdmin();

  const id = Number(getString(formData, "id"));
  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, error: "Inventory item was not found." };
  }

  try {
    await db.inventoryItem.update({
      where: { id },
      data: { isActive: false },
    });
  } catch (error) {
    console.error("Inventory delete failed:", error);
    return { ok: false, error: "Inventory item could not be removed." };
  }

  revalidatePath("/admin/inventory");
  return { ok: true, message: "Inventory item removed." };
}

export async function restoreInventoryItemAction(_prevState: InventoryActionState | null, formData: FormData) {
  await requireAdmin();

  const id = Number(getString(formData, "id"));
  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, error: "Inventory item was not found." };
  }

  try {
    await db.inventoryItem.update({
      where: { id },
      data: { isActive: true },
    });
  } catch (error) {
    console.error("Inventory restore failed:", error);
    return { ok: false, error: "Inventory item could not be restored." };
  }

  revalidatePath("/admin/inventory");
  return { ok: true, message: "Inventory item restored." };
}

export async function upsertInventoryCategoryAction(_prevState: InventoryActionState | null, formData: FormData) {
  await requireAdmin();

  const parsed = inventoryOptionFormSchema.safeParse({
    id: getString(formData, "id") ? getString(formData, "id") : undefined,
    name: getString(formData, "name"),
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const name = normalizeInventoryOptionName(parsed.data.name);
  if (!name) {
    return { ok: false, fieldErrors: { name: ["Name is required"] } };
  }

  try {
    if (parsed.data.id) {
      const existing = await db.inventoryCategory.findUnique({ where: { id: parsed.data.id } });
      if (!existing) return { ok: false, error: "Category was not found." };
      if (isProtectedInventoryOption(existing.name, existing.isSystem)) {
        return { ok: false, error: "The fallback category cannot be renamed." };
      }

      await db.inventoryCategory.update({
        where: { id: parsed.data.id },
        data: { name },
      });
    } else {
      await db.inventoryCategory.upsert({
        where: { name },
        create: { name },
        update: { isActive: true },
      });
    }
  } catch (error) {
    console.error("Inventory category save failed:", error);
    return { ok: false, error: "Category could not be saved. Check for duplicate names." };
  }

  revalidatePath("/admin/inventory");
  return { ok: true, message: "Category saved." };
}

export async function deactivateInventoryCategoryAction(_prevState: InventoryActionState | null, formData: FormData) {
  await requireAdmin();

  const id = Number(getString(formData, "id"));
  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, error: "Category was not found." };
  }

  try {
    const [category, fallback] = await Promise.all([
      db.inventoryCategory.findUnique({ where: { id } }),
      db.inventoryCategory.findUnique({ where: { name: FALLBACK_CATEGORY_NAME } }),
    ]);

    if (!category || !fallback) return { ok: false, error: "Category was not found." };
    if (category.id === fallback.id || isProtectedInventoryOption(category.name, category.isSystem)) {
      return { ok: false, error: "The fallback category cannot be removed." };
    }

    await db.$transaction([
      db.inventoryItem.updateMany({
        where: { categoryId: id },
        data: { categoryId: fallback.id },
      }),
      db.inventoryCategory.update({
        where: { id },
        data: { isActive: false },
      }),
    ]);
  } catch (error) {
    console.error("Inventory category delete failed:", error);
    return { ok: false, error: "Category could not be removed." };
  }

  revalidatePath("/admin/inventory");
  return { ok: true, message: "Category removed." };
}

export async function upsertInventoryUnitAction(_prevState: InventoryActionState | null, formData: FormData) {
  await requireAdmin();

  const parsed = inventoryOptionFormSchema.safeParse({
    id: getString(formData, "id") ? getString(formData, "id") : undefined,
    name: getString(formData, "name"),
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const name = normalizeInventoryOptionName(parsed.data.name);
  if (!name) {
    return { ok: false, fieldErrors: { name: ["Name is required"] } };
  }

  try {
    if (parsed.data.id) {
      const existing = await db.inventoryUnit.findUnique({ where: { id: parsed.data.id } });
      if (!existing) return { ok: false, error: "Unit was not found." };
      if (isProtectedInventoryOption(existing.name, existing.isSystem)) {
        return { ok: false, error: "The fallback unit cannot be renamed." };
      }

      await db.inventoryUnit.update({
        where: { id: parsed.data.id },
        data: { name },
      });
    } else {
      await db.inventoryUnit.upsert({
        where: { name },
        create: { name },
        update: { isActive: true },
      });
    }
  } catch (error) {
    console.error("Inventory unit save failed:", error);
    return { ok: false, error: "Unit could not be saved. Check for duplicate names." };
  }

  revalidatePath("/admin/inventory");
  return { ok: true, message: "Unit saved." };
}

export async function deactivateInventoryUnitAction(_prevState: InventoryActionState | null, formData: FormData) {
  await requireAdmin();

  const id = Number(getString(formData, "id"));
  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, error: "Unit was not found." };
  }

  try {
    const [unit, fallback] = await Promise.all([
      db.inventoryUnit.findUnique({ where: { id } }),
      db.inventoryUnit.findUnique({ where: { name: FALLBACK_UNIT_NAME } }),
    ]);

    if (!unit || !fallback) return { ok: false, error: "Unit was not found." };
    if (unit.id === fallback.id || isProtectedInventoryOption(unit.name, unit.isSystem)) {
      return { ok: false, error: "The fallback unit cannot be removed." };
    }

    await db.$transaction([
      db.inventoryItem.updateMany({
        where: { unitId: id },
        data: { unitId: fallback.id },
      }),
      db.inventoryUnit.update({
        where: { id },
        data: { isActive: false },
      }),
    ]);
  } catch (error) {
    console.error("Inventory unit delete failed:", error);
    return { ok: false, error: "Unit could not be removed." };
  }

  revalidatePath("/admin/inventory");
  return { ok: true, message: "Unit removed." };
}
