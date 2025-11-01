// app/admin/sales/page.tsx
"use client";

import AdminSalesList from "@/components/admin/AdminSalesList";

export default function AdminSalesPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Ventas</h2>
      <p className="text-sm text-neutral-400">
        Aquí ves las ventas que vienen del checkout. Si estás en modo local o la
        API no responde, se cargan desde Zustand.
      </p>
      <AdminSalesList />
    </div>
  );
}
