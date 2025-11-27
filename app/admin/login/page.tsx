// app/admin/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAdminAuth } from "@/hooks/admin/useAdminAuth";

export default function AdminLoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const { login } = useAdminAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const next = search.get("next") || "/admin";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace(next);
    } catch (err: any) {
      setError(err?.message || "No se pudo iniciar sesión");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-xl">
        <h1 className="text-xl font-semibold text-white mb-4 text-center">
          Admin — Iniciar sesión
        </h1>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/60 bg-red-900/40 px-3 py-2 text-sm text-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm">
            <span className="text-neutral-300">Email</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-700 px-3 py-2 text-sm text-white outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
            />
          </label>

          <label className="block text-sm">
            <span className="text-neutral-300">Contraseña</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-700 px-3 py-2 text-sm text-white outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-lg bg-yellow-400 text-black font-semibold py-2 text-sm hover:bg-yellow-300 disabled:opacity-60"
          >
            {submitting ? "Entrando..." : "Entrar al panel"}
          </button>
        </form>
      </div>
    </div>
  );
}
