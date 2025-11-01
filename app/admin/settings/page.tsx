"use client";

import { useEffect, useState } from "react";
import { useAdminDataSource } from "@/components/admin/AdminDataSourceContext";
import {
  LS_ADMIN_KEY,
  DEFAULT_ADMIN_KEY,
} from "@/lib/admin/constants";
import useProductStore from "@/store/productStore";
import type { Product, ProductsApiResponse } from "@/lib/types";

export default function AdminSettingsPage() {
  const { source, setSource, mode, setMode, lastError } = useAdminDataSource();
  const { addProduct, updateProduct } = useProductStore();

  const [adminKey, setAdminKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);

  // cargar clave actual
  useEffect(() => {
    const k = typeof window !== "undefined" ? localStorage.getItem(LS_ADMIN_KEY) : "";
    setAdminKey(k || DEFAULT_ADMIN_KEY);
  }, []);

  function handleSaveKey() {
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
      const data = (await res.json()) as ProductsApiResponse;
      const list = data.products || [];

      // los metemos en el store
      list.forEach((p: Product) => updateProduct(p.id, p));
      list.forEach((p: Product) => addProduct(p));

      setSeedMsg(`Se cargaron ${list.length} productos desde la API ✅`);
    } catch (err) {
      console.warn("[AdminSettings] seed products error", err);
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
          Controla el modo de datos, la fuente y la clave del administrador.
        </p>
      </div>

      {/* Modo de datos */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <h2 className="text-lg font-semibold">Modo de datos</h2>
        <p className="text-sm text-muted-foreground">
          En <b>automático</b> el panel intenta usar la API y, si falla, cambia a local.
          En <b>forzado</b> usará siempre la fuente que elijas abajo.
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

      {/* Fuente de datos */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <h2 className="text-lg font-semibold">Fuente de datos</h2>
        <p className="text-sm text-muted-foreground">
          Si el modo es forzado, aquí eliges entre API o Local (Zustand).
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
          Fuente actual: <code>{source}</code>
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
          Esta clave la usa el login del panel y se guarda solo en este navegador.
        </p>
        <input
          value={adminKey}
          onChange={(e) => setAdminKey(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm bg-background"
        />
        <button
          onClick={handleSaveKey}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm"
        >
          Guardar
        </button>
        {saved ? <p className="text-xs text-green-500">Guardado ✅</p> : null}
      </div>

      {/* Precargar productos */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <h2 className="text-lg font-semibold">Datos de ejemplo</h2>
        <p className="text-sm text-muted-foreground">
          Importa los productos que haya en `/api/products` y los guarda en tu store local.
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
