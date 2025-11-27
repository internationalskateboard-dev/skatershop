// app/admin/products/page.tsx
"use client";

import Link from "next/link";
import AdminProductList from "@/components/admin/AdminProductList";
import { useAdminDataSource } from "@/components/admin/AdminDataSourceContext";
import { useAdminProducts } from "@/hooks/admin/useAdminProducts";
import type { ProductWithRelations } from "@/lib/types";
import ProductPagination from "@/components/admin/products/ProductPagination";
import ProductFilters from "@/components/admin/products/ProductFilters";

export default function AdminProductsPage() {
  const { source, mode } = useAdminDataSource();

  const effectiveSource =
    mode === "force" ? (source === "api" ? "api" : "local") : "api";

  const {
    products,
    loading,
    error,
    filters,
    updateFilter,
    resetFilters,
    pages,
    reload,
  } = useAdminProducts({
    enabled: effectiveSource === "api",
  });

  async function handleDelete(p: ProductWithRelations) {
    const res = await fetch(`/api/admin/products/${p.id}`, {
      method: "DELETE",
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Error al eliminar");
      return;
    }

    reload();
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">Productos</h2>
          <p className="text-xs text-neutral-500">
            Administra los productos de la tienda. La creación se realiza
            mediante un Wizard estructurado conectado a la BD.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/products/new"
            className="bg-yellow-400 text-black font-bold text-xs py-2.5 px-4 rounded-lg hover:bg-yellow-300 active:scale-95 transition uppercase tracking-wide"
          >
            + Nuevo producto
          </Link>

          <button
            type="button"
            onClick={reload}
            className="text-[11px] bg-neutral-900 border border-neutral-700 px-3 py-2 rounded-md text-neutral-300 hover:border-yellow-400 hover:text-yellow-300 transition"
          >
            Recargar
          </button>
        </div>
      </header>

      <ProductFilters
        filters={filters}
        updateFilter={updateFilter}
        resetFilters={resetFilters}
      />

      <AdminProductList
        products={products}
        loading={loading}
        error={error}
        onEdit={(p) => alert(`Edición aún pendiente: #${p.id}`)}
        onClone={(p) => alert(`Clonación aún pendiente: #${p.id}`)}
        onDelete={handleDelete}
        reload={reload}        // 👈: resuelve publish/unpublish
      />

      <ProductPagination
        page={filters.page}      
        totalPages={pages}
        onPageChange={(p) => updateFilter({ page: p })}
        

      />
    </div>
  );
}
