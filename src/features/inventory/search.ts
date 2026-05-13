type SearchableInventoryItem = {
  categoryId: number;
  name: string;
  categoryName: string;
  unitName: string;
  supplierName: string;
};

export function filterInventoryItems<T extends SearchableInventoryItem>(items: T[], query: string, categoryId?: number): T[] {
  const normalizedQuery = query.trim().toLowerCase();

  return items.filter((item) => {
    const matchesCategory = !categoryId || item.categoryId === categoryId;
    const matchesQuery = !normalizedQuery || [item.name, item.categoryName, item.unitName, item.supplierName]
      .some((value) => value.toLowerCase().includes(normalizedQuery));

    return matchesCategory && matchesQuery;
  });
}
