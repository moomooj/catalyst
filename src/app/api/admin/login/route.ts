import { NextResponse } from "next/server";
import crypto from "crypto";
import { adminLoginSchema } from "@/features/auth/schema";
import { createAdminSessionService, loginAdminService } from "@/features/auth/service";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Validation failed." },
      { status: 400 }
    );
  }

  const result = await loginAdminService(parsed.data);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 401 });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const sessionResult = await createAdminSessionService(
    result.data.userId,
    token,
    expiresAt
  );
  if (!sessionResult.ok) {
    return NextResponse.json(
      { ok: false, error: "Failed to start session." },
      { status: 500 }
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("catalyst_admin_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt
  });
  return response;
}
