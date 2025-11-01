// app/admin/sales/page.tsx
"use client";

import AdminSalesList from "@/components/admin/AdminSalesList";

export default function AdminSalesPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Ventas</h2>
      <p className="text-sm text-neutral-400">
        Listado de ventas registradas. Puedes exportar a CSV o borrar ventas de prueba.
      </p>
      <AdminSalesList />
    </div>
  );
}
