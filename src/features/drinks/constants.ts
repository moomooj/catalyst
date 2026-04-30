import { AlcoholType } from "@prisma/client";

export const ALCOHOL_TYPES: { label: string; value: AlcoholType | "ALL" }[] = [
  { label: "All Cocktails", value: "ALL" },
  { label: "Tequila", value: "TEQUILA" },
  { label: "Gin", value: "GIN" },
  { label: "Rum", value: "RUM" },
  { label: "Vodka", value: "VODKA" },
  { label: "Whiskey", value: "WHISKEY" },
  { label: "Bubbly", value: "BUBBLY" },
  { label: "Recommended", value: "RECOMMEND" },
];
