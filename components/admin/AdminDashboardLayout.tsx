// components/admin/AdminDashboardLayout.tsx
"use client";

import { useEffect, useState } from "react";
import { AdminDataSourceProvider } from "./AdminDataSourceContext";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import {
  SS_ADMIN_AUTH,
  LS_ADMIN_KEY,
  DEFAULT_ADMIN_KEY,
} from "@/lib/admin/constants";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const [isAuthed, setIsAuthed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ok =
      typeof window !== "undefined" ? sessionStorage.getItem(SS_ADMIN_AUTH) : null;
    if (ok === "1") {
      setIsAuthed(true);
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
      typeof window !== "undefined" ? localStorage.getItem(LS_ADMIN_KEY) : null;
    const expected = stored || DEFAULT_ADMIN_KEY;
    if (input === expected) {
      sessionStorage.setItem(SS_ADMIN_AUTH, "1");
      onSuccess();
    } else {
      alert("Clave incorrecta");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      {/* ... igual que antes ... */}
    </div>
  );
}
