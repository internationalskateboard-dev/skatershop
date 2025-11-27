// app/api/admin/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { hashPassword } from "@/lib/server/auth/passwords";
import {
  signAdminAccessToken,
  signAdminRefreshToken,
  type AdminTokenPayload,
} from "@/lib/server/auth/jwt";
import { withAdminRefreshCookie } from "@/lib/server/auth/authService";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Email y contraseña son obligatorios" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { ok: false, error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    // ¿ya existe el usuario?
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { ok: false, error: "Ya existe un usuario con este email" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Aseguramos que exista el rol "admin"
    const adminRole = await prisma.role.upsert({
      where: { name: "admin" },
      update: {},
      create: { name: "admin" },
    });

    // Creamos usuario + relación con rol admin
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName: fullName ?? null,
        roles: {
          create: {
            roleId: adminRole.id,
          },
        },
      },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });

    const roles = (user.roles ?? [])
      .map((ur: any) => ur.role?.name)
      .filter(Boolean) as string[];

    const payload: Omit<AdminTokenPayload, "exp" | "iat" | "nbf"> = {
      sub: String(user.id),
      email: user.email,
      roles,
      type: "admin",
    };

    const accessToken = await signAdminAccessToken(payload);
    const refreshToken = await signAdminRefreshToken(payload);

    const res = NextResponse.json(
      {
        ok: true,
        accessToken,
        user: {
          id: Number(user.id),
          email: user.email,
          fullName: user.fullName ?? null,
          roles,
        },
      },
      { status: 201 }
    );

    withAdminRefreshCookie(res, refreshToken);
    return res;
  } catch (err: any) {
    console.error("[admin register] error:", err);
    return NextResponse.json(
      { ok: false, error: "Error al registrar administrador" },
      { status: 500 }
    );
  }
}
