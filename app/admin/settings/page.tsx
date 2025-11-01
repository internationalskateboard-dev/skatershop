"use client";

<<<<<<< HEAD
import { useEffect, useState } from "react";
import { useAdminDataSource } from "@/components/admin/AdminDataSourceContext";
import {
  LS_ADMIN_KEY,
  DEFAULT_ADMIN_KEY,
} from "@/lib/admin/constants";
import useProductStore from "@/store/productStore";
import type { Product } from "@/lib/admin/types";

export default function AdminSettingsPage() {
  const { source, setSource, mode, setMode, lastError } = useAdminDataSource();
  const { addProduct, updateProduct } = useProductStore();
  const [adminKey, setAdminKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);

  useEffect(() => {
    const k = typeof window !== "undefined" ? localStorage.getItem(LS_ADMIN_KEY) : "";
    setAdminKey(k || DEFAULT_ADMIN_KEY);
  }, []);

  function handleSave() {
    if (typeof window !== "undefined") {
      localStorage.setItem(LS_ADMIN_KEY, adminKey || DEFAULT_ADMIN_KEY);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleSeedProducts() {
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("No se pudo leer /api/products");
      const data = (await res.json()) as { products: Product[] };
      const list = data.products || [];
      list.forEach((p) => updateProduct(p.id, p));
      list.forEach((p) => addProduct(p));
      setSeedMsg(`Se cargaron ${list.length} productos desde la API ✅`);
    } catch (err) {
      setSeedMsg("No se pudieron cargar productos desde la API ❌");
    } finally {
      setTimeout(() => setSeedMsg(null), 3000);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ajustes del panel</h1>
        <p className="text-sm text-muted-foreground">
          Control de fuente de datos, modo de trabajo y datos de ejemplo.
        </p>
      </div>

      {/* Modo */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <h2 className="text-lg font-semibold">Modo de datos</h2>
        <p className="text-sm text-muted-foreground">
          En automático, el panel intenta API y cae a local. En forzado, se queda en la fuente que elijas.
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
        <p className="text-xs text-muted-foreground">Modo actual: {mode}</p>
      </div>

      {/* Fuente */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <h2 className="text-lg font-semibold">Fuente de datos</h2>
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
          Fuente actual: <code>{source}</code>
        </p>
        {lastError ? (
          <p className="text-xs text-red-500">
            Último error de API: <span className="font-mono">{lastError}</span>
          </p>
        ) : null}
      </div>

      {/* Clave */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <h2 className="text-lg font-semibold">Clave de administrador</h2>
        <input
          value={adminKey}
          onChange={(e) => setAdminKey(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm bg-background"
        />
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm"
        >
          Guardar
        </button>
        {saved ? <p className="text-xs text-green-500">Guardado ✅</p> : null}
=======
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
>>>>>>> parent of c0d8510 (Con esto el flujo queda así:)
      </div>

      {/* Pre-cargar productos */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <h2 className="text-lg font-semibold">Datos de ejemplo</h2>
        <p className="text-sm text-muted-foreground">
          Trae los productos que estén en la API/memoria y los mete en tu store local.
        </p>
        <button
          onClick={handleSeedProducts}
          className="px-4 py-2 rounded-md bg-muted text-sm hover:bg-muted/70 transition"
        >
          Cargar productos desde /api/products
        </button>
        {seedMsg ? <p className="text-xs text-muted-foreground">{seedMsg}</p> : null}
      </div>
    </div>
  );
}
