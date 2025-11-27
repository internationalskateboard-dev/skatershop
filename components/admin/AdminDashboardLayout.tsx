"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AdminDataSourceProvider,
  useAdminDataSource,
} from "@/components/admin/AdminDataSourceContext";
import AdminStatusBar from "@/components/admin/AdminStatusBar";
import { useAdminAuth } from "@/lib/admin/useAdminAuth";

function AdminSidebar({ onLogout }: { onLogout: () => void }) {
  const pathname = usePathname();
  const { source, mode } = useAdminDataSource();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/admin", label: "Dashboard", icon: "🏠" },
    { href: "/admin/products", label: "Productos", icon: "📦" },
    { href: "/admin/sales", label: "Ventas", icon: "📊" },
    { href: "/admin/settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <>
      {/* Header móvil */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-neutral-900 bg-neutral-950 md:hidden">
        <p className="text-sm font-bold text-white">SkaterShop Admin</p>
        <button
          onClick={() => setOpen(!open)}
          className="inline-flex items-center justify-center rounded-md border border-neutral-700 px-2 py-1 text-sm text-neutral-200"
        >
          <span className="text-lg">{open ? "✕" : "☰"}</span>
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 z-40 w-56 bg-neutral-950 border-r border-neutral-900 flex flex-col
          top-16 bottom-0 md:inset-y-0
          transform transition-transform duration-200 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:static md:translate-x-0
        `}
      >
        {/* Header desktop */}
        <div className="px-4 py-4 border-b border-neutral-900 hidden md:block">
          <p className="text-sm font-bold text-white">SkaterShop Admin</p>
          <p className="text-[10px] text-neutral-500 mt-1">
            fuente: <span className="font-mono">{source}</span> • modo:{" "}
            <span className="font-mono">{mode}</span>
          </p>
        </div>

        {/* Navegación */}
        <nav className="flex-1 py-4">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2 px-4 py-2 text-sm rounded-r-full mr-2 transition-colors ${
                  active
                    ? "bg-neutral-800 text-white"
                    : "text-neutral-300 hover:bg-neutral-900"
                }`}
              >
                <span className="text-lg leading-none">{l.icon}</span>
                <span>{l.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Cerrar sesión */}
        <div className="px-4 py-3 border-t border-neutral-900">
          <button
            onClick={onLogout}
            className="w-full text-left text-xs text-neutral-400 hover:text-red-300 transition"
          >
            Cerrar sesión
          </button>
        </div>

        <div className="px-4 py-3 text-[10px] text-neutral-600 border-t border-neutral-900">
          v0.1 admin dashboard
        </div>
      </aside>

      {/* Overlay fondo en móvil */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout } = useAdminAuth();

  return (
    <AdminDataSourceProvider>
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col md:flex-row">
        <AdminSidebar onLogout={logout} />
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <AdminStatusBar />
          {children}
        </main>
      </div>
    </AdminDataSourceProvider>
  );
}
