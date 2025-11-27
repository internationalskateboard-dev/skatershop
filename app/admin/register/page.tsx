// app/admin/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const LS_ADMIN_TOKEN = "skatershop-admin-token";

export default function AdminRegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data?.error || "No se pudo registrar");
      }

      // Guardamos el access token igual que hace useAdminAuth
      if (typeof window !== "undefined") {
        localStorage.setItem(LS_ADMIN_TOKEN, data.accessToken);
      }

      setSuccess("Administrador creado correctamente. Redirigiendo...");
      // Pequeña pausa y al panel
      setTimeout(() => {
        router.replace("/admin");
      }, 1200);
    } catch (err: any) {
      setError(err?.message || "Error al registrar administrador");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-xl">
        <h1 className="text-xl font-semibold text-white mb-4 text-center">
          Registrar Administrador
        </h1>

        <p className="text-xs text-neutral-400 mb-4 text-center">
          Esta pantalla es para crear el usuario admin (uso de desarrollo).
        </p>

        {error && (
          <div className="mb-3 rounded-lg border border-red-500/60 bg-red-900/40 px-3 py-2 text-sm text-red-100">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-3 rounded-lg border border-emerald-500/60 bg-emerald-900/40 px-3 py-2 text-sm text-emerald-100">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm">
            <span className="text-neutral-300">Nombre completo</span>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-700 px-3 py-2 text-sm text-white outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
            />
          </label>

          <label className="block text-sm">
            <span className="text-neutral-300">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-700 px-3 py-2 text-sm text-white outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
            />
          </label>

          <label className="block text-sm">
            <span className="text-neutral-300">Contraseña</span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
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
            {submitting ? "Creando administrador..." : "Crear administrador"}
          </button>
        </form>
      </div>
    </div>
  );
}
