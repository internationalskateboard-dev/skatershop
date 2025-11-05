// components/admin/AdminSalesList.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { downloadSalesCsv } from "@/lib/admin/exportCsv";
import type { SaleRecord } from "@/lib/types";

type AdminSalesListProps = {
  /**
   * Fuente de datos que quiere el admin.
   * - "api"   → fuerza leer de la API (si falla, el servidor ya hará fallback)
   * - "local" → fuerza leer de la fuente local (memoria + seeds)
   * - "auto" o undefined → se comporta como ahora: /api/sales y que el backend resuelva
   */
  source?: "api" | "local" | "auto";
};

export default function AdminSalesList({ source = "auto" }: AdminSalesListProps) {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [productFilter, setProductFilter] = useState("");

  const loadSales = useCallback(
    async (currentSource: "api" | "local" | "auto") => {
      setLoading(true);
      try {
        // 👇 aquí es donde vinculamos el selector de settings con la API
        const qs =
          currentSource === "auto"
            ? ""
            : currentSource === "api"
            ? "?source=api"
            : "?source=local";

        const res = await fetch(`/api/sales${qs}`);
        if (!res.ok) throw new Error("No se pudo cargar /api/sales");
        const data = (await res.json()) as { sales: SaleRecord[] } | SaleRecord[];
        // soportar tanto { sales: [] } como [] a pelo
        const list = Array.isArray(data) ? data : data.sales;
        setSales(list || []);
      } catch (err: any) {
        console.warn("[AdminSalesList] no se pudo leer /api/sales", err);
        setSales([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // recarga cuando cambia la fuente
  useEffect(() => {
    void loadSales(source);
  }, [loadSales, source]);

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      if (dateFrom) {
        const dFrom = new Date(dateFrom);
        const dCreated = new Date(s.createdAt);
        if (dCreated < dFrom) return false;
      }
      if (dateTo) {
        const dTo = new Date(dateTo);
        const dCreated = new Date(s.createdAt);
        dTo.setHours(23, 59, 59, 999);
        if (dCreated > dTo) return false;
      }
      if (productFilter.trim()) {
        const pf = productFilter.trim().toLowerCase();
        const hasProduct = (s.items || []).some((it) =>
          (it.productId || "").toLowerCase().includes(pf)
        );
        if (!hasProduct) return false;
      }
      return true;
    });
  }, [sales, dateFrom, dateTo, productFilter]);

  function handleExportCsv() {
    downloadSalesCsv(filteredSales, "ventas-filtradas.csv");
  }

  async function handleDelete(id: string) {
    const ok = confirm("¿Borrar esta venta?");
    if (!ok) return;
    try {
      const res = await fetch(`/api/sales/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSales((prev) => prev.filter((s) => s.id !== id));
      } else {
        alert("No se pudo borrar");
      }
    } catch (err) {
      alert("No se pudo borrar");
    }
  }

  return (
    <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Ventas</h2>
          <p className="text-xs text-neutral-400">
            Filtra por fecha o por producto y exporta solo lo que ves.
          </p>
        </div>
        <button
          onClick={handleExportCsv}
          className="bg-yellow-400 text-black text-xs font-bold px-4 py-2 rounded-lg hover:bg-yellow-300 transition"
        >
          Exportar CSV (filtrado)
        </button>
      </div>

      {/* filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className="text-[11px] text-neutral-400 block mb-1">Desde</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-700 rounded-md px-3 py-2 text-sm text-white outline-none focus:border-yellow-400"
          />
        </div>
        <div>
          <label className="text-[11px] text-neutral-400 block mb-1">Hasta</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-700 rounded-md px-3 py-2 text-sm text-white outline-none focus:border-yellow-400"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-[11px] text-neutral-400 block mb-1">
            Producto (ID contiene)
          </label>
          <input
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            placeholder="deck, hoodie, wheels..."
            className="w-full bg-neutral-950 border border-neutral-700 rounded-md px-3 py-2 text-sm text-white outline-none focus:border-yellow-400"
          />
        </div>
      </div>

      {/* tabla */}
      <div className="rounded-lg border border-neutral-800 overflow-hidden">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-neutral-950/40">
            <tr>
              <th className="text-left px-3 py-2 text-xs text-neutral-400">ID</th>
              <th className="text-left px-3 py-2 text-xs text-neutral-400">Fecha</th>
              <th className="text-left px-3 py-2 text-xs text-neutral-400">Items</th>
              <th className="text-left px-3 py-2 text-xs text-neutral-400">Cliente</th>
              <th className="text-left px-3 py-2 text-xs text-neutral-400">Total</th>
              <th className="text-right px-3 py-2 text-xs text-neutral-400">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-6 text-center text-neutral-500 text-sm"
                >
                  Cargando ventas…
                </td>
              </tr>
            ) : filteredSales.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-6 text-center text-neutral-500 text-sm"
                >
                  No hay ventas que coincidan con el filtro.
                </td>
              </tr>
            ) : (
              filteredSales.map((s) => (
                <tr key={s.id} className="border-t border-neutral-800">
                  <td className="px-3 py-2 text-xs font-mono text-neutral-200">{s.id}</td>
                  <td className="px-3 py-2 text-neutral-200 text-xs">
                    {new Date(s.createdAt).toLocaleString("es-ES", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="px-3 py-2 text-neutral-200 text-xs">
                    <ul className="space-y-0.5">
                      {s.items?.map((it, idx) => (
                        <li key={idx}>
                          <span className="font-mono">{it.productId}</span> ×{it.qty}{" "}
                          {it.size ? `(${it.size})` : ""}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-3 py-2 text-neutral-200 text-xs">
                    {s.customer?.fullName ? (
                      <>
                        <div>{s.customer.fullName}</div>
                        {s.customer.email ? (
                          <div className="text-[10px] text-neutral-500">
                            {s.customer.email}
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <span className="text-[10px] text-neutral-500">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-neutral-100 text-sm font-semibold">
                    € {Number(s.total ?? 0).toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="text-[11px] text-red-300 hover:text-red-200"
                    >
                      Borrar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
