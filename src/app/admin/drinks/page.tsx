import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";

export default async function AdminDrinksPage() {
  await requireAdmin();

  // 실제 데이터베이스에서 음료 목록 가져오기
  const drinks = await db.drink.findMany({
    orderBy: { createdAt: "desc" },
  });

  const sectionTitleClass = "text-[10px] font-bold uppercase tracking-[0.3em] text-[#7C826F]";

  // 알코올 종류를 한글 또는 보기 좋은 텍스트로 변환하는 맵핑
  const alcoholTypeMap: Record<string, string> = {
    TEQUILA: "Tequila",
    RUM: "Rum",
    GIN: "Gin",
    VODKA: "Vodka",
    WHISKEY: "Whiskey",
  };

  return (
    <main className="px-10 py-12 text-[#303520]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="flex flex-wrap items-end justify-between gap-6 border-b border-[#D6D5CE] pb-10">
          <div className="space-y-1">
            <p className={sectionTitleClass}>Inventory</p>
            <h1 className="text-4xl font-light tracking-tight md:text-5xl">
              Drinks <span className="italic">Management</span>
            </h1>
          </div>
          <Link 
            href="/admin/drinks/new"
            className="rounded-none border border-[#7C826F] px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#7C826F] transition-all hover:bg-[#7C826F] hover:text-white"
          >
            Add New Drink
          </Link>
        </header>

        {drinks.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-dashed border-[#D6CAB7] bg-white/50 py-32 text-center">
            <p className="text-sm text-[#B1AA9A] uppercase tracking-widest font-bold mb-6">
              No drinks found in database.
            </p>
            <Link 
              href="/admin/drinks/new"
              className="rounded-none bg-[#303520] px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white hover:bg-[#7C826F] transition-colors"
            >
              Create Your First Drink
            </Link>
          </div>
        ) : (
          <section className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {drinks.map((drink) => (
              <div 
                key={drink.id} 
                className="group relative flex flex-col border border-[#D6CAB7] bg-white transition-all hover:shadow-lg"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-[#F9F8F6]">
                  {drink.image ? (
                    <Image
                      src={drink.image}
                      alt={drink.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[#B1AA9A]">No Image</div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 px-2 py-1 text-[8px] font-bold uppercase tracking-widest text-[#7C826F] backdrop-blur-sm border border-[#D6CAB7]/50">
                      {alcoholTypeMap[drink.alcoholType] || drink.alcoholType}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-medium tracking-tight text-[#303520]">
                    {drink.name}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-xs text-[#7C826F] leading-relaxed">
                    {drink.description || "No description provided."}
                  </p>
                  
                  <div className="mt-6 flex items-center justify-between border-t border-[#F5F2F0] pt-4">
                    <button className="text-[10px] font-bold uppercase tracking-widest text-[#7C826F] hover:text-[#303520] transition-colors">
                      Edit Details
                    </button>
                    <div className={`h-2 w-2 rounded-full ${drink.isActive ? "bg-[#A3B18A]" : "bg-[#B1AA9A]"}`} />
                  </div>
                </div>
              </div>
            ))}
            
            {/* Add New Placeholder Card */}
            <Link 
              href="/admin/drinks/new"
              className="flex aspect-square flex-col items-center justify-center border border-dashed border-[#D6CAB7] bg-white/50 text-[#B1AA9A] transition-colors hover:bg-white hover:text-[#7C826F]"
            >
              <svg className="h-10 w-10 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">New Drink</span>
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
