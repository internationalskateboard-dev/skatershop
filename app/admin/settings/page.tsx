// app/admin/settings/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAdminDataSource } from "@/components/admin/AdminDataSourceContext";

export default function AdminSettingsPage() {
  const { source, setSource, lastError } = useAdminDataSource();
  const [adminKey, setAdminKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const k = typeof window !== "undefined" ? localStorage.getItem("skatershop-admin-key") : "";
    if (k) setAdminKey(k);
  }, []);

  function handleSave() {
    if (typeof window !== "undefined") {
      localStorage.setItem("skatershop-admin-key", adminKey || "");
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ajustes del panel</h1>
        <p className="text-sm text-muted-foreground">
          Controla desde aquí la fuente de datos y la clave de acceso del admin.
        </p>
      </div>

      {/* Fuente de datos */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <h2 className="text-lg font-semibold">Fuente de datos</h2>
        <p className="text-sm text-muted-foreground">
          El panel intenta usar la API primero y, si falla, cae a local (Zustand). Aquí puedes forzar el modo.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setSource("api")}
            className={`px-3 py-2 rounded-md text-sm border ${
              source === "api" ? "bg-primary text-primary-foreground" : "bg-background"
            }`}
          >
            Forzar API
          </button>
          <button
            onClick={() => setSource("local")}
            className={`px-3 py-2 rounded-md text-sm border ${
              source === "local" ? "bg-primary text-primary-foreground" : "bg-background"
            }`}
          >
            Forzar Local
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Modo actual: <span className="font-mono">{source.toUpperCase()}</span>
        </p>
        {lastError ? (
          <p className="text-xs text-red-500">
            Último error de API: <span className="font-mono">{lastError}</span>
          </p>
        ) : null}
      </div>

      {/* Clave de admin */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <h2 className="text-lg font-semibold">Clave de administrador</h2>
        <p className="text-sm text-muted-foreground">
          Esta clave se guarda solo en tu navegador. Úsala para validar el login simple del panel.
        </p>
        <input
          value={adminKey}
          onChange={(e) => setAdminKey(e.target.value)}
          placeholder="p.ej. skateradmin"
          className="w-full rounded-md border px-3 py-2 text-sm bg-background"
        />
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm"
        >
          Guardar cambios
        </button>
        {saved ? <p className="text-xs text-green-500">Guardado ✅</p> : null}
      </div>
    </div>
  );
}
