"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const createDrinkSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  image: z.string().min(1, "Image path is required"),
  alcoholType: z.enum(["TEQUILA", "RUM", "GIN", "VODKA", "WHISKEY"]),
});

export async function createDrinkAction(formData: FormData) {
  await requireAdmin();

  const data = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    image: formData.get("image") as string,
    alcoholType: formData.get("alcoholType") as any,
  };

  const parsed = createDrinkSchema.safeParse(data);

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    await db.drink.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        image: parsed.data.image,
        alcoholType: parsed.data.alcoholType,
      },
    });
  } catch (err) {
    return { error: "Failed to create drink in database." };
  }

  revalidatePath("/admin/drinks");
  redirect("/admin/drinks");
}
