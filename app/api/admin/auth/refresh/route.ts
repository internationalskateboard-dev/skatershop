// app/api/admin/auth/refresh/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  refreshAdminTokensFromRequest,
  withAdminRefreshCookie,
} from "@/lib/server/auth/authService";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const data = await refreshAdminTokensFromRequest(req);
  if (!data) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const res = NextResponse.json(
    {
      ok: true,
      accessToken: data.accessToken,
      user: data.user,
    },
    { status: 200 }
  );

  withAdminRefreshCookie(res, data.refreshToken);
  return res;
}
