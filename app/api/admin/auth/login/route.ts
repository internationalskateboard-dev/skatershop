// app/api/admin/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  loginAdminWithEmailPassword,
  withAdminRefreshCookie,
} from "@/lib/server/auth/authService";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Faltan credenciales" }, { status: 400 });
    }

    const { user, accessToken, refreshToken } = await loginAdminWithEmailPassword(
      email,
      password
    );

    const res = NextResponse.json(
      {
        ok: true,
        accessToken,
        user,
      },
      { status: 200 }
    );

    withAdminRefreshCookie(res, refreshToken);
    return res;
  } catch (err: any) {
    console.error("[admin login] error:", err);
    return NextResponse.json(
      { error: err?.message || "Credenciales inválidas" },
      { status: 401 }
    );
  }
}
