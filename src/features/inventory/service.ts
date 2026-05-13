import { db } from "@/lib/db";
import { shouldSeedEditableDefaults } from "./defaults";
import { formatDateInput } from "./format";
import { FALLBACK_CATEGORY_NAME, FALLBACK_UNIT_NAME } from "./optionRules";

const EDITABLE_DEFAULT_CATEGORIES = ["Alcohol", "Mixer", "Garnish", "Disposable", "Equipment"];
const EDITABLE_DEFAULT_UNITS = ["bottle", "case", "pack", "piece", "liter", "box"];

export type InventoryOption = {
  id: number;
  name: string;
  isSystem: boolean;
};

export type InventoryItemView = {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  unitId: number;
  unitName: string;
  supplierName: string;
  supplierUrl: string;
  priceCents: number;
  minimumOrderQuantity: string;
  quantity: string;
  stockStatus: "LOW" | "MEDIUM" | "OVERSTOCK";
  expirationDate: string;
  isActive: boolean;
};

export async function ensureDefaultInventoryData() {
  const [categoryCount, unitCount] = await Promise.all([
    db.inventoryCategory.count(),
    db.inventoryUnit.count(),
  ]);

  const categoryNames = shouldSeedEditableDefaults(categoryCount)
    ? [...EDITABLE_DEFAULT_CATEGORIES, FALLBACK_CATEGORY_NAME]
    : [FALLBACK_CATEGORY_NAME];
  const unitNames = shouldSeedEditableDefaults(unitCount)
    ? [FALLBACK_UNIT_NAME, ...EDITABLE_DEFAULT_UNITS]
    : [FALLBACK_UNIT_NAME];

  await Promise.all([
    ...categoryNames.map((name) =>
      db.inventoryCategory.upsert({
        where: { name },
        create: { name, isSystem: name === FALLBACK_CATEGORY_NAME },
        update: name === FALLBACK_CATEGORY_NAME ? { isActive: true } : {},
      }),
    ),
    ...unitNames.map((name) =>
      db.inventoryUnit.upsert({
        where: { name },
        create: { name, isSystem: name === FALLBACK_UNIT_NAME },
        update: name === FALLBACK_UNIT_NAME ? { isActive: true } : {},
      }),
    ),
  ]);
}

export async function getInventoryPageData() {
  await ensureDefaultInventoryData();

  const [items, categories, units] = await Promise.all([
    db.inventoryItem.findMany({
      include: { category: true, unit: true },
      orderBy: [{ name: "asc" }],
    }),
    db.inventoryCategory.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
    db.inventoryUnit.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    items: items.map((item): InventoryItemView => ({
      id: item.id,
      name: item.name,
      categoryId: item.categoryId,
      categoryName: item.category.name,
      unitId: item.unitId,
      unitName: item.unit.name,
      supplierName: item.supplierName ?? "",
      supplierUrl: item.supplierUrl ?? "",
      priceCents: item.priceCents,
      minimumOrderQuantity: item.minimumOrderQuantity.toString(),
      quantity: item.quantity.toString(),
      stockStatus: item.stockStatus,
      expirationDate: formatDateInput(item.expirationDate),
      isActive: item.isActive,
    })),
    categories: categories.map((category): InventoryOption => ({ id: category.id, name: category.name, isSystem: category.isSystem })),
    units: units.map((unit): InventoryOption => ({ id: unit.id, name: unit.name, isSystem: unit.isSystem })),
  };
}
