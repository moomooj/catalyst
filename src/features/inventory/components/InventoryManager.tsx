"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState, useTransition } from "react";

import { deactivateInventoryItemAction, upsertInventoryItemAction } from "../actions";
import {
  formatCurrencyFromCents,
  formatDecimalLabel,
  formatOrderPriceLabel,
} from "../format";
import type { InventoryItemView, InventoryOption } from "../service";

type InventoryManagerProps = {
  items: InventoryItemView[];
  categories: InventoryOption[];
  units: InventoryOption[];
};

const statusLabels: Record<InventoryItemView["stockStatus"], string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  OVERSTOCK: "Over stock",
};

const statusStyles: Record<InventoryItemView["stockStatus"], string> = {
  LOW: "border-[#B86B5D] bg-[#F8E9E5] text-[#7C332B]",
  MEDIUM: "border-[#D6CAB7] bg-[#F9F8F6] text-[#7C826F]",
  OVERSTOCK: "border-[#9EAD82] bg-[#EEF3E6] text-[#4F5F3A]",
};

function centsToInputValue(cents: number) {
  return (cents / 100).toFixed(2);
}

function getFieldError(fieldErrors: Record<string, string[]> | undefined, name: string) {
  return fieldErrors?.[name]?.[0] ?? "";
}

export function InventoryManager({ items, categories, units }: InventoryManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingItem, setEditingItem] = useState<InventoryItemView | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | undefined>();

  const itemCountLabel = useMemo(() => `${items.length} ${items.length === 1 ? "Item" : "Items"}`, [items.length]);

  function openModal(item: InventoryItemView | null) {
    setEditingItem(item);
    setError("");
    setFieldErrors(undefined);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingItem(null);
    setError("");
    setFieldErrors(undefined);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await upsertInventoryItemAction(null, formData);
      if (!result.ok) {
        setError(result.error ?? "Please review the highlighted fields.");
        setFieldErrors(result.fieldErrors);
        return;
      }

      closeModal();
      router.refresh();
    });
  }

  function handleDeactivate(item: InventoryItemView) {
    const confirmed = window.confirm(`Remove ${item.name} from active inventory?`);
    if (!confirmed) return;

    const formData = new FormData();
    formData.set("id", String(item.id));

    startTransition(async () => {
      const result = await deactivateInventoryItemAction(null, formData);
      if (!result.ok) {
        setError(result.error ?? "Inventory item could not be removed.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border border-[#D6CAB7] bg-white px-6 py-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#7C826F]">
            Current Stock
          </p>
          <p className="mt-1 text-sm text-[#7C826F]">{itemCountLabel}</p>
        </div>
        <button
          type="button"
          onClick={() => openModal(null)}
          className="border border-[#303520] bg-[#303520] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-[#7C826F]"
        >
          Add Item
        </button>
      </div>

      {error && !isModalOpen ? (
        <div className="border border-[#B86B5D] bg-[#F8E9E5] px-5 py-3 text-sm text-[#7C332B]">{error}</div>
      ) : null}

      <div className="overflow-hidden border border-[#D6CAB7] bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-[#F9F8F6] text-[10px] font-bold uppercase tracking-[0.18em] text-[#7C826F]">
              <tr>
                <th className="border-b border-[#D6CAB7] px-5 py-4">Item</th>
                <th className="border-b border-[#D6CAB7] px-5 py-4">Category</th>
                <th className="border-b border-[#D6CAB7] px-5 py-4">Stock</th>
                <th className="border-b border-[#D6CAB7] px-5 py-4">Status</th>
                <th className="border-b border-[#D6CAB7] px-5 py-4">Price</th>
                <th className="border-b border-[#D6CAB7] px-5 py-4">Supplier</th>
                <th className="border-b border-[#D6CAB7] px-5 py-4">Expiry</th>
                <th className="border-b border-[#D6CAB7] px-5 py-4">Active</th>
                <th className="border-b border-[#D6CAB7] px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-20 text-center text-sm text-[#7C826F]">
                    No inventory items yet.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-b border-[#EFE9E1] last:border-b-0">
                    <td className="px-5 py-4 font-medium text-[#303520]">{item.name}</td>
                    <td className="px-5 py-4 text-[#7C826F]">{item.categoryName}</td>
                    <td className="px-5 py-4 text-[#303520]">
                      {formatDecimalLabel(item.quantity)} {item.unitName}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${statusStyles[item.stockStatus]}`}>
                        {statusLabels[item.stockStatus]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#303520]">
                      {formatOrderPriceLabel(item.priceCents, item.minimumOrderQuantity, item.unitName)}
                    </td>
                    <td className="px-5 py-4 text-[#7C826F]">
                      {item.supplierUrl ? (
                        <a className="underline-offset-4 hover:underline" href={item.supplierUrl} target="_blank" rel="noreferrer">
                          {item.supplierName || item.supplierUrl}
                        </a>
                      ) : (
                        item.supplierName || "—"
                      )}
                    </td>
                    <td className="px-5 py-4 text-[#7C826F]">{item.expirationDate || "—"}</td>
                    <td className="px-5 py-4">
                      <span className="inline-block h-2 w-2 rounded-full bg-[#9EAD82]" aria-label={item.isActive ? "Active" : "Inactive"} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => openModal(item)}
                          className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7C826F] hover:text-[#303520]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeactivate(item)}
                          disabled={isPending}
                          className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#B86B5D] hover:text-[#7C332B] disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#303520]/35 px-4 py-8">
          <div className="max-h-[90dvh] w-full max-w-3xl overflow-y-auto border border-[#D6CAB7] bg-[#FDFCF9] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-6 border-b border-[#D6CAB7] pb-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#7C826F]">
                  Inventory Item
                </p>
                <h2 className="mt-1 text-2xl font-light text-[#303520]">
                  {editingItem ? "Edit Item" : "Add Item"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7C826F] hover:text-[#303520]"
              >
                Close
              </button>
            </div>

            <form key={editingItem?.id ?? "new"} onSubmit={handleSubmit} className="mt-6 grid gap-5 md:grid-cols-2">
              {editingItem ? <input type="hidden" name="id" value={editingItem.id} /> : null}

              <label className="space-y-2 md:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7C826F]">Name</span>
                <input
                  name="name"
                  defaultValue={editingItem?.name ?? ""}
                  className="w-full border border-[#D6CAB7] bg-white px-4 py-3 text-sm outline-none focus:border-[#7C826F]"
                />
                {getFieldError(fieldErrors, "name") ? <p className="text-xs text-[#B86B5D]">{getFieldError(fieldErrors, "name")}</p> : null}
              </label>

              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7C826F]">Category</span>
                <select
                  name="categoryId"
                  defaultValue={editingItem?.categoryId ?? categories[0]?.id ?? ""}
                  className="w-full border border-[#D6CAB7] bg-white px-4 py-3 text-sm outline-none focus:border-[#7C826F]"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7C826F]">Unit</span>
                <select
                  name="unitId"
                  defaultValue={editingItem?.unitId ?? units[0]?.id ?? ""}
                  className="w-full border border-[#D6CAB7] bg-white px-4 py-3 text-sm outline-none focus:border-[#7C826F]"
                >
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7C826F]">Supplier Name</span>
                <input
                  name="supplierName"
                  defaultValue={editingItem?.supplierName ?? ""}
                  className="w-full border border-[#D6CAB7] bg-white px-4 py-3 text-sm outline-none focus:border-[#7C826F]"
                />
              </label>

              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7C826F]">Supplier Link</span>
                <input
                  name="supplierUrl"
                  defaultValue={editingItem?.supplierUrl ?? ""}
                  placeholder="https://"
                  className="w-full border border-[#D6CAB7] bg-white px-4 py-3 text-sm outline-none focus:border-[#7C826F]"
                />
                {getFieldError(fieldErrors, "supplierUrl") ? <p className="text-xs text-[#B86B5D]">{getFieldError(fieldErrors, "supplierUrl")}</p> : null}
              </label>

              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7C826F]">Price Before Tax</span>
                <input
                  name="price"
                  inputMode="decimal"
                  defaultValue={editingItem ? centsToInputValue(editingItem.priceCents) : ""}
                  placeholder={formatCurrencyFromCents(0)}
                  className="w-full border border-[#D6CAB7] bg-white px-4 py-3 text-sm outline-none focus:border-[#7C826F]"
                />
                {getFieldError(fieldErrors, "price") ? <p className="text-xs text-[#B86B5D]">{getFieldError(fieldErrors, "price")}</p> : null}
              </label>

              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7C826F]">Minimum Order Quantity</span>
                <input
                  name="minimumOrderQuantity"
                  inputMode="decimal"
                  defaultValue={editingItem?.minimumOrderQuantity ?? "1"}
                  className="w-full border border-[#D6CAB7] bg-white px-4 py-3 text-sm outline-none focus:border-[#7C826F]"
                />
                {getFieldError(fieldErrors, "minimumOrderQuantity") ? <p className="text-xs text-[#B86B5D]">{getFieldError(fieldErrors, "minimumOrderQuantity")}</p> : null}
              </label>

              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7C826F]">Current Stock Quantity</span>
                <input
                  name="quantity"
                  inputMode="decimal"
                  defaultValue={editingItem?.quantity ?? "0"}
                  className="w-full border border-[#D6CAB7] bg-white px-4 py-3 text-sm outline-none focus:border-[#7C826F]"
                />
                {getFieldError(fieldErrors, "quantity") ? <p className="text-xs text-[#B86B5D]">{getFieldError(fieldErrors, "quantity")}</p> : null}
              </label>

              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7C826F]">Stock Status</span>
                <select
                  name="stockStatus"
                  defaultValue={editingItem?.stockStatus ?? "MEDIUM"}
                  className="w-full border border-[#D6CAB7] bg-white px-4 py-3 text-sm outline-none focus:border-[#7C826F]"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="OVERSTOCK">Over stock</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7C826F]">Expiration Date</span>
                <input
                  type="date"
                  name="expirationDate"
                  defaultValue={editingItem?.expirationDate ?? ""}
                  className="w-full border border-[#D6CAB7] bg-white px-4 py-3 text-sm outline-none focus:border-[#7C826F]"
                />
              </label>

              <label className="flex items-center gap-3 border border-[#D6CAB7] bg-white px-4 py-3 md:col-span-2">
                <input name="isActive" type="checkbox" defaultChecked={editingItem?.isActive ?? true} />
                <span className="text-sm text-[#303520]">Active</span>
              </label>

              {error ? <p className="md:col-span-2 text-sm text-[#B86B5D]">{error}</p> : null}

              <div className="flex justify-end gap-3 border-t border-[#D6CAB7] pt-5 md:col-span-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="border border-[#D6CAB7] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#7C826F] hover:border-[#7C826F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="border border-[#303520] bg-[#303520] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white hover:bg-[#7C826F] disabled:opacity-50"
                >
                  {isPending ? "Saving" : "Save Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
