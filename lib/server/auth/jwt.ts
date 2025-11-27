// lib/server/auth/jwt.ts
import { SignJWT, jwtVerify, JWTPayload } from "jose";

const ADMIN_ACCESS_TTL = "1h";      // tiempo de vida access token
const ADMIN_REFRESH_TTL = "7d";     // tiempo de vida refresh token

function getAccessSecret() {
  const secret = process.env.ADMIN_JWT_SECRET || "dev-admin-secret";
  return new TextEncoder().encode(secret);
}

function getRefreshSecret() {
  const secret = process.env.ADMIN_REFRESH_SECRET || "dev-admin-refresh";
  return new TextEncoder().encode(secret);
}

export type AdminTokenPayload = JWTPayload & {
  sub: string;           // userId
  email: string;
  roles: string[];       // debe incluir "admin" para panel admin
  type: "admin";
};

export async function signAdminAccessToken(payload: Omit<AdminTokenPayload, "exp" | "iat" | "nbf">) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(ADMIN_ACCESS_TTL)
    .sign(getAccessSecret());
}

export async function signAdminRefreshToken(payload: Omit<AdminTokenPayload, "exp" | "iat" | "nbf">) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(ADMIN_REFRESH_TTL)
    .sign(getRefreshSecret());
}

export async function verifyAdminAccessToken(token: string): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getAccessSecret());
    return payload as AdminTokenPayload;
  } catch {
    return null;
  }
}

export async function verifyAdminRefreshToken(token: string): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getRefreshSecret());
    return payload as AdminTokenPayload;
  } catch {
    return null;
  }
}
