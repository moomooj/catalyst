import { z } from "zod";

export const inventoryStockStatuses = ["LOW", "MEDIUM", "OVERSTOCK"] as const;

export const inventoryItemFormSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  name: z.string().trim().min(1, "Name is required"),
  categoryId: z.coerce.number().int().positive("Category is required"),
  unitId: z.coerce.number().int().positive("Unit is required"),
  supplierName: z.string().trim().optional(),
  supplierUrl: z.string().trim().optional(),
  price: z.string().trim().min(1, "Price is required"),
  minimumOrderQuantity: z.string().trim().min(1, "Minimum order quantity is required"),
  quantity: z.string().trim().min(1, "Current stock quantity is required"),
  stockStatus: z.enum(inventoryStockStatuses),
  expirationDate: z.string().trim().optional(),
  isActive: z.boolean(),
});

export type InventoryItemFormValues = z.infer<typeof inventoryItemFormSchema>;
