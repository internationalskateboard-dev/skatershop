// components/admin/AdminExportPanel.tsx
"use client";

import { useEffect, useState } from "react";
import { downloadProductsCsv } from "@/lib/admin/exportProductsCsv";
import { downloadSalesCsv } from "@/lib/admin/exportCsv";
import type { Product, SaleRecord } from "@/lib/types";

export default function AdminExportPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingSales, setLoadingSales] = useState(true);

  // cargar productos
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("No se pudo leer /api/products");
        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        console.warn("[AdminExportPanel] productos", err);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    })();
  }, []);

  // cargar ventas
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/sales");
        if (!res.ok) throw new Error("No se pudo leer /api/sales");
        const data = await res.json();
        setSales(data.sales || []);
      } catch (err) {
        console.warn("[AdminExportPanel] ventas", err);
        setSales([]);
      } finally {
        setLoadingSales(false);
      }
    })();
  }, []);

  function handleExportProducts() {
    downloadProductsCsv(products, "inventario-completo.csv");
  }

  function handleExportSales() {
    downloadSalesCsv(sales, "ventas-completas.csv");
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-white">Exportaciones rápidas</h2>
        <p className="text-[11px] text-neutral-400">
          Usa los datos actuales de la API/memoria.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={handleExportProducts}
          className="bg-neutral-800 border border-neutral-700 text-xs text-neutral-100 rounded-md px-3 py-2 hover:border-yellow-400 hover:text-yellow-200 transition disabled:opacity-50"
          disabled={loadingProducts}
        >
          {loadingProducts ? "Cargando productos..." : "Exportar productos"}
        </button>
        <button
          onClick={handleExportSales}
          className="bg-neutral-800 border border-neutral-700 text-xs text-neutral-100 rounded-md px-3 py-2 hover:border-yellow-400 hover:text-yellow-200 transition disabled:opacity-50"
          disabled={loadingSales}
        >
          {loadingSales ? "Cargando ventas..." : "Exportar ventas"}
        </button>
      </div>

      <p className="text-[10px] text-neutral-500">
        Productos: {loadingProducts ? "…" : products.length} • Ventas:{" "}
        {loadingSales ? "…" : sales.length}
      </p>
    </div>
  );
}
