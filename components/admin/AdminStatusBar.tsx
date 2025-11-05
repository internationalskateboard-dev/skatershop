// components/admin/AdminStatusBar.tsx
"use client";

import { useAdminDataSource } from "@/components/admin/AdminDataSourceContext";

export default function AdminStatusBar() {
  const { source, mode, lastError } = useAdminDataSource();

  return (
    <div className="w-full mb-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 flex items-center gap-2 text-[11px] text-neutral-200">
        <span className="px-2 py-1 rounded bg-neutral-800 border border-neutral-700 uppercase tracking-wide">
          modo: {mode}
        </span>
        <span
          className={`px-2 py-1 rounded border uppercase tracking-wide ${
            source === "api"
              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-100"
              : "bg-sky-500/10 border-sky-500/40 text-sky-100"
          }`}
        >
          fuente: {source}
        </span>
        {lastError ? (
          <span className="ml-auto text-[10px] text-red-200 truncate w-full sm:w-auto text-right">
            Último error API: {lastError}
          </span>
        ) : (
          <span className="ml-auto text-[10px] text-neutral-500 w-full sm:w-auto text-right">API OK</span>
        )}
      </div>
    </div>
  );
}