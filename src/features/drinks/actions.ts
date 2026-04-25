"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { put, del } from "@vercel/blob";

const drinkSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  alcoholTypes: z.array(z.enum(["TEQUILA", "RUM", "GIN", "VODKA", "WHISKEY", "BUBBLY", "RECOMMEND"])).min(1, "Select at least one alcohol type"),
});

export async function createDrinkAction(prevState: any, formData: FormData) {
  await requireAdmin();

  const imageFile = formData.get("image") as File;
  if (!imageFile || imageFile.size === 0) {
    return { error: { image: ["Image file is required"] } };
  }

  // WebP 및 JPG 확장자 검증
  const allowedTypes = ["image/webp", "image/jpeg"];
  if (!allowedTypes.includes(imageFile.type)) {
    return { error: { image: ["Only .webp or .jpg files are allowed"] } };
  }

  // 파일 용량 제한 (500KB = 512,000 bytes)
  if (imageFile.size > 512000) {
    return { error: { image: ["File size must be less than 500KB"] } };
  }

  const alcoholTypes = formData.getAll("alcoholTypes") as string[];
  const data = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    alcoholTypes,
  };

  const parsed = drinkSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  try {
    // Vercel Blob으로 업로드
    const blob = await put(`drinks/${Date.now()}-${imageFile.name}`, imageFile, {
      access: "public",
    });

    await db.drink.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        image: blob.url,
        alcoholTypes: parsed.data.alcoholTypes,
      },
    });
  } catch (err) {
    console.error("Upload error:", err);
    return { error: "Failed to create drink." };
  }

  revalidatePath("/admin/drinks");
  revalidatePath("/booking");
  redirect("/admin/drinks");
}

export async function updateDrinkAction(id: number, prevState: any, formData: FormData) {
  await requireAdmin();

  const alcoholTypes = formData.getAll("alcoholTypes") as string[];
  const data = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    alcoholTypes,
  };

  const parsed = drinkSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  try {
    const existing = await db.drink.findUnique({ where: { id } });
    if (!existing) return { error: "Drink not found." };

    let imagePath = existing.image;
    const newImage = formData.get("image") as File;

    // 새로운 이미지가 업로드된 경우
    if (newImage && newImage.size > 0) {
      // 기존 Vercel Blob 이미지 삭제 시도
      if (existing.image.includes("public.blob.vercel-storage.com")) {
        try {
          await del(existing.image);
        } catch (e) {
          console.warn("Failed to delete old blob:", e);
        }
      }

      // 새 이미지 업로드
      const blob = await put(`drinks/${Date.now()}-${newImage.name}`, newImage, {
        access: "public",
      });
      imagePath = blob.url;
    }

    await db.drink.update({
      where: { id },
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        image: imagePath,
        alcoholTypes: parsed.data.alcoholTypes,
      },
    });
  } catch (err) {
    console.error("Update error:", err);
    return { error: "Failed to update drink." };
  }

  revalidatePath("/admin/drinks");
  revalidatePath("/booking");
  redirect("/admin/drinks");
}

export async function deleteDrinkAction(id: number, prevState?: any) {
  await requireAdmin();

  try {
    const drink = await db.drink.findUnique({ where: { id } });
    if (!drink) return { error: "Drink not found." };

    // 1. Vercel Blob 이미지 삭제
    if (drink.image && drink.image.includes("public.blob.vercel-storage.com")) {
      try {
        await del(drink.image);
      } catch (e) {
        console.warn(`Blob deletion skipped: ${drink.image}`, e);
      }
    }

    // 2. DB 레코드 삭제
    await db.drink.delete({ where: { id } });
  } catch (err) {
    console.error("Delete error:", err);
    return { error: "Failed to delete drink from database." };
  }

  revalidatePath("/admin/drinks");
  revalidatePath("/booking");
  redirect("/admin/drinks");
}

export async function getDrinkById(id: number) {
  await requireAdmin();
  return db.drink.findUnique({
    where: { id },
  });
}
