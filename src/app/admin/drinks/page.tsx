import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";

export default async function AdminDrinksPage() {
  await requireAdmin();

  // 모든 음료 가져오기
  const allDrinks = await db.drink.findMany({
    orderBy: { createdAt: "desc" },
  });

  const sectionTitleClass = "text-[10px] font-bold uppercase tracking-[0.3em] text-[#7C826F]";
  
  const alcoholOrder = ["RECOMMEND", "TEQUILA", "VODKA", "GIN", "RUM", "WHISKEY", "BUBBLY"] as const;
  
  const alcoholLabels: Record<string, string> = {
    TEQUILA: "Tequila",
    VODKA: "Vodka",
    GIN: "Gin",
    RUM: "Rum",
    WHISKEY: "Whiskey",
    BUBBLY: "Bubbly",
    RECOMMEND: "Recommend",
  };

  return (
    <main className="px-10 py-12 text-[#303520]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16">
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

        {allDrinks.length === 0 ? (
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
          <div className="space-y-24">
            {alcoholOrder.map((type) => {
              // 다중 알코올 배열(alcoholTypes)에 현재 카테고리가 포함된 음료들 필터링
              // (Json 데이터이므로 Array.isArray 체크 및 타입 가드 필요)
              const drinksByType = allDrinks.filter(d => {
                const types = d.alcoholTypes as string[];
                return Array.isArray(types) ? types.includes(type) : d.alcoholTypes === type;
              });
              
              return (
                <section key={type} className="space-y-10">
                  <div className="flex items-center gap-6">
                    <h2 className="text-sm font-bold uppercase tracking-[0.4em] text-[#7C826F]">
                      {alcoholLabels[type]}
                    </h2>
                    <div className="h-px flex-1 bg-[#D6D5CE]/50" />
                    <span className="text-[10px] font-medium text-[#B1AA9A]">
                      {drinksByType.length} Items
                    </span>
                  </div>

                  {drinksByType.length === 0 ? (
                    <div className="border border-dashed border-[#D6D5CE]/30 py-12 text-center">
                      <p className="text-[10px] uppercase tracking-widest text-[#B1AA9A]">No drinks registered in this category</p>
                    </div>
                  ) : (
                    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {drinksByType.map((drink) => (
                        <div 
                          key={`${type}-${drink.id}`} 
                          className="group relative flex flex-col border border-[#D6CAB7] bg-white transition-all hover:shadow-xl"
                        >
                          <div className="relative aspect-square w-full overflow-hidden bg-[#F9F8F6]">
                            <Image
                              src={drink.image}
                              alt={drink.name}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {/* 다중 알코올 태그 표시 */}
                            <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
                              {(drink.alcoholTypes as string[] || []).map(t => (
                                <span key={t} className="bg-white/90 px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-widest text-[#7C826F] border border-[#D6CAB7]/30">
                                  {alcoholLabels[t] || t}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex flex-1 flex-col p-6">
                            <h3 className="text-lg font-medium tracking-tight text-[#303520]">
                              {drink.name}
                            </h3>
                            <p className="mt-3 line-clamp-3 text-xs text-[#7C826F] leading-relaxed">
                              {drink.description}
                            </p>
                            
                            <div className="mt-8 flex items-center justify-between border-t border-[#F5F2F0] pt-5">
                              <Link 
                                href={`/admin/drinks/${drink.id}`}
                                className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7C826F] hover:text-[#303520] transition-colors"
                              >
                                View / Edit
                              </Link>
                              <div className={`h-2 w-2 rounded-full ${drink.isActive ? "bg-[#A3B18A]" : "bg-[#B1AA9A]"}`} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
