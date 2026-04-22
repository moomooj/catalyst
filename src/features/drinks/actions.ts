"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

const createDrinkSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  alcoholType: z.enum(["TEQUILA", "RUM", "GIN", "VODKA", "WHISKEY"]),
});

export async function createDrinkAction(formData: FormData) {
  await requireAdmin();

  // 1. 파일 데이터 추출
  const imageFile = formData.get("image") as File;
  if (!imageFile || imageFile.size === 0) {
    return { error: { image: ["Image file is required"] } };
  }

  // WebP 확장자 검증
  if (imageFile.type !== "image/webp") {
    return { error: { image: ["Only .webp files are allowed"] } };
  }

  // 2. 기본 데이터 추출 및 검증
  const data = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    alcoholType: formData.get("alcoholType") as any,
  };

  const parsed = createDrinkSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    // 3. 파일 저장 로직
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 파일 이름 생성 (타임스탬프 + 안전한 파일명)
    const fileName = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const uploadDir = join(process.cwd(), "public", "images", "drinks");
    const filePath = join(uploadDir, fileName);
    const dbPath = `/images/drinks/${fileName}`;

    await writeFile(filePath, buffer);

    // 4. DB 저장
    await db.drink.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        image: dbPath,
        alcoholType: parsed.data.alcoholType,
      },
    });
  } catch (err) {
    console.error("Upload error:", err);
    return { error: "Failed to upload image or save drink to database." };
  }

  revalidatePath("/admin/drinks");
  redirect("/admin/drinks");
}
