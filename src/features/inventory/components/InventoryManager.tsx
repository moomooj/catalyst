"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

import {
  deactivateInventoryCategoryAction,
  deactivateInventoryItemAction,
  deactivateInventoryUnitAction,
  restoreInventoryItemAction,
  upsertInventoryCategoryAction,
  upsertInventoryItemAction,
  upsertInventoryUnitAction,
} from "../actions";
import {
  formatCurrencyFromCents,
  formatDecimalLabel,
  formatOrderPriceLabel,
} from "../format";
import { isProtectedInventoryOption } from "../optionRules";
import { getInventoryPageCount, getInventoryPageItems } from "../pagination";
import { filterInventoryItems } from "../search";
import type { InventoryItemView, InventoryOption } from "../service";
import { selectInventoryItemsByDeletedState } from "../visibility";

type InventoryManagerProps = {
  items: InventoryItemView[];
  categories: InventoryOption[];
  units: InventoryOption[];
};

type PendingRemoval =
  | { type: "item"; id: number; name: string; title: string; description: string; confirmLabel: string }
  | { type: "category"; id: number; name: string; title: string; description: string; confirmLabel: string }
  | { type: "unit"; id: number; name: string; title: string; description: string; confirmLabel: string };

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

const INVENTORY_PAGE_SIZE = 20;

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
  const [isListsModalOpen, setIsListsModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingUnitId, setEditingUnitId] = useState<number | null>(null);
  const [pendingRemoval, setPendingRemoval] = useState<PendingRemoval | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilterId, setCategoryFilterId] = useState<number | undefined>();
  const [showDeleted, setShowDeleted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState("");
  const [listError, setListError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | undefined>();
  const visibleItems = selectInventoryItemsByDeletedState(items, showDeleted);
  const filteredItems = filterInventoryItems(visibleItems, searchQuery, categoryFilterId);
  const pageCount = getInventoryPageCount(filteredItems.length, INVENTORY_PAGE_SIZE);
  const activePage = Math.min(currentPage, pageCount);
  const pagedItems = getInventoryPageItems(filteredItems, activePage, INVENTORY_PAGE_SIZE);
  const hasActiveFilter = searchQuery.trim().length > 0 || Boolean(categoryFilterId);

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

  function openListsModal() {
    setListError("");
    setEditingCategoryId(null);
    setEditingUnitId(null);
    setIsListsModalOpen(true);
  }

  function closeListsModal() {
    setIsListsModalOpen(false);
    setListError("");
    setEditingCategoryId(null);
    setEditingUnitId(null);
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
    setPendingRemoval({
      type: "item",
      id: item.id,
      name: item.name,
      title: "Remove Inventory Item",
      description: `${item.name} will move to the trash. You can restore it later from the deleted view.`,
      confirmLabel: "Remove Item",
    });
  }

  function confirmRemoval() {
    if (!pendingRemoval) return;
    const formData = new FormData();
    formData.set("id", String(pendingRemoval.id));

    startTransition(async () => {
      const result =
        pendingRemoval.type === "item"
          ? await deactivateInventoryItemAction(null, formData)
          : pendingRemoval.type === "category"
            ? await deactivateInventoryCategoryAction(null, formData)
            : await deactivateInventoryUnitAction(null, formData);

      if (!result.ok) {
        const fallbackError =
          pendingRemoval.type === "item"
            ? "Inventory item could not be removed."
            : pendingRemoval.type === "category"
              ? "Category could not be removed."
              : "Unit could not be removed.";
        if (pendingRemoval.type === "item") {
          setError(result.error ?? fallbackError);
        } else {
          setListError(result.error ?? fallbackError);
        }
        return;
      }
      setPendingRemoval(null);
      setError("");
      setListError("");
      router.refresh();
    });
  }

  function handleRestore(item: InventoryItemView) {
    const formData = new FormData();
    formData.set("id", String(item.id));

    startTransition(async () => {
      const result = await restoreInventoryItemAction(null, formData);
      if (!result.ok) {
        setError(result.error ?? "Inventory item could not be restored.");
        return;
      }
      router.refresh();
    });
  }

  function handleCategorySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await upsertInventoryCategoryAction(null, formData);
      if (!result.ok) {
        setListError(result.error ?? result.fieldErrors?.name?.[0] ?? "Category could not be saved.");
        return;
      }
      setListError("");
      setEditingCategoryId(null);
      router.refresh();
    });
  }

  function handleUnitSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await upsertInventoryUnitAction(null, formData);
      if (!result.ok) {
        setListError(result.error ?? result.fieldErrors?.name?.[0] ?? "Unit could not be saved.");
        return;
      }
      setListError("");
      setEditingUnitId(null);
      router.refresh();
    });
  }

  function handleCategoryDelete(category: InventoryOption) {
    if (isProtectedInventoryOption(category.name, category.isSystem)) {
      setListError("The fallback category cannot be removed.");
      return;
    }

    setPendingRemoval({
      type: "category",
      id: category.id,
      name: category.name,
      title: "Remove Category",
      description: `${category.name} will be removed from the active category list. Items using it will move to Uncategorized.`,
      confirmLabel: "Remove Category",
    });
  }

  function handleUnitDelete(unit: InventoryOption) {
    if (isProtectedInventoryOption(unit.name, unit.isSystem)) {
      setListError("The fallback unit cannot be removed.");
      return;
    }

    setPendingRemoval({
      type: "unit",
      id: unit.id,
      name: unit.name,
      title: "Remove Unit",
      description: `${unit.name} will be removed from the active unit list. Items using it will move to unit.`,
      confirmLabel: "Remove Unit",
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border border-[#D6CAB7] bg-white px-6 py-5">
        <div className="flex min-w-[260px] flex-1 flex-wrap gap-3 md:max-w-2xl">
          <label className="min-w-[220px] flex-1">
            <span className="sr-only">Search inventory</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search inventory"
              className="w-full border border-[#D6CAB7] bg-[#FDFCF9] px-4 py-3 text-sm text-[#303520] outline-none transition placeholder:text-[#B1AA9A] focus:border-[#7C826F]"
            />
          </label>
          <label className="min-w-[180px]">
            <span className="sr-only">Filter by category</span>
            <select
              value={categoryFilterId ?? ""}
              onChange={(event) => {
                setCategoryFilterId(event.target.value ? Number(event.target.value) : undefined);
                setCurrentPage(1);
              }}
              className="w-full border border-[#D6CAB7] bg-[#FDFCF9] px-4 py-3 text-sm text-[#303520] outline-none transition focus:border-[#7C826F]"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setShowDeleted((current) => !current);
              setCurrentPage(1);
            }}
            aria-pressed={showDeleted}
            className={`inline-flex items-center gap-2 border px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition ${
              showDeleted
                ? "border-[#303520] bg-[#303520] text-white"
                : "border-[#7C826F] text-[#7C826F] hover:bg-[#7C826F] hover:text-white"
            }`}
          >
            <svg aria-hidden="true" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="M6 6l1 15h10l1-15" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
            </svg>
            {showDeleted ? "Deleted" : "Trash"}
          </button>
          <button
            type="button"
            onClick={openListsModal}
            className="border border-[#7C826F] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#7C826F] transition hover:bg-[#7C826F] hover:text-white"
          >
            Manage Lists
          </button>
          <button
            type="button"
            onClick={() => openModal(null)}
            className="border border-[#303520] bg-[#303520] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-[#7C826F]"
          >
            Add Item
          </button>
        </div>
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
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-20 text-center text-sm text-[#7C826F]">
                    {hasActiveFilter
                      ? "No inventory items match your filters."
                      : showDeleted
                        ? "No deleted inventory items."
                        : "No inventory items yet."}
                  </td>
                </tr>
              ) : (
                pagedItems.map((item) => (
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
                      <span
                        className={`inline-block h-2 w-2 rounded-full ${item.isActive ? "bg-[#9EAD82]" : "bg-[#B1AA9A]"}`}
                        aria-label={item.isActive ? "Active" : "Inactive"}
                      />
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
                        {item.isActive ? (
                          <button
                            type="button"
                            onClick={() => handleDeactivate(item)}
                            disabled={isPending}
                            className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#B86B5D] hover:text-[#7C332B] disabled:opacity-50"
                          >
                            Remove
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRestore(item)}
                            disabled={isPending}
                            className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7C826F] hover:text-[#303520] disabled:opacity-50"
                          >
                            Restore
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredItems.length > INVENTORY_PAGE_SIZE ? (
        <div className="flex flex-wrap items-center justify-between gap-4 border border-t-0 border-[#D6CAB7] bg-white px-5 py-4">
          <p className="text-xs text-[#7C826F]">
            Showing {(activePage - 1) * INVENTORY_PAGE_SIZE + 1}-
            {Math.min(activePage * INVENTORY_PAGE_SIZE, filteredItems.length)} of {filteredItems.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={activePage === 1}
              className="border border-[#D6CAB7] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#7C826F] hover:border-[#7C826F] disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-3 text-xs text-[#7C826F]">
              Page {activePage} of {pageCount}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
              disabled={activePage === pageCount}
              className="border border-[#D6CAB7] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#7C826F] hover:border-[#7C826F] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}

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

      {isListsModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#303520]/35 px-4 py-8">
          <div className="max-h-[90dvh] w-full max-w-5xl overflow-y-auto border border-[#D6CAB7] bg-[#FDFCF9] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-6 border-b border-[#D6CAB7] pb-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#7C826F]">
                  Inventory Lists
                </p>
                <h2 className="mt-1 text-2xl font-light text-[#303520]">
                  Categories & Units
                </h2>
              </div>
              <button
                type="button"
                onClick={closeListsModal}
                className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7C826F] hover:text-[#303520]"
              >
                Close
              </button>
            </div>

            {listError ? (
              <div className="mt-5 border border-[#B86B5D] bg-[#F8E9E5] px-5 py-3 text-sm text-[#7C332B]">
                {listError}
              </div>
            ) : null}

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <section className="border border-[#D6CAB7] bg-white">
                <div className="border-b border-[#D6CAB7] px-5 py-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7C826F]">Categories</p>
                </div>
                <div className="space-y-4 p-5">
                  <form onSubmit={handleCategorySubmit} className="flex gap-3">
                    <input
                      name="name"
                      placeholder="New category"
                      className="min-w-0 flex-1 border border-[#D6CAB7] bg-white px-4 py-3 text-sm outline-none focus:border-[#7C826F]"
                    />
                    <button
                      type="submit"
                      disabled={isPending}
                      className="border border-[#303520] bg-[#303520] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white disabled:opacity-50"
                    >
                      Add
                    </button>
                  </form>

                  <div className="divide-y divide-[#EFE9E1] border border-[#EFE9E1]">
                    {categories.map((category) => {
                      const isEditing = editingCategoryId === category.id;
                      const isProtected = isProtectedInventoryOption(category.name, category.isSystem);

                      return (
                        <div key={category.id} className="px-4 py-3">
                          {isEditing ? (
                            <form onSubmit={handleCategorySubmit} className="flex gap-3">
                              <input type="hidden" name="id" value={category.id} />
                              <input
                                name="name"
                                defaultValue={category.name}
                                className="min-w-0 flex-1 border border-[#D6CAB7] bg-white px-3 py-2 text-sm outline-none focus:border-[#7C826F]"
                              />
                              <button type="submit" disabled={isPending} className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7C826F] disabled:opacity-50">
                                Save
                              </button>
                              <button type="button" onClick={() => setEditingCategoryId(null)} className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#B1AA9A]">
                                Cancel
                              </button>
                            </form>
                          ) : (
                            <div className="flex items-center justify-between gap-4">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-[#303520]">{category.name}</p>
                                {isProtected ? <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-[#B1AA9A]">Fallback</p> : null}
                              </div>
                              <div className="flex gap-3">
                                <button
                                  type="button"
                                  onClick={() => setEditingCategoryId(category.id)}
                                  disabled={isProtected}
                                  className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7C826F] hover:text-[#303520] disabled:text-[#B1AA9A]"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCategoryDelete(category)}
                                  disabled={isProtected || isPending}
                                  className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#B86B5D] hover:text-[#7C332B] disabled:text-[#B1AA9A]"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              <section className="border border-[#D6CAB7] bg-white">
                <div className="border-b border-[#D6CAB7] px-5 py-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7C826F]">Units</p>
                </div>
                <div className="space-y-4 p-5">
                  <form onSubmit={handleUnitSubmit} className="flex gap-3">
                    <input
                      name="name"
                      placeholder="New unit"
                      className="min-w-0 flex-1 border border-[#D6CAB7] bg-white px-4 py-3 text-sm outline-none focus:border-[#7C826F]"
                    />
                    <button
                      type="submit"
                      disabled={isPending}
                      className="border border-[#303520] bg-[#303520] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white disabled:opacity-50"
                    >
                      Add
                    </button>
                  </form>

                  <div className="divide-y divide-[#EFE9E1] border border-[#EFE9E1]">
                    {units.map((unit) => {
                      const isEditing = editingUnitId === unit.id;
                      const isProtected = isProtectedInventoryOption(unit.name, unit.isSystem);

                      return (
                        <div key={unit.id} className="px-4 py-3">
                          {isEditing ? (
                            <form onSubmit={handleUnitSubmit} className="flex gap-3">
                              <input type="hidden" name="id" value={unit.id} />
                              <input
                                name="name"
                                defaultValue={unit.name}
                                className="min-w-0 flex-1 border border-[#D6CAB7] bg-white px-3 py-2 text-sm outline-none focus:border-[#7C826F]"
                              />
                              <button type="submit" disabled={isPending} className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7C826F] disabled:opacity-50">
                                Save
                              </button>
                              <button type="button" onClick={() => setEditingUnitId(null)} className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#B1AA9A]">
                                Cancel
                              </button>
                            </form>
                          ) : (
                            <div className="flex items-center justify-between gap-4">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-[#303520]">{unit.name}</p>
                                {isProtected ? <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-[#B1AA9A]">Fallback</p> : null}
                              </div>
                              <div className="flex gap-3">
                                <button
                                  type="button"
                                  onClick={() => setEditingUnitId(unit.id)}
                                  disabled={isProtected}
                                  className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7C826F] hover:text-[#303520] disabled:text-[#B1AA9A]"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUnitDelete(unit)}
                                  disabled={isProtected || isPending}
                                  className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#B86B5D] hover:text-[#7C332B] disabled:text-[#B1AA9A]"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : null}

      {pendingRemoval ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#303520]/40 px-4 py-8">
          <div className="w-full max-w-md border border-[#D6CAB7] bg-[#FDFCF9] p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#B86B5D] bg-[#F8E9E5] text-[#7C332B]">
                <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="M6 6l1 15h10l1-15" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#B86B5D]">
                  Confirm Remove
                </p>
                <h2 className="mt-1 text-xl font-light text-[#303520]">{pendingRemoval.title}</h2>
                <p className="mt-3 text-sm leading-6 text-[#7C826F]">{pendingRemoval.description}</p>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3 border-t border-[#D6CAB7] pt-5">
              <button
                type="button"
                onClick={() => setPendingRemoval(null)}
                disabled={isPending}
                className="border border-[#D6CAB7] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#7C826F] hover:border-[#7C826F] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRemoval}
                disabled={isPending}
                className="border border-[#B86B5D] bg-[#B86B5D] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white hover:bg-[#7C332B] disabled:opacity-50"
              >
                {isPending ? "Removing" : pendingRemoval.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
