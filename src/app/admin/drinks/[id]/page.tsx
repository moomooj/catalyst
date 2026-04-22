import Link from "next/link";
import { notFound } from "next/navigation";
import { getDrinkById } from "@/features/drinks/actions";
import { EditDrinkForm } from "@/features/drinks/components/EditDrinkForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditDrinkPage({ params }: Props) {
  const resolvedParams = await params;
  const drinkId = parseInt(resolvedParams.id);

  if (isNaN(drinkId)) notFound();

  const drink = await getDrinkById(drinkId);
  if (!drink) notFound();

  const sectionTitleClass = "text-[10px] font-bold uppercase tracking-[0.3em] text-[#7C826F]";

  return (
    <main className="px-10 py-12 text-[#303520]">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
        <header className="flex flex-col gap-4 border-b border-[#D6D5CE] pb-10">
          <Link 
            href="/admin/drinks" 
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#B1AA9A] hover:text-[#303520] transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Inventory
          </Link>
          <h1 className="text-4xl font-light tracking-tight md:text-5xl">
            Edit <span className="italic font-normal">Drink</span>
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B1AA9A]">ID: {drink.id}</p>
        </header>

        {/* Client Component Form */}
        <EditDrinkForm drink={drink} />
      </div>
    </main>
  );
}
