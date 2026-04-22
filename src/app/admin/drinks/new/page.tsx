import Link from "next/link";
import { createDrinkAction } from "@/features/drinks/actions";

export default function NewDrinkPage() {
  const labelClass = "text-[10px] font-bold uppercase tracking-[0.2em] text-[#7C826F] mb-2 block";
  const inputClass = "w-full rounded-none border border-[#D6CAB7] bg-white px-4 py-3 text-sm transition-focus focus:border-[#7C826F] focus:outline-none";

  return (
    <main className="px-10 py-12 text-[#303520]">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10">
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
            Add New <span className="italic font-normal">Drink</span>
          </h1>
        </header>

        <form action={createDrinkAction} className="space-y-12 pb-24">
          {/* Section: Basic Info */}
          <div className="grid gap-10 md:grid-cols-2">
            <div className="space-y-6">
              <label className="block">
                <span className={labelClass}>Drink Name</span>
                <input 
                  name="name" 
                  type="text" 
                  placeholder="e.g. Lavender Gin Sour" 
                  required 
                  className={inputClass}
                />
              </label>

              <label className="block">
                <span className={labelClass}>Alcohol Type</span>
                <select name="alcoholType" required className={inputClass}>
                  <option value="">Select Base Spirit</option>
                  <option value="TEQUILA">Tequila</option>
                  <option value="RUM">Rum</option>
                  <option value="GIN">Gin</option>
                  <option value="VODKA">Vodka</option>
                  <option value="WHISKEY">Whiskey</option>
                </select>
              </label>

              <label className="block">
                <span className={labelClass}>Image Path</span>
                <input 
                  name="image" 
                  type="text" 
                  placeholder="e.g. /images/cocktails/signature.jpg" 
                  required 
                  className={inputClass}
                />
                <p className="mt-2 text-[10px] text-[#B1AA9A]">
                  Place image in public/images folder and enter the path.
                </p>
              </label>
            </div>

            <div className="space-y-6">
              <label className="block h-full">
                <span className={labelClass}>Description</span>
                <textarea 
                  name="description" 
                  rows={8} 
                  placeholder="Describe the flavor profile, ingredients, and story behind this cocktail..." 
                  className={`${inputClass} h-[calc(100%-28px)] resize-none`}
                />
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-6 border-t border-[#F5F2F0] pt-12">
            <Link 
              href="/admin/drinks" 
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B1AA9A] hover:text-[#303520] transition-colors"
            >
              Cancel
            </Link>
            <button 
              type="submit" 
              className="rounded-none bg-[#303520] px-12 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-white hover:bg-[#7C826F] transition-colors shadow-sm"
            >
              Confirm and Save
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
