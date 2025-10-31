"use client";

import { useEffect, useState } from "react";
import useSalesStore from "@/store/salesStore";
import type { SaleRecord } from "@/lib/types";

export default function AdminSalesList() {
  const localSales = useSalesStore((s) => s.sales);
  const setLocalSales = useSalesStore((s) => s); // para usar luego s.sales
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [source, setSource] = useState<"api" | "local">("local");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // cargar ventas
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/sales", { method: "GET" });
        if (!res.ok) throw new Error("No se pudo obtener ventas");
        const data = await res.json();
        const fromApi = Array.isArray(data.sales) ? data.sales : [];
        if (!cancelled) {
          setSales(fromApi);
          setSource("api");
        }
      } catch (err) {
        console.warn("[AdminSalesList] usando ventas locales:", err);
        if (!cancelled) {
          setSales(localSales);
          setSource("local");
          setError("No se pudo leer desde la API, mostrando ventas locales.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [localSales]);

  async function handleDeleteSale(sale: SaleRecord) {
    const ok = window.confirm(
      `¿Borrar la venta ${sale.id}? Esto es solo para limpiar pruebas.`
    );
    if (!ok) return;

    // 1) intentar borrar en API
    try {
      const res = await fetch(`/api/sales/${sale.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("DELETE /api/sales/:id falló");
      }
      // si se borró en API, quitamos de la lista
      setSales((prev) => prev.filter((s) => s.id !== sale.id));
    } catch (err) {
      console.warn("[AdminSalesList] no se pudo borrar en API, borrando local", err);
      // 2) fallback: borrar solo local
      // como el store no tiene removeSale, lo hacemos manual con set
      useSalesStore.setState((state) => ({
        sales: state.sales.filter((s) => s.id !== sale.id),
      }));
      setSales((prev) => prev.filter((s) => s.id !== sale.id));
    }
  }

  return (
    <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-display font-bold">Ventas</h2>
        <p className="text-xs text-neutral-400">
          Fuente:{" "}
          <span
            className={
              source === "api"
                ? "text-green-400 font-semibold"
                : "text-yellow-400 font-semibold"
            }
          >
            {source === "api" ? "API" : "Local (Zustand)"}
          </span>
          {error ? (
            <span className="ml-2 text-[10px] text-red-400">{error}</span>
          ) : null}
        </p>
      </div>

      {sales.length === 0 ? (
        <p className="text-neutral-500 text-sm">
          {loading ? "Cargando ventas..." : "No hay ventas registradas."}
        </p>
      ) : (
        <div className="overflow-x-auto -mx-3 md:mx-0">
          <table className="min-w-full text-sm text-left text-neutral-200">
            <thead>
              <tr className="border-b border-neutral-800 text-xs uppercase text-neutral-500">
                <th className="py-2 px-3">ID</th>
                <th className="py-2 px-3">Fecha</th>
                <th className="py-2 px-3">Cliente</th>
                <th className="py-2 px-3">Items</th>
                <th className="py-2 px-3 text-right">Total</th>
                <th className="py-2 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id} className="border-b border-neutral-800/50">
                  <td className="py-2 px-3 text-xs text-neutral-400">
                    {s.id}
                  </td>
                  <td className="py-2 px-3 text-xs">
                    {new Date(s.createdAt).toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-xs">
                    {s.customer?.fullName || "—"}
                    {s.customer?.email
                      ? ` · ${s.customer.email}`
                      : ""}
                  </td>
                  <td className="py-2 px-3 text-xs">
                    {s.items
                      .map(
                        (it) =>
                          `${it.productId} x${it.qty}${
                            it.size ? ` (${it.size})` : ""
                          }`
                      )
                      .join(", ")}
                  </td>
                  <td className="py-2 px-3 text-right text-yellow-400 font-semibold">
                    €{(s.total ?? 0).toFixed(2)}
                  </td>
                  <td className="py-2 px-3 text-right">
                    <button
                      onClick={() => handleDeleteSale(s)}
                      className="text-[11px] bg-red-500/20 text-red-300 border border-red-500/40 rounded-md px-3 py-1 hover:bg-red-500/30 transition"
                    >
                      Borrar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
