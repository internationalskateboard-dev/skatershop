"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AdminDataSourceProvider,
  useAdminDataSource,
} from "@/components/admin/AdminDataSourceContext";
import AdminStatusBar from "@/components/admin/AdminStatusBar";

function AdminSidebar() {
  const pathname = usePathname();
  const { source, mode } = useAdminDataSource();

  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/products", label: "Productos" },
    { href: "/admin/sales", label: "Ventas" },
    { href: "/admin/settings", label: "Settings" },
  ];

  return (
    <aside className="w-56 bg-neutral-950 border-r border-neutral-900 flex flex-col">
      <div className="px-4 py-4 border-b border-neutral-900">
        <p className="text-sm font-bold text-white">SkaterShop Admin</p>
        <p className="text-[10px] text-neutral-500 mt-1">
          fuente: <span className="font-mono">{source}</span> • modo:{" "}
          <span className="font-mono">{mode}</span>
        </p>
      </div>
      <nav className="flex-1 py-4">
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`block px-4 py-2 text-sm rounded-r-full mr-2 ${
                active
                  ? "bg-neutral-800 text-white"
                  : "text-neutral-300 hover:bg-neutral-900"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-3 text-[10px] text-neutral-600 border-t border-neutral-900">
        v0.1 admin dashboard
      </div>
    </aside>
  );
}

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminDataSourceProvider>
      <div className="min-h-screen bg-neutral-950 text-white flex">
        <AdminSidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          <AdminStatusBar />
          {children}
        </main>
      </div>
    </AdminDataSourceProvider>
  );
}
