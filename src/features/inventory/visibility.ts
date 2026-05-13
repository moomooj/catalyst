type InventoryVisibilityItem = {
  isActive: boolean;
};

export function selectInventoryItemsByDeletedState<T extends InventoryVisibilityItem>(items: T[], showDeleted: boolean): T[] {
  return items.filter((item) => item.isActive !== showDeleted);
}
