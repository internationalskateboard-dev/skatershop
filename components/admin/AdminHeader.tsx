// components/admin/AdminHeader.tsx
"use client";

import { useAdminDataSource } from "@/components/admin/AdminDataSourceContext";
import Link from "next/link";

export default function AdminHeader() {
  const { source, mode, lastError } = useAdminDataSource();

  return (
    <header className="w-full flex items-center justify-between mb-6">
      <div>
        <h1 className="text-lg font-semibold text-white">Panel de administración</h1>
        <p className="text-xs text-neutral-500">
          Gestiona productos, ventas y configuración.
        </p>
      </div>

      <div className="flex items-center gap-2">
        {/* estado de modo */}
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide border
          ${
            mode === "auto"
              ? "bg-neutral-900 border-neutral-700 text-neutral-200"
              : "bg-amber-400/10 border-amber-400/50 text-amber-100"
          }`}
        >
          modo: {mode}
        </span>

        {/* fuente actual */}
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide border
          ${
            source === "api"
              ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-100"
              : "bg-sky-500/10 border-sky-500/50 text-sky-100"
          }`}
        >
          fuente: {source}
        </span>

        {lastError ? (
          <span className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide border border-red-500/60 bg-red-500/10 text-red-100 max-w-[180px] truncate">
            API error
          </span>
        ) : null}

        <Link
          href="/admin/settings"
          className="px-3 py-1 rounded-md bg-neutral-800 border border-neutral-700 text-xs text-neutral-100 hover:border-yellow-400 hover:text-yellow-200 transition"
        >
          Ajustes
        </Link>
      </div>
    </header>
  );
}
