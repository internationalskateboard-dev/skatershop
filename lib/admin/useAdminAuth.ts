// lib/admin/useAdminAuth.ts
"use client";

import { SS_ADMIN_AUTH } from "./constants";

export function useAdminAuth() {
  const logout = () => {
    if (typeof window === "undefined") return;

    // Borramos la "sesión" de admin de esta pestaña
    sessionStorage.removeItem(SS_ADMIN_AUTH);

    // Forzamos recarga: AdminGuard volverá a pedir la clave
    window.location.reload();
  };

  return { logout };
}
