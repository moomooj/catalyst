import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const SESSION_COOKIE = "catalyst_admin_session";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const session = await db.session.findUnique({
    where: { token },
    select: {
      expiresAt: true,
      user: {
        select: { id: true, role: true, isActive: true }
      }
    }
  });

  if (!session?.user || session.expiresAt < new Date()) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  if (!session.user.isActive || session.user.role !== "admin") {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
