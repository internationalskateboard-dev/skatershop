// app/admin/settings/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAdminDataSource } from "@/components/admin/AdminDataSourceContext";
import { LS_ADMIN_KEY, DEFAULT_ADMIN_KEY } from "@/lib/admin/constants";
import useProductStore from "@/store/productStore";
import type { Product, ProductsApiResponse } from "@/lib/types";

type AdminSourceInfo = {
  productsUrl: string | null;
  salesUrl: string | null;
  salesPostUrl: string | null;
};

export default function AdminSettingsPage() {
  const { source, setSource, mode, setMode, lastError } = useAdminDataSource();
  const { addProduct, updateProduct } = useProductStore();

  const [adminKey, setAdminKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);
  const [remoteInfo, setRemoteInfo] = useState<AdminSourceInfo | null>(null);

  // cargar clave actual
  useEffect(() => {
    const k =
      typeof window !== "undefined"
        ? window.localStorage.getItem(LS_ADMIN_KEY)
        : "";
    setAdminKey(k || DEFAULT_ADMIN_KEY);
  }, []);

  // leer qué backend externo está configurado en el server (SKATERSHOP_* env)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/source");
        if (res.ok) {
          const data = (await res.json()) as AdminSourceInfo;
          setRemoteInfo(data);
        }
      } catch (err) {
        console.warn("[AdminSettings] no se pudo leer /api/admin/source", err);
      }
    })();
  }, []);

  function handleSaveKey() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LS_ADMIN_KEY, adminKey || DEFAULT_ADMIN_KEY);
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

  // Etiqueta legible para la fuente actual
  const sourceLabel =
    mode === "auto"
      ? source === "local"
        ? "Automático (BD caída → Local)"
        : "Automático (BD / Prisma)"
      : source === "api"
      ? "API externa"
      : source === "local"
      ? "Local (Zustand)"
      : "BD (Prisma/Postgres)";

  // Descripciones del backend ACTIVO según la fuente
  const activeProductsBackend =
    mode === "auto"
      ? source === "local"
        ? "Local (Zustand / memoria) — lectura desde store local"
        : "BD (Prisma/Postgres) — /api/products (GET, POST, DELETE)"
      : source === "db"
      ? "BD (Prisma/Postgres) — /api/products (GET, POST, DELETE)"
      : source === "api"
      ? remoteInfo?.productsUrl
        ? `API externa — ${remoteInfo.productsUrl}`
        : "API externa — no configurada (productsUrl vacío)"
      : "Local (Zustand / memoria) — lectura desde store local";

  const activeSalesBackendGet =
    mode === "auto"
      ? source === "local"
        ? "Local (Zustand / memoria) — resumen de ventas local"
        : "BD (Prisma/Postgres) — /api/sales (GET, opcionalmente /api/sales/[id])"
      : source === "db"
      ? "BD (Prisma/Postgres) — /api/sales (GET, opcionalmente /api/sales/[id])"
      : source === "api"
      ? remoteInfo?.salesUrl
        ? `API externa — ${remoteInfo.salesUrl}`
        : "API externa — no configurada (salesUrl vacío)"
      : "Local (Zustand / memoria) — resumen de ventas local";

  const activeSalesBackendPost =
    mode === "auto"
      ? source === "local"
        ? "Local (Zustand / memoria) — las ventas no se persisten en servidor"
        : "BD (Prisma/Postgres) — /api/sales (POST, crea venta en BD)"
      : source === "db"
      ? "BD (Prisma/Postgres) — /api/sales (POST, crea venta en BD)"
      : source === "api"
      ? remoteInfo?.salesPostUrl
        ? `API externa — ${remoteInfo.salesPostUrl}`
        : remoteInfo?.salesUrl
        ? `API externa — ${remoteInfo.salesUrl} (POST)`
        : "API externa — no configurada (salesPostUrl vacío)"
      : "Local (Zustand / memoria) — las ventas no se persisten en servidor";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Ajustes del panel</h1>
        <p className="text-sm text-neutral-400">
          Controla la fuente de datos, el modo de trabajo y la clave del
          administrador.
        </p>
      </div>

      {/* Modo de datos */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
        <h2 className="text-lg font-semibold text-white">Modo de datos</h2>
        <p className="text-sm text-neutral-400">
          En <b>automático</b> el panel intenta usar la{" "}
          <b>BD (Prisma/Postgres)</b> vía <code>/api/products</code> y{" "}
          <code>/api/sales</code>. Si falla, cambia a datos locales (Zustand).
          En <b>forzado</b> usará siempre la fuente que elijas abajo.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setMode("auto");
              // 🔥 al volver a automático, retomamos BD como fuente base
              setSource("db");
            }}
            className={`px-3 py-2 rounded-md text-sm border ${
              mode === "auto"
                ? "bg-yellow-400 text-black border-yellow-400"
                : "bg-neutral-950 border-neutral-700 text-neutral-200"
            }`}
          >
            Automático
          </button>
          <button
            onClick={() => setMode("force")}
            className={`px-3 py-2 rounded-md text-sm border ${
              mode === "force"
                ? "bg-yellow-400 text-black border-yellow-400"
                : "bg-neutral-950 border-neutral-700 text-neutral-200"
            }`}
          >
            Forzado
          </button>
        </div>
        <p className="text-xs text-neutral-500">Modo actual: {mode}</p>
      </div>

      {/* Fuente de datos */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
        <h2 className="text-lg font-semibold text-white">Fuente de datos</h2>
        <p className="text-sm text-neutral-400">
          Solo puedes cambiar la fuente cuando el modo es forzado.
        </p>
        <div className="flex gap-3 flex-wrap">
          {/* BD / Prisma */}
          <button
            onClick={() => setSource("db")}
            disabled={mode !== "force"}
            className={`px-3 py-2 rounded-md text-sm border ${
              source === "db"
                ? "bg-emerald-500 text-black border-emerald-500"
                : "bg-neutral-950 border-neutral-700 text-neutral-200"
            } ${mode !== "force" ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            BD (Prisma/Postgres)
          </button>

          {/* API externa */}
          <button
            onClick={() => setSource("api")}
            disabled={mode !== "force"}
            className={`px-3 py-2 rounded-md text-sm border ${
              source === "api"
                ? "bg-emerald-500 text-black border-emerald-500"
                : "bg-neutral-950 border-neutral-700 text-neutral-200"
            } ${mode !== "force" ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            API
          </button>

          {/* Local / Zustand */}
          <button
            onClick={() => setSource("local")}
            disabled={mode !== "force"}
            className={`px-3 py-2 rounded-md text-sm border ${
              source === "local"
                ? "bg-emerald-500 text-black border-emerald-500"
                : "bg-neutral-950 border-neutral-700 text-neutral-200"
            } ${mode !== "force" ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Local (Zustand)
          </button>
        </div>

        <p className="text-xs text-neutral-500">Fuente actual: {sourceLabel}</p>

        {lastError ? (
          <p className="text-xs text-red-400 mt-1">
            Último error de API:{" "}
            <span className="font-mono break-all">{lastError}</span>
          </p>
        ) : null}

        {/* Backend ACTIVO según la fuente */}
        <div className="mt-4 border-t border-neutral-800 pt-3 space-y-1">
          <p className="text-[11px] text-neutral-400">
            <span className="font-semibold text-neutral-200">
              Backend productos (activo):
            </span>{" "}
            <span className="break-all">{activeProductsBackend}</span>
          </p>
          <p className="text-[11px] text-neutral-400">
            <span className="font-semibold text-neutral-200">
              Backend ventas (GET, activo):
            </span>{" "}
            <span className="break-all">{activeSalesBackendGet}</span>
          </p>
          <p className="text-[11px] text-neutral-400">
            <span className="font-semibold text-neutral-200">
              Backend ventas (POST, activo):
            </span>{" "}
            <span className="break-all">{activeSalesBackendPost}</span>
          </p>
        </div>

        {/* Configuración de API externa (informativo) */}
        {remoteInfo ? (
          <div className="mt-3 border-t border-neutral-800 pt-3 space-y-1">
            <p className="text-[11px] text-neutral-500 font-semibold">
              Configuración de API externa (SKATERSHOP_*):
            </p>
            <p className="text-[11px] text-neutral-400">
              Backend productos (API externa):{" "}
              {remoteInfo.productsUrl ? (
                <span className="text-neutral-200 break-all">
                  {remoteInfo.productsUrl}
                </span>
              ) : (
                <span className="text-neutral-600">no configurado</span>
              )}
            </p>
            <p className="text-[11px] text-neutral-400">
              Backend ventas GET (API externa):{" "}
              {remoteInfo.salesUrl ? (
                <span className="text-neutral-200 break-all">
                  {remoteInfo.salesUrl}
                </span>
              ) : (
                <span className="text-neutral-600">no configurado</span>
              )}
            </p>
            <p className="text-[11px] text-neutral-400">
              Backend ventas POST (API externa):{" "}
              {remoteInfo.salesPostUrl ? (
                <span className="text-neutral-200 break-all">
                  {remoteInfo.salesPostUrl}
                </span>
              ) : remoteInfo.salesUrl ? (
                <span className="text-neutral-200 break-all">
                  {remoteInfo.salesUrl}
                </span>
              ) : (
                <span className="text-neutral-600">no configurado</span>
              )}
            </p>
          </div>
        ) : null}
      </div>

      {/* Clave de admin */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
        <h2 className="text-lg font-semibold text-white">
          Clave de administrador
        </h2>
        <p className="text-sm text-neutral-400">
          Esta clave se guarda en este navegador y la usa el login del admin.
        </p>
        <input
          value={adminKey}
          onChange={(e) => setAdminKey(e.target.value)}
          className="w-full bg-neutral-950 border border-neutral-700 rounded-md px-3 py-2 text-sm text-white outline-none focus:border-yellow-400"
        />
        <button
          onClick={handleSaveKey}
          className="px-4 py-2 rounded-md bg-yellow-400 text-black text-sm font-semibold"
        >
          Guardar
        </button>
        {saved ? <p className="text-xs text-green-400">Guardado ✅</p> : null}
      </div>

      {/* Cargar productos */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
        <h2 className="text-lg font-semibold text-white">Datos de ejemplo</h2>
        <p className="text-sm text-neutral-400">
          Carga en tu store local los productos que haya ahora mismo en
          /api/products.
        </p>
        <button
          onClick={handleSeedProducts}
          className="px-4 py-2 rounded-md bg-neutral-800 text-sm hover:bg-neutral-700 transition"
        >
          Cargar productos desde /api/products
        </button>
        {seedMsg ? (
          <p className="text-xs text-neutral-400 mt-2">{seedMsg}</p>
        ) : null}
      </div>
    </div>
  );
}
