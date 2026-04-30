"use client";

import { useState } from "react";
import DrinkCard from "./DrinkCard";
import { ALCOHOL_TYPES } from "../constants";
import { Raleway } from "next/font/google";

const raleway = Raleway({ subsets: ["latin"], display: "swap" });

interface Drink {
  id: number;
  name: string;
  description: string;
  image: string;
  alcoholTypes: any; // JSON from Prisma
}

export default function DrinkList({ initialDrinks }: { initialDrinks: Drink[] }) {
  const [filter, setFilter] = useState<string>("ALL");

  const filteredDrinks = initialDrinks.filter((drink) => {
    if (filter === "ALL") return true;
    const types = Array.isArray(drink.alcoholTypes) ? drink.alcoholTypes : JSON.parse(drink.alcoholTypes as string);
    return types.includes(filter);
  });

  return (
    <div className="space-y-16">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 border-b border-[#D6CAB7]/30 pb-8">
        {ALCOHOL_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => setFilter(type.value)}
            className={`${raleway.className} text-[11px] font-bold tracking-[0.2em] uppercase transition-colors ${
              filter === type.value ? "text-[#303520] border-b border-[#303520]" : "text-[#7C826F]/60 hover:text-[#303520]"
            } pb-1`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredDrinks.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 sm:gap-x-8 sm:gap-y-16">
          {filteredDrinks.map((drink) => (
            <DrinkCard
              key={drink.id}
              name={drink.name}
              description={drink.description}
              image={drink.image}
              alcoholTypes={Array.isArray(drink.alcoholTypes) ? drink.alcoholTypes : JSON.parse(drink.alcoholTypes as string)}
            />
          ))}
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center text-[#7C826F]">
          <p className={`${raleway.className} text-lg font-light italic`}>
            More spirits coming soon.
          </p>
        </div>
      )}
    </div>
  );
}
