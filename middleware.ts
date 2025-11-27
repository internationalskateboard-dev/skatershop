import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_PATH = "/admin";
const ADMIN_LOGIN = "/admin/login";

export function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const url = nextUrl.pathname;

  // Solo proteger rutas admin
  if (!url.startsWith(ADMIN_PATH)) {
    return NextResponse.next();
  }

  // Permitir login sin token
  if (url.startsWith(ADMIN_LOGIN)) {
    return NextResponse.next();
  }

  // Leer AccessToken del localStorage (a través del header)
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.redirect(new URL(ADMIN_LOGIN, req.url));
  }

  // Validación rápida del JWT (server-side lightweight)
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
    const roles = payload?.roles ?? [];

    const now = Date.now() / 1000;

    if (payload.exp < now) {
      throw new Error("expired");
    }

    if (!roles.includes("admin")) {
      throw new Error("no-admin");
    }
  } catch {
    return NextResponse.redirect(new URL(ADMIN_LOGIN, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
