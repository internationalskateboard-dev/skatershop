// components/admin/AdminDashboardLayout.tsx
"use client";

import { useEffect, useState } from "react";
import { AdminDataSourceProvider } from "./AdminDataSourceContext";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const [isAuthed, setIsAuthed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1) ¿hay sesión guardada?
    const ok = typeof window !== "undefined" ? sessionStorage.getItem("skatershop-admin-auth") : null;
    if (ok === "1") {
      setIsAuthed(true);
      setLoading(false);
      return;
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="p-6">Cargando panel…</div>;
  }

  if (!isAuthed) {
    return <AdminLogin onSuccess={() => setIsAuthed(true)} />;
  }

  return (
    <AdminDataSourceProvider>
      <div className="flex min-h-screen bg-muted/30">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </AdminDataSourceProvider>
  );
}

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [input, setInput] = useState("");

  function handleLogin() {
    const stored =
      typeof window !== "undefined" ? localStorage.getItem("skatershop-admin-key") : null;
    const expected = stored || "skateradmin";
    if (input === expected) {
      sessionStorage.setItem("skatershop-admin-auth", "1");
      onSuccess();
    } else {
      alert("Clave incorrecta");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 space-y-4">
        <h1 className="text-xl font-bold">Acceso administrador</h1>
        <input
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ingresa la clave"
          className="w-full rounded-md border px-3 py-2 text-sm bg-background"
        />
        <button
          onClick={handleLogin}
          className="w-full py-2 rounded-md bg-primary text-primary-foreground text-sm"
        >
          Entrar
        </button>
        <p className="text-xs text-muted-foreground">
          La clave por defecto es <code>skateradmin</code>, pero puedes cambiarla en <b>Admin → Settings</b>.
        </p>
      </div>
    </div>
  );
}
