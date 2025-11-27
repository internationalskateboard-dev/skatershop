// app/api/admin/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { clearAdminRefreshCookie } from "@/lib/server/auth/authService";

export const runtime = "nodejs";

export async function POST(_req: NextRequest) {
  const res = NextResponse.json({ ok: true }, { status: 200 });
  clearAdminRefreshCookie(res);
  return res;
}
