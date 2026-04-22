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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "image/webp") {
        alert("Please upload a .webp file only.");
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
      // Input 파일 데이터 업데이트 (WebP 검증은 handleFileChange에서 수행됨)
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
      
      // change 이벤트 강제 트리거
      const event = new Event('change', { bubbles: true });
      fileInputRef.current.dispatchEvent(event);
    }
  };

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
          <div className="grid gap-12 md:grid-cols-2">
            <div className="space-y-8">
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

              <div className="block">
                <span className={labelClass}>Cocktail Image (WebP)</span>
                <div 
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  className={`relative flex flex-col items-center justify-center border border-dashed p-4 transition-all duration-300 min-h-[240px] ${
                    isDragging 
                      ? "border-[#7C826F] bg-[#EAE8E4] scale-[1.02]" 
                      : "border-[#D6CAB7] bg-[#F9F8F6]"
                  }`}
                >
                  <input 
                    ref={fileInputRef}
                    name="image" 
                    type="file" 
                    accept=".webp"
                    required 
                    onChange={handleFileChange}
                    className="absolute inset-0 z-10 cursor-pointer opacity-0"
                  />
                  
                  {preview ? (
                    <div className="relative aspect-square w-full max-w-[200px] overflow-hidden shadow-md">
                      <Image 
                        src={preview} 
                        alt="Preview" 
                        fill 
                        className="object-cover"
                      />
                      <button 
                        type="button"
                        onClick={() => { setPreview(null); if(fileInputRef.current) fileInputRef.current.value = ""; }}
                        className="absolute top-2 right-2 bg-black/50 p-1 text-white hover:bg-black z-20"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <svg className={`h-10 w-10 mb-4 transition-colors ${isDragging ? "text-[#7C826F]" : "text-[#B1AA9A]"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B1AA9A]">
                        {isDragging ? "Drop here" : "Drag and drop WebP"}
                      </span>
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
                  placeholder="Describe the flavor profile, ingredients, and story behind this cocktail..." 
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
