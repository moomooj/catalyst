import { db } from "@/lib/db";
import { AlcoholType } from "@prisma/client";

export async function getAllDrinks() {
  try {
    return await db.drink.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch drinks:", error);
    return [];
  }
}

export async function getDrinksByAlcoholType(type: AlcoholType) {
  try {
    return await db.drink.findMany({
      where: {
        isActive: true,
        alcoholTypes: {
          array_contains: type,
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error(`Failed to fetch drinks for type ${type}:`, error);
    return [];
  }
}
