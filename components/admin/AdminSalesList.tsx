// components/admin/AdminSalesList.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useAdminDataSource } from "./AdminDataSourceContext";
import { downloadCsvFromSales } from "@/lib/exportCsv";

interface SaleRecord {
  id: string;
  createdAt: string;
  items: { productId: string; qty: number; size?: string }[];
  total: number;
  customer?: { fullName?: string; email?: string };
}

export default function AdminSalesList() {
  const { setSource, setLastError } = useAdminDataSource();
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // filtros
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [productFilter, setProductFilter] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/sales");
        if (!res.ok) throw new Error("No se pudo cargar /api/sales");
        const data = await res.json();
        setSales(data || []);
        setSource("api");
        setLastError(null);
      } catch (err: any) {
        console.warn("[AdminSalesList] API falló, usando memoria/local", err);
        setSource("local");
        setLastError(err?.message || "Error al cargar ventas");
        // aquí podrías hacer fetch a /api/sales?local=1 o leer de Zustand si ya lo tienes
        setSales([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [setLastError, setSource]);

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      // fecha
      if (dateFrom) {
        const dFrom = new Date(dateFrom);
        const dCreated = new Date(s.createdAt);
        if (dCreated < dFrom) return false;
      }
      if (dateTo) {
        const dTo = new Date(dateTo);
        const dCreated = new Date(s.createdAt);
        // incluir el día completo
        dTo.setHours(23, 59, 59, 999);
        if (dCreated > dTo) return false;
      }
      // producto
      if (productFilter.trim().length > 0) {
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
    downloadCsvFromSales(filteredSales, "ventas-filtradas.csv");
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
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Ventas</h1>
          <p className="text-sm text-muted-foreground">
            Puedes filtrar por fecha o producto y exportar solo las coincidentes.
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

      {/* listado */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-3 py-2">ID</th>
              <th className="text-left px-3 py-2">Fecha</th>
              <th className="text-left px-3 py-2">Items</th>
              <th className="text-left px-3 py-2">Total</th>
              <th className="text-right px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                  Cargando ventas…
                </td>
              </tr>
            ) : filteredSales.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
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
