import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

const SESSION_COOKIE = "catalyst_admin_session";

export type AdminUser = {
  id: string;
  email: string;
  role: string;
  name: string | null;
};

export async function requireAdmin(): Promise<AdminUser> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    redirect("/admin/login");
  }

  const session = await db.session.findUnique({
    where: { token },
    select: {
      expiresAt: true,
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          name: true,
          isActive: true
        }
      }
    }
  });

  if (!session || !session.user) {
    redirect("/admin/login");
  }

  if (!session.user.isActive || session.user.role !== "admin") {
    redirect("/admin/login");
  }

  if (session.expiresAt < new Date()) {
    redirect("/admin/login");
  }

  return {
    id: session.user.id,
    email: session.user.email,
    role: session.user.role,
    name: session.user.name
  };
}
