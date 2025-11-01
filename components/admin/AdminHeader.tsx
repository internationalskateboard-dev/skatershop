// components/admin/AdminHeader.tsx
"use client";

import { useAdminDataSource } from "./AdminDataSourceContext";

export default function AdminHeader() {
  const { source, mode, lastError } = useAdminDataSource();
  return (
    <header className="h-14 border-b bg-background flex items-center justify-between px-6">
      <div>
        <h1 className="text-sm font-semibold">Panel de administración</h1>
        <p className="text-xs text-muted-foreground">
          SKATERSHOP — Admin
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`text-xs px-2 py-1 rounded-md border ${
            source === "api" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
          }`}
        >
          Fuente: {source.toUpperCase()}
        </span>
        <span className="text-[10px] text-muted-foreground">
          modo: <b>{mode}</b>
        </span>
        {lastError ? (
          <span className="text-[10px] text-red-500 max-w-[220px] truncate" title={lastError}>
            {lastError}
          </span>
        ) : null}
      </div>
    </header>
  );
}
