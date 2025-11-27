// lib/server/auth/authService.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { verifyPassword } from "./passwords";
import {
  signAdminAccessToken,
  signAdminRefreshToken,
  verifyAdminAccessToken,
  verifyAdminRefreshToken,
  type AdminTokenPayload,
} from "./jwt";

export type AdminAuthUser = {
  id: number;
  email: string;
  fullName?: string | null;
  roles: string[];
};

function mapDbUserToAdminAuthUser(db: any): AdminAuthUser {
  const roles = (db.roles ?? []).map((ur: any) => ur.role?.name).filter(Boolean);
  return {
    id: Number(db.id),
    email: db.email,
    fullName: db.fullName ?? null,
    roles,
  };
}

export async function loginAdminWithEmailPassword(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("Credenciales inválidas");
  }

  const authUser = mapDbUserToAdminAuthUser(user);

  if (!authUser.roles.includes("admin")) {
    throw new Error("No tienes permisos de administrador");
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    throw new Error("Credenciales inválidas");
  }

  const payload: Omit<AdminTokenPayload, "exp" | "iat" | "nbf"> = {
    sub: String(authUser.id),
    email: authUser.email,
    roles: authUser.roles,
    type: "admin",
  };

  const accessToken = await signAdminAccessToken(payload);
  const refreshToken = await signAdminRefreshToken(payload);

  return { user: authUser, accessToken, refreshToken };
}

/**
 * Extrae el token Bearer del header Authorization
 */
export function getTokenFromRequest(req: NextRequest): string | null {
  const auth = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!auth) return null;
  const [scheme, token] = auth.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

/**
 * Devuelve el admin logueado (o null)
 */
export async function getAdminFromRequest(req: NextRequest): Promise<AdminAuthUser | null> {
  const token = getTokenFromRequest(req);
  if (!token) return null;

  const payload = await verifyAdminAccessToken(token);
  if (!payload || payload.type !== "admin") return null;

  // Verificamos que el usuario siga existiendo y tenga rol admin
  const user = await prisma.user.findUnique({
    where: { id: BigInt(payload.sub) },
    include: { roles: { include: { role: true } } },
  });
  if (!user) return null;

  const authUser = mapDbUserToAdminAuthUser(user);
  if (!authUser.roles.includes("admin")) return null;

  return authUser;
}

/**
 * Refrescar token a partir de la cookie
 */
export async function refreshAdminTokensFromRequest(req: NextRequest) {
  const refreshToken = req.cookies.get("admin_refresh_token")?.value;
  if (!refreshToken) return null;

  const payload = await verifyAdminRefreshToken(refreshToken);
  if (!payload || payload.type !== "admin") return null;

  // Re-verificar usuario y rol en BD
  const user = await prisma.user.findUnique({
    where: { id: BigInt(payload.sub) },
    include: { roles: { include: { role: true } } },
  });
  if (!user) return null;

  const authUser = mapDbUserToAdminAuthUser(user);
  if (!authUser.roles.includes("admin")) return null;

  const newPayload: Omit<AdminTokenPayload, "exp" | "iat" | "nbf"> = {
    sub: String(authUser.id),
    email: authUser.email,
    roles: authUser.roles,
    type: "admin",
  };

  const newAccess = await signAdminAccessToken(newPayload);
  const newRefresh = await signAdminRefreshToken(newPayload);

  return { user: authUser, accessToken: newAccess, refreshToken: newRefresh };
}

/**
 * Helper para setear cookie de refresh en una respuesta
 */
export function withAdminRefreshCookie(res: NextResponse, refreshToken: string) {
  res.cookies.set("admin_refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 días
  });
  return res;
}

export function clearAdminRefreshCookie(res: NextResponse) {
  res.cookies.set("admin_refresh_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
