// app/admin/products/page.tsx
"use client";

import { useState } from "react";
import AdminProductForm from "@/components/admin/AdminProductForm";
import AdminProductList from "@/components/admin/AdminProductList";
import type { Product } from "@/lib/types";

export default function AdminProductsPage() {
  // estado para cuando le das “Editar” o “Clonar” en la lista
  const [editing, setEditing] = useState<Product | null>(null);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Productos</h2>

      {/* Formulario (puede recibir initialData) */}
      <AdminProductForm
        initialData={editing}
        onSaved={() => {
          // cuando se guarda, limpiamos el form
          setEditing(null);
        }}
      />

      {/* Lista (le pasamos handlers para editar / clonar) */}
      <AdminProductList
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
