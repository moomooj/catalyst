"use client";

import { useState, useRef, useActionState } from "react";
import Link from "next/link";
import Image from "next/image";
import { updateDrinkAction, deleteDrinkAction } from "@/features/drinks/actions";

export function EditDrinkForm({ drink }: { drink: any }) {
  const updateDrinkWithId = updateDrinkAction.bind(null, drink.id);
  const [state, action, isPending] = useActionState(updateDrinkWithId, null);
  const [preview, setPreview] = useState<string | null>(drink.image);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const labelClass = "text-[10px] font-bold uppercase tracking-[0.2em] text-[#7C826F] mb-3 block";
  const inputClass = "w-full rounded-none border border-[#D6CAB7] bg-white px-4 py-3 text-sm focus:border-[#7C826F] focus:outline-none placeholder:text-[#B1AA9A]";

  const alcoholOptions = [
    { value: "TEQUILA", label: "Tequila" },
    { value: "VODKA", label: "Vodka" },
    { value: "GIN", label: "Gin" },
    { value: "RUM", label: "Rum" },
    { value: "WHISKEY", label: "Whiskey" },
    { value: "BUBBLY", label: "Bubbly" },
    { value: "RECOMMEND", label: "Recommend" },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ["image/webp", "image/jpeg"];
      if (!allowedTypes.includes(file.type)) {
        alert("Please upload a .webp or .jpg file only.");
        e.target.value = "";
        return;
      }
      
      if (file.size > 512000) {
        alert("File size must be less than 500KB.");
        e.target.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = async () => {
    if (confirm("Permanently delete this drink? This cannot be undone.")) {
      const result = await deleteDrinkAction(drink.id);
      if (result?.error) alert(result.error);
    }
  };

  return (
    <form action={action} className="space-y-12 pb-24">
      {state?.error && typeof state.error === "string" && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
          {state.error}
        </div>
      )}
      <div className="grid gap-12 md:grid-cols-2">
        <div className="space-y-10">
          <label className="block">
            <span className={labelClass}>Drink Name</span>
            <input 
              name="name" 
              type="text" 
              defaultValue={drink.name}
              required 
              className={inputClass}
            />
          </label>

          <div className="block">
            <span className={labelClass}>Base Spirits</span>
            <div className="grid grid-cols-2 gap-4 pt-2">
              {alcoholOptions.map((opt) => (
                <label key={opt.value} className="flex cursor-pointer items-center gap-3 group">
                  <input 
                    name="alcoholTypes" 
                    type="checkbox" 
                    value={opt.value}
                    defaultChecked={(drink.alcoholTypes as string[] || []).includes(opt.value)}
                    className="h-4 w-4 rounded-none border-[#D6CAB7] text-[#7C826F] focus:ring-[#7C826F]"
                  />
                  <span className="text-sm text-[#7C826F] group-hover:text-[#303520]">
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="block">
            <span className={labelClass}>Change Image (WebP, JPG)</span>
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file && fileInputRef.current) {
                  const dt = new DataTransfer();
                  dt.items.add(file);
                  fileInputRef.current.files = dt.files;
                  const event = new Event('change', { bubbles: true });
                  fileInputRef.current.dispatchEvent(event);
                }
              }}
              className={`relative flex flex-col items-center justify-center border border-dashed p-4 min-h-[200px] transition-all ${
                isDragging ? "border-[#7C826F] bg-[#EAE8E4]" : "border-[#D6CAB7] bg-[#F9F8F6]"
              }`}
            >
              <input 
                ref={fileInputRef}
                name="image" 
                type="file" 
                accept=".webp, .jpg, .jpeg"
                onChange={handleFileChange}
                className="absolute inset-0 z-10 cursor-pointer opacity-0"
              />
              {preview ? (
                <div className="relative aspect-square w-full max-w-[160px] overflow-hidden">
                  <Image src={preview} alt="Preview" fill className="object-cover" />
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-[10px] uppercase tracking-widest text-[#B1AA9A]">Drop new photo</span>
                  <p className="mt-1 text-[8px] text-[#B1AA9A] uppercase tracking-widest">WebP or JPG · Max 500KB</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <label className="block h-full">
            <span className={labelClass}>Flavor Description</span>
            <textarea 
              name="description" 
              rows={10} 
              defaultValue={drink.description}
              required
              className={`${inputClass} h-[calc(100%-36px)] resize-none`}
            />
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[#F5F2F0] pt-12">
        <button 
          type="button" 
          onClick={handleDelete}
          className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400 hover:text-red-600 transition-colors"
        >
          Delete Drink
        </button>
        <div className="flex items-center gap-6">
          <Link href="/admin/drinks" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B1AA9A] hover:text-[#303520]">
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={isPending}
            className="rounded-none bg-[#303520] px-12 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-white hover:bg-[#7C826F] transition-colors disabled:bg-[#D6D5CE] disabled:cursor-not-allowed"
          >
            {isPending ? "Updating..." : "Update Drink"}
          </button>
        </div>
      </div>
    </form>
  );
}
