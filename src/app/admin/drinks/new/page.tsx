"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { createDrinkAction } from "@/features/drinks/actions";

export default function NewDrinkPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const labelClass = "text-[10px] font-bold uppercase tracking-[0.2em] text-[#7C826F] mb-3 block";
  const inputClass = "w-full rounded-none border border-[#D6CAB7] bg-white px-4 py-3 text-sm transition-focus focus:border-[#7C826F] focus:outline-none placeholder:text-[#B1AA9A]";

  const alcoholOptions = [
    { value: "TEQUILA", label: "Tequila" },
    { value: "VODKA", label: "Vodka" },
    { value: "GIN", label: "Gin" },
    { value: "RUM", label: "Rum" },
    { value: "WHISKEY", label: "Whiskey" },
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
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
      const event = new Event('change', { bubbles: true });
      fileInputRef.current.dispatchEvent(event);
    }
  };

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
            Add New <span className="italic font-normal">Drink</span>
          </h1>
        </header>

        <form action={createDrinkAction} className="space-y-12 pb-24">
          <div className="grid gap-12 md:grid-cols-2">
            <div className="space-y-10">
              <label className="block">
                <span className={labelClass}>Drink Name</span>
                <input 
                  name="name" 
                  type="text" 
                  placeholder="e.g. Long Island Iced Tea" 
                  required 
                  className={inputClass}
                />
              </label>

              <div className="block">
                <span className={labelClass}>Base Spirits (Select Multiple)</span>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  {alcoholOptions.map((opt) => (
                    <label key={opt.value} className="flex cursor-pointer items-center gap-3 group">
                      <input 
                        name="alcoholTypes" 
                        type="checkbox" 
                        value={opt.value}
                        className="h-4 w-4 rounded-none border-[#D6CAB7] text-[#7C826F] focus:ring-[#7C826F]"
                      />
                      <span className="text-sm text-[#7C826F] group-hover:text-[#303520] transition-colors">
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="block">
                <span className={labelClass}>Cocktail Image (WebP)</span>
                <div 
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  className={`relative flex flex-col items-center justify-center border border-dashed p-4 transition-all duration-300 min-h-[200px] ${
                    isDragging 
                      ? "border-[#7C826F] bg-[#EAE8E4]" 
                      : "border-[#D6CAB7] bg-[#F9F8F6]"
                  }`}
                >
                  <input 
                    ref={fileInputRef}
                    name="image" 
                    type="file" 
                    accept=".webp, .jpg, .jpeg"
                    required 
                    onChange={handleFileChange}
                    className="absolute inset-0 z-10 cursor-pointer opacity-0"
                  />
                  
                  {preview ? (
                    <div className="relative aspect-square w-full max-w-[160px] overflow-hidden shadow-sm">
                      <Image 
                        src={preview} 
                        alt="Preview" 
                        fill 
                        className="object-cover"
                      />
                      <button 
                        type="button"
                        onClick={() => { setPreview(null); if(fileInputRef.current) fileInputRef.current.value = ""; }}
                        className="absolute top-1 right-1 bg-black/50 p-1 text-white hover:bg-black z-20"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <svg className="h-8 w-8 mb-3 text-[#B1AA9A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B1AA9A]">
                        Drag WebP or JPG
                      </span>
                      <p className="mt-1 text-[8px] text-[#B1AA9A] uppercase tracking-widest">Max 500KB</p>
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
                  placeholder="Describe the flavor profile..." 
                  required
                  className={`${inputClass} h-[calc(100%-36px)] resize-none`}
                />
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-6 border-t border-[#F5F2F0] pt-12">
            <Link 
              href="/admin/drinks" 
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B1AA9A] hover:text-[#303520] transition-colors"
            >
              Cancel
            </Link>
            <button 
              type="submit" 
              className="rounded-none bg-[#303520] px-12 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-white hover:bg-[#7C826F] transition-colors"
            >
              Confirm and Save
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
