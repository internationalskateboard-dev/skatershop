// components/admin/AdminDashboardLayout.tsx
"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

const ADMIN_PASS = "skateradmin";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");

  // leer sesión al montar
  useEffect(() => {
    if (typeof window === "undefined") return;
    const ok = sessionStorage.getItem("skater-admin-ok");
    if (ok === "yes") {
      setAuthed(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pass === ADMIN_PASS) {
      setAuthed(true);
      sessionStorage.setItem("skater-admin-ok", "yes");
    } else {
      alert("Clave incorrecta");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("skater-admin-ok");
    setAuthed(false);
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
        <form
          onSubmit={handleLogin}
          className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 w-full max-w-sm space-y-4"
        >
          <h1 className="text-xl font-bold text-white">Admin / SkaterShop</h1>
          <label className="block text-sm text-neutral-300">
            Clave de administrador
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-700 px-3 py-2 text-white outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-sm"
            />
          </label>
          <button
            type="submit"
            className="w-full bg-yellow-400 text-black font-bold py-2 rounded-lg hover:bg-yellow-300 active:scale-95 transition text-sm"
          >
            Entrar
          </button>
          <p className="text-[11px] text-neutral-500">
            (Se guarda en <code>sessionStorage</code> como antes)
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex">
      {/* Sidebar */}
      <AdminSidebar onLogout={handleLogout} />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-h-screen">
        <AdminHeader />
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
