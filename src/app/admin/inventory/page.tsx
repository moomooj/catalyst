import { requireAdmin } from "@/lib/auth/admin";
import { InventoryManager } from "@/features/inventory/components/InventoryManager";
import { getInventoryPageData } from "@/features/inventory/service";

export default async function AdminInventoryPage() {
  await requireAdmin();
  const { items, categories, units } = await getInventoryPageData();

  return (
    <main className="px-10 py-12 text-[#303520]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <header className="flex flex-wrap items-end justify-between gap-6 border-b border-[#D6D5CE] pb-10">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#7C826F]">
              Administration
            </p>
            <h1 className="text-4xl font-light tracking-tight md:text-5xl">
              Inventory <span className="italic">Management</span>
            </h1>
          </div>
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#7C826F]">
            Materials & Equipment
          </p>
        </header>

        <InventoryManager items={items} categories={categories} units={units} />
      </div>
    </main>
  );
}
