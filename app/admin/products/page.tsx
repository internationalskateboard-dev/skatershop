// app/admin/products/page.tsx
"use client";

import { useState } from "react";
import AdminProductForm from "@/components/admin/AdminProductForm";
import AdminProductList from "@/components/admin/AdminProductList";
import type { Product } from "@/lib/types";
import { useAdminDataSource } from "@/components/admin/AdminDataSourceContext";

export default function AdminProductsPage() {
  const [editing, setEditing] = useState<Product | null>(null);
  const { source, mode } = useAdminDataSource();

  // si está forzado, usamos la fuente exacta
  const effectiveSource =
    mode === "force" ? (source === "api" ? "api" : "local") : "auto";

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Productos</h2>

      <AdminProductForm
        initialData={editing}
        onSaved={() => {
          setEditing(null);
        }}
      />

      <AdminProductList
        source={effectiveSource}
        onEdit={(p) => setEditing(p)}
        onClone={(p) =>
          setEditing({
            ...p,
            id: p.id + "-v2",
          })
        }
      />
    </div>
  );
}
