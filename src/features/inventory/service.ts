import { db } from "@/lib/db";
import { formatDateInput } from "./format";

const DEFAULT_CATEGORIES = ["Alcohol", "Mixer", "Garnish", "Disposable", "Equipment", "Uncategorized"];
const DEFAULT_UNITS = ["unit", "bottle", "case", "pack", "piece", "liter", "box"];

export type InventoryOption = {
  id: number;
  name: string;
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
  await Promise.all([
    ...DEFAULT_CATEGORIES.map((name) =>
      db.inventoryCategory.upsert({
        where: { name },
        create: { name, isSystem: name === "Uncategorized" },
        update: { isActive: true },
      }),
    ),
    ...DEFAULT_UNITS.map((name) =>
      db.inventoryUnit.upsert({
        where: { name },
        create: { name, isSystem: name === "unit" },
        update: { isActive: true },
      }),
    ),
  ]);
}

export async function getInventoryPageData() {
  await ensureDefaultInventoryData();

  const [items, categories, units] = await Promise.all([
    db.inventoryItem.findMany({
      where: { isActive: true },
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
    categories: categories.map((category): InventoryOption => ({ id: category.id, name: category.name })),
    units: units.map((unit): InventoryOption => ({ id: unit.id, name: unit.name })),
  };
}
