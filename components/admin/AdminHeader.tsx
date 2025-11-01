// components/admin/AdminHeader.tsx
"use client";

export default function AdminHeader() {
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
        {/* badge de fuente futura */}
        <span className="text-[11px] bg-green-500/10 text-green-200 border border-green-500/30 rounded-full px-3 py-1">
          Fuente: auto
        </span>
      </div>
    </header>
  );
}
