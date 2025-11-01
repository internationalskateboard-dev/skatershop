// app/admin/settings/page.tsx
"use client";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Ajustes</h2>
      <p className="text-sm text-neutral-400">
        Aquí iremos poniendo opciones de configuración del panel, claves,
        fuentes de datos y logs.
      </p>
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-sm text-neutral-300">
        <p>· Cambiar clave de admin (futuro)</p>
        <p>· Elegir fuente: API / Local / Mi API (futuro)</p>
        <p>· Logs de sincronización (futuro)</p>
      </div>
    </div>
  );
}
