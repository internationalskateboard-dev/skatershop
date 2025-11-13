// components/admin/AdminDashboard.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { useAdminDataSource } from "@/components/admin/AdminDataSourceContext";
import type { Product, SaleRecord } from "@/lib/types";
import AdminExportPanel from "./AdminExportPanel";

export default function AdminDashboard() {
  const { source, mode, reportApiError, reportApiSuccess } =
    useAdminDataSource();

  // estado local del dashboard
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // traducimos el contexto a querystring
  const effectiveSource: "api" | "local" | "auto" =
    mode === "force" ? (source === "api" ? "api" : "local") : "auto";

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const qs =
        effectiveSource === "auto"
          ? ""
          : effectiveSource === "api"
          ? "?source=api"
          : "?source=local";

      try {
        const [pRes, sRes] = await Promise.all([
          fetch(`/api/products${qs}`, { cache: "no-store" }),
          fetch(`/api/sales${qs}`, { cache: "no-store" }),
        ]);

        if (!pRes.ok || !sRes.ok) {
          throw new Error("No se pudieron cargar datos del dashboard");
        }

        const pData = (await pRes.json()) as { products: Product[] } | Product[];
        const sData = (await sRes.json()) as { sales: SaleRecord[] } | SaleRecord[];

        const gotProducts = Array.isArray(pData) ? pData : pData.products ?? [];
        const gotSales = Array.isArray(sData) ? sData : sData.sales ?? [];

        if (!cancelled) {
          setProducts(gotProducts);
          setSales(gotSales);
          reportApiSuccess();
        }
      } catch (err: any) {
        const msg = err?.message ?? "Error cargando dashboard";
        if (!cancelled) {
          setProducts([]);
          setSales([]);
          setError(msg);
          reportApiError(msg);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [effectiveSource, reportApiError, reportApiSuccess]);

  // métricas
  const totalProducts = products.length;
  const totalSales = sales.length;
  const totalRevenue = useMemo(
    () => sales.reduce((acc, s) => acc + (s.total ?? 0), 0),
    [sales]
  );

  const sourceLabel =
    effectiveSource === "api"
      ? "API / Remoto"
      : effectiveSource === "local"
      ? "Local (memoria + base)"
      : "Automático";

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
          <p className="text-sm text-neutral-400">
            Resumen general del inventario y las ventas.
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-neutral-500 uppercase tracking-wide">
            Fuente de datos
          </p>
          <p className="text-sm font-semibold text-yellow-400">
            {sourceLabel}
          </p>
        </div>
      </div>

      {/* tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-neutral-900/70 border border-yellow-400 rounded-xl p-4 hover:border-yellow-500">
          <p className="text-xs text-white">Productos</p>
          <p className="text-3xl font-bold text-white mt-1">
            {loading ? "…" : totalProducts}
          </p>
          <p className="text-[11px] text-neutral-500 mt-2">
            Productos cargados desde la fuente actual.
          </p>
        </div>
        <div className="bg-neutral-900/70 border border-yellow-400 rounded-xl p-4 hover:border-yellow-500">
          <p className="text-xs text-white">Ventas</p>
          <p className="text-3xl font-bold text-white mt-1">
            {loading ? "…" : totalSales}
          </p>
          <p className="text-[11px] text-neutral-500 mt-2">
            Ventas cargadas desde la fuente actual.
          </p>
        </div>
        <div className="bg-neutral-900/70 border border-yellow-400 rounded-xl p-4 hover:border-yellow-500">
          <p className="text-xs text-white">Ingresos estimados</p>
          <p className="text-3xl font-bold text-green-500 mt-1">
            {loading ? "…" : `€ ${totalRevenue.toFixed(2)}`}
          </p>
          <p className="text-[11px] text-neutral-500 mt-2">
            Calculado a partir de las ventas actuales.
          </p>
        </div>
      </div>

      {/* errores */}
      {error ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-100">
          ⚠️ {error}
        </div>
      ) : null}

      {/* aquí puedes meter Últimas ventas o Productos sin stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-neutral-900/40 border border-yellow-400 rounded-xl p-4 hover:border-yellow-500">
          <h2 className="text-sm font-semibold text-white mb-3">
            Últimas ventas
          </h2>
          {loading ? (
            <p className="text-xs text-neutral-500">Cargando…</p>
          ) : sales.length === 0 ? (
            <p className="text-xs text-neutral-500">
              No hay ventas para esta fuente.
            </p>
          ) : (
            <ul className="space-y-2">
              {sales.slice(0, 5).map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <p className="text-neutral-200 text-xs font-mono">{s.id}</p>
                    <p className="text-neutral-400 text-[10px]">
                      {new Date(s.createdAt).toLocaleString("es-ES", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <p className="text-neutral-50 text-sm font-semibold">
                    € {Number(s.total ?? 0).toFixed(2)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-neutral-900/40 border border-yellow-400 rounded-xl p-4 hover:border-yellow-500">
          <h2 className="text-sm font-semibold text-white mb-3">
            Productos sin stock
          </h2>
          {loading ? (
            <p className="text-xs text-neutral-500">Cargando…</p>
          ) : products.filter((p) => (p.stock ?? 0) <= 0).length === 0 ? (
            <p className="text-xs text-neutral-500">
              No hay productos sin stock.
            </p>
          ) : (
            <ul className="space-y-2">
              {products
                .filter((p) => (p.stock ?? 0) <= 0)
                .slice(0, 5)
                .map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <p className="text-neutral-200">{p.name ?? p.id}</p>
                    <p className="text-[10px] text-red-300">Sin stock</p>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>

{/* 👇 Panel central de exportaciones */}
      <AdminExportPanel />


    </div>
  );
}
