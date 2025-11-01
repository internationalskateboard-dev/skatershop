// app/admin/products/page.tsx
"use client";

import AdminProductForm from "@/components/admin/AdminProductForm";
import AdminProductList from "@/components/admin/AdminProductList";

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Productos</h2>
      {/* Formulario de creación / edición */}
      <AdminProductForm />
      {/* Lista de productos */}
      <AdminProductList />
    </div>
  );
}
