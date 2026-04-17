import "server-only";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import type { AdminLoginInput } from "./schema";
import type { Result } from "./types";

type AdminLoginResult = {
  userId: string;
  email: string;
  role: string;
};

type AdminSessionResult = {
  token: string;
  expiresAt: Date;
};

export async function loginAdminService(
  input: AdminLoginInput
): Promise<Result<AdminLoginResult>> {
  const user = await db.user.findUnique({
    where: { email: input.email },
    select: { id: true, email: true, role: true, passwordHash: true, isActive: true }
  });

  if (!user || !user.isActive) {
    return { ok: false, error: "We couldn't find a user with that email and password." };
  }

  if (user.role !== "admin") {
    return { ok: false, error: "You do not have access to the admin portal." };
  }

  const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);
  if (!isValidPassword) {
    return { ok: false, error: "We couldn't find a user with that email and password." };
  }

  return {
    ok: true,
    data: {
      userId: user.id,
      email: user.email,
      role: user.role
    }
  };
}

export async function createAdminSessionService(
  userId: string,
  token: string,
  expiresAt: Date
): Promise<Result<AdminSessionResult>> {
  await db.session.create({
    data: {
      userId,
      token,
      expiresAt
    }
  });

  return { ok: true, data: { token, expiresAt } };
}
