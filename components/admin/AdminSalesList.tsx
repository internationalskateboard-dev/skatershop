// components/admin/AdminSalesList.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdminDataSource } from "@/components/admin/AdminDataSourceContext";
import { downloadSalesCsv } from "@/lib/admin/exportCsv";
import type { SaleRecord } from "@/lib/admin/types";

export default function AdminSalesList() {
  const { reportApiSuccess, reportApiError } = useAdminDataSource();
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // filtros
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [productFilter, setProductFilter] = useState("");

  const loadSales = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sales");
      if (!res.ok) throw new Error("No se pudo cargar /api/sales");
      const data = (await res.json()) as SaleRecord[];
      setSales(data || []);
      reportApiSuccess();
    } catch (err: any) {
      console.warn("[AdminSalesList] API falló, usando memoria/local", err);
      reportApiError(err?.message || "Error al cargar ventas");
      // fallback local si tienes un store, aquí dejamos array vacío
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, [reportApiError, reportApiSuccess]);

  useEffect(() => {
    void loadSales();
  }, [loadSales]);

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      // fecha desde
      if (dateFrom) {
        const dFrom = new Date(dateFrom);
        const dCreated = new Date(s.createdAt);
        if (dCreated < dFrom) return false;
      }
      // fecha hasta (incluimos el día completo)
      if (dateTo) {
        const dTo = new Date(dateTo);
        const dCreated = new Date(s.createdAt);
        dTo.setHours(23, 59, 59, 999);
        if (dCreated > dTo) return false;
      }
      // filtro por producto (productId contiene)
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
    const ok = confirm("¿Borrar esta venta de prueba?");
    if (!ok) return;
    const res = await fetch(`/api/sales/${id}`, { method: "DELETE" });
    if (res.ok) {
      setSales((prev) => prev.filter((s) => s.id !== id));
    } else {
      alert("No se pudo borrar");
    }
  }

  return (
    <div className="space-y-4">
      {/* header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Ventas</h1>
          <p className="text-sm text-muted-foreground">
            Filtra por fecha o por producto y exporta solo lo que ves.
          </p>
        </div>
        <button
          onClick={handleExportCsv}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm"
        >
          Exportar CSV (filtrado)
        </button>
      </div>

      {/* filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-card border rounded-xl p-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Desde</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-md border px-3 py-2 text-sm bg-background"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Hasta</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-md border px-3 py-2 text-sm bg-background"
          />
        </div>
        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-xs text-muted-foreground">Producto (ID contiene)</label>
          <input
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            placeholder="p.ej. deck-01"
            className="rounded-md border px-3 py-2 text-sm bg-background"
          />
        </div>
      </div>

      {/* tabla */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-3 py-2">ID</th>
              <th className="text-left px-3 py-2">Fecha</th>
              <th className="text-left px-3 py-2">Items</th>
              <th className="text-left px-3 py-2">Cliente</th>
              <th className="text-left px-3 py-2">Total</th>
              <th className="text-right px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                  Cargando ventas…
                </td>
              </tr>
            ) : filteredSales.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                  No hay ventas que coincidan con el filtro.
                </td>
              </tr>
            ) : (
              filteredSales.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="px-3 py-2 font-mono text-xs">{s.id}</td>
                  <td className="px-3 py-2">
                    {new Date(s.createdAt).toLocaleString("es-ES", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="px-3 py-2">
                    <ul className="space-y-0.5">
                      {s.items?.map((it, idx) => (
                        <li key={idx}>
                          <span className="font-mono">{it.productId}</span> ×{it.qty}{" "}
                          {it.size ? `(${it.size})` : ""}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-3 py-2">
                    {s.customer?.fullName ? (
                      <>
                        <div>{s.customer.fullName}</div>
                        {s.customer.email ? (
                          <div className="text-xs text-muted-foreground">
                            {s.customer.email}
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 font-semibold">€ {s.total.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="text-xs text-red-500 hover:underline"
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
    </div>
  );
}
