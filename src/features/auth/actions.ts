"use server";

import { redirect } from "next/navigation";
import { adminLoginSchema } from "./schema";
import { loginAdminService } from "./service";
import type { Result } from "./types";

export async function loginAdminAction(prevState: any, input: unknown): Promise<Result<null>> {
  const parsed = adminLoginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Validation failed.", code: "VALIDATION_FAILED" };
  }

  const result = await loginAdminService(parsed.data);
  if (!result.ok) {
    return result;
  }

  // TODO: Set session cookie or token here.
  redirect("/admin/dashboard");
}
