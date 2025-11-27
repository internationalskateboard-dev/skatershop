// app/api/admin/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/server/auth/authService";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const user = await getAdminFromRequest(req);
  if (!user) {
    return NextResponse.json({ ok: false, user: null }, { status: 401 });
  }

  return NextResponse.json({ ok: true, user }, { status: 200 });
}
