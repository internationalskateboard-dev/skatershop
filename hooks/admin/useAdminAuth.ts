"use client";

import { useEffect, useState, useCallback } from "react";

export type AdminUser = {
  id: number;
  email: string;
  fullName?: string | null;
  roles: string[];
};

type State = {
  user: AdminUser | null;
  accessToken: string | null;
  loading: boolean;
};

const LS_ADMIN_TOKEN = "skatershop-admin-token";

// Detecta expiración del JWT
function isExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function useAdminAuth() {
  const [state, setState] = useState<State>({
    user: null,
    accessToken: null,
    loading: true,
  });

  // Cargar sesión desde localStorage + validar token
  const loadFromStorage = useCallback(async () => {
    const token = localStorage.getItem(LS_ADMIN_TOKEN);
    if (!token) {
      setState({ user: null, accessToken: null, loading: false });
      return;
    }

    // Si expiró → intentar refresh
    if (isExpired(token)) {
      const ok = await tryRefresh();
      if (!ok) {
        localStorage.removeItem(LS_ADMIN_TOKEN);
        setState({ user: null, accessToken: null, loading: false });
        return;
      }
    }

    // Validar token en backend
    try {
      const res = await fetch("/api/admin/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        localStorage.removeItem(LS_ADMIN_TOKEN);
        setState({ user: null, accessToken: null, loading: false });
        return;
      }

      const data = await res.json();
      setState({ user: data.user, accessToken: token, loading: false });
    } catch {
      localStorage.removeItem(LS_ADMIN_TOKEN);
      setState({ user: null, accessToken: null, loading: false });
    }
  }, []);

  // Refresh token
  async function tryRefresh(): Promise<boolean> {
    try {
      const res = await fetch("/api/admin/auth/refresh", { method: "POST" });
      if (!res.ok) return false;

      const data = await res.json();
      if (!data.accessToken) return false;

      localStorage.setItem(LS_ADMIN_TOKEN, data.accessToken);
      return true;
    } catch {
      return false;
    }
  }

  // Login
  async function login(email: string, password: string) {
    const res = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Error de autenticación");

    const token = data.accessToken;
    localStorage.setItem(LS_ADMIN_TOKEN, token);

    setState({
      user: data.user,
      accessToken: token,
      loading: false,
    });
  }

  // Logout
  async function logout() {
    localStorage.removeItem(LS_ADMIN_TOKEN);
    setState({ user: null, accessToken: null, loading: false });
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch {}
  }

  const isLogged =
    !!state.user &&
    !!state.accessToken &&
    state.user.roles.includes("admin");

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return {
    ...state,
    isLogged,
    login,
    logout,
    reload: loadFromStorage,
  };
}
