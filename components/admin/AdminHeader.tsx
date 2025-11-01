// components/admin/AdminHeader.tsx
"use client";

import { useAdminDataSource } from "./AdminDataSourceContext";

export default function AdminHeader() {
  const { source, lastError } = useAdminDataSource();

  return (
    <header className="h-16 border-b border-neutral-900 flex items-center justify-between px-4">
      <div>
        <h1 className="text-sm font-semibold tracking-tight">
          Panel de administración
        </h1>
        <p className="text-xs text-neutral-500">
          Gestiona productos, ventas y ajustes.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`text-[11px] rounded-full px-3 py-1 border ${
            source === "api"
              ? "bg-green-500/10 text-green-200 border-green-500/30"
              : "bg-yellow-500/10 text-yellow-200 border-yellow-500/30"
          }`}
        >
          Fuente: {source === "api" ? "API" : "Local (Zustand)"}
        </span>

        {lastError ? (
          <span className="text-[10px] text-red-400">{lastError}</span>
        ) : null}
      </div>
    </header>
  );
}
