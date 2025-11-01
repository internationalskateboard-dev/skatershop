// app/admin/settings/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAdminDataSource } from "@/components/admin/AdminDataSourceContext";

export default function AdminSettingsPage() {
  const { source, setSource, mode, setMode, lastError } = useAdminDataSource();
  const [adminKey, setAdminKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const k =
      typeof window !== "undefined" ? localStorage.getItem("skatershop-admin-key") : "";
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
          Control de fuente de datos, modo de trabajo y clave de admin.
        </p>
      </div>

      {/* Modo de datos */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <h2 className="text-lg font-semibold">Modo de datos</h2>
        <p className="text-sm text-muted-foreground">
          En <b>automático</b>, el panel intenta usar la API y si falla usa los datos locales. En{" "}
          <b>forzado</b>, siempre usa la fuente que elijas abajo.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setMode("auto")}
            className={`px-3 py-2 rounded-md text-sm border ${
              mode === "auto" ? "bg-primary text-primary-foreground" : "bg-background"
            }`}
          >
            Automático
          </button>
          <button
            onClick={() => setMode("force")}
            className={`px-3 py-2 rounded-md text-sm border ${
              mode === "force" ? "bg-primary text-primary-foreground" : "bg-background"
            }`}
          >
            Forzado
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Modo actual: <code>{mode}</code>
        </p>
      </div>

      {/* Fuente de datos (solo si está forzado) */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <h2 className="text-lg font-semibold">Fuente de datos</h2>
        <p className="text-sm text-muted-foreground">
          {mode === "force"
            ? "Estás en modo forzado: aquí eliges la fuente real del panel."
            : "Estás en modo automático: la fuente puede cambiar según el resultado de las peticiones."}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setSource("api")}
            disabled={mode !== "force"}
            className={`px-3 py-2 rounded-md text-sm border ${
              source === "api" ? "bg-primary text-primary-foreground" : "bg-background"
            } ${mode !== "force" ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            API
          </button>
          <button
            onClick={() => setSource("local")}
            disabled={mode !== "force"}
            className={`px-3 py-2 rounded-md text-sm border ${
              source === "local" ? "bg-primary text-primary-foreground" : "bg-background"
            } ${mode !== "force" ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            Local (Zustand)
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Fuente actual: <span className="font-mono">{source.toUpperCase()}</span>
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
          Se guarda solo en este navegador y la usa la pantalla de login.
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
