// app/admin/sales/page.tsx
"use client";

import AdminSalesList from "@/components/admin/AdminSalesList";
import { useAdminDataSource } from "@/components/admin/AdminDataSourceContext";

export default function AdminSalesPage() {
  const { source, mode } = useAdminDataSource();

  // decidimos qué pasarle al listado
  // - si está en AUTO → dejamos "auto"
  // - si está en FORCE → usamos el source real
  const effectiveSource =
    mode === "force" ? (source === "api" ? "api" : "local") : "auto";

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Ventas</h2>
      <p className="text-sm text-neutral-400">
        Aquí ves las ventas que vienen del checkout. Si estás en modo local o la
        API no responde, se cargan desde memoria.
      </p>
      <AdminSalesList source={effectiveSource} />
    </div>
  );
}
