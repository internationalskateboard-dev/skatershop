"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminDataSource } from "@/components/admin/AdminDataSourceContext";
import type { ProductsApiResponse, SalesApiResponse } from "@/lib/types";
import AdminExportPanel from "@/components/admin/AdminExportPanel"; // 👈 agregado

export default function AdminHomePage() {
  const { lastError } = useAdminDataSource();
  const [totalProducts, setTotalProducts] = useState<number | null>(null);
  const [totalSales, setTotalSales] = useState<number | null>(null);

  useEffect(() => {
    // productos
    (async () => {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("No se pudo leer /api/products");
        const data = (await res.json()) as ProductsApiResponse;
        setTotalProducts(data.products?.length ?? 0);
      } catch {
        setTotalProducts(0);
      }
    })();

    // ventas
    (async () => {
      try {
        const res = await fetch("/api/sales");
        if (!res.ok) throw new Error("No se pudo leer /api/sales");
        const data = (await res.json()) as SalesApiResponse;
        setTotalSales(data.sales?.length ?? 0);
      } catch {
        setTotalSales(0);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <AdminHeader />

      {/* Cards métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <p className="text-xs text-neutral-400 uppercase tracking-wide">
            Productos
          </p>
          <p className="text-2xl font-bold text-white mt-2">
            {totalProducts === null ? "…" : totalProducts}
          </p>
          <p className="text-[11px] text-neutral-500 mt-1">
            Total de productos disponibles en la fuente actual.
          </p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <p className="text-xs text-neutral-400 uppercase tracking-wide">
            Ventas
          </p>
          <p className="text-2xl font-bold text-white mt-2">
            {totalSales === null ? "…" : totalSales}
          </p>
          <p className="text-[11px] text-neutral-500 mt-1">
            Ventas registradas en /api/sales (incluye pruebas).
          </p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <p className="text-xs text-neutral-400 uppercase tracking-wide">
            Último error de API
          </p>
          <p className="text-[11px] text-neutral-400 mt-2">
            {lastError ? lastError : "Sin errores recientes."}
          </p>
        </div>
      </div>

      {/* 👇 Panel central de exportaciones */}
      <AdminExportPanel />
    </div>
  );
}
  