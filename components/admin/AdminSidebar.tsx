// components/admin/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminAuth } from "@/lib/admin/useAdminAuth";

const links = [
  { href: "/admin/products", label: "Productos", icon: "🛍️" },
  { href: "/admin/sales", label: "Ventas", icon: "💸" },
  { href: "/admin/settings", label: "Ajustes", icon: "⚙️" },
];

export default function AdminSidebar({
  onLogout,
}: {
  onLogout?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-neutral-950 border-r border-neutral-900 flex flex-col">
      <div className="h-16 flex items-center px-4 border-b border-neutral-900">
        <span className="text-sm font-bold tracking-tight">
          SKATER<span className="text-yellow-400 ml-1">ADMIN</span>
        </span>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                active
                  ? "bg-yellow-400/10 text-yellow-200 border border-yellow-400/30"
                  : "text-neutral-300 hover:bg-neutral-900"
              }`}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-neutral-900">
        <button
          onClick={onLogout}
          className="w-full text-left text-xs text-neutral-400 hover:text-red-300 transition"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
