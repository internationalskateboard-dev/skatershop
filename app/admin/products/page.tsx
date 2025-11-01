"use client";

import { useState } from "react";
import AdminProductForm from "@/components/admin/AdminProductForm";
import AdminProductList from "@/components/admin/AdminProductList";
import type { Product } from "@/lib/admin/types";

export default function AdminProductsPage() {
  const [editing, setEditing] = useState<Product | null>(null);

  return (
    <div className="space-y-6">
      <AdminProductForm initialData={editing} onSaved={() => setEditing(null)} />
      <AdminProductList
        onEdit={(p) => setEditing(p)}
        onClone={(p) =>
          setEditing({
            ...p,
            id: p.id + "-clone",
          })
        }
      />
    </div>
  );
}
