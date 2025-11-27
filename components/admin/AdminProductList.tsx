// components/admin/AdminProductList.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { ConfirmModal } from "@/components/admin/ui/ConfirmModal";
import type { ProductWithRelations } from "@/lib/types";
import { usePublishProduct } from "@/hooks/admin/usePublishProduct";

type AdminProductListProps = {
  products: ProductWithRelations[];
  loading?: boolean;
  error?: string | null;
  onEdit: (p: ProductWithRelations) => void;
  onClone: (p: ProductWithRelations) => void;
  onDelete: (p: ProductWithRelations) => void;
  reload: () => void;
};

export default function AdminProductList({
  products,
  loading,
  error,
  onEdit,
  onClone,
  onDelete,
  reload,
}: AdminProductListProps) {
  // Hooks arriba (obligatorio)
  const [deleteTarget, setDeleteTarget] = useState<ProductWithRelations | null>(
    null
  );

  const { togglePublish, loadingId } = usePublishProduct();

  /** ESTADOS BASE */
  if (loading) {
    return (
      <div className="border border-neutral-800 rounded-xl p-6 text-center">
        <p className="text-xs text-neutral-500">
          Cargando productos desde la base de datos...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-700/60 bg-red-950/20 rounded-xl p-6 text-center">
        <p className="text-xs text-red-400">{error}</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="border border-neutral-800 rounded-xl p-6 text-center">
        <p className="text-xs text-neutral-500">
          No hay productos registrados.
        </p>
      </div>
    );
  }

  /** LISTADO */
  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {products.map((p) => {
          const imageUrl =
            p.colorImages?.[0]?.imageUrl || "/placeholder-product.png";

          const totalStock =
            p.stockRows?.reduce((sum, row) => sum + row.stock, 0) || 0;

          const variantsCount = p.stockRows?.length || 0;

          return (
            <div
              key={p.id}
              className="border border-neutral-800 bg-neutral-900 rounded-xl overflow-hidden hover:border-yellow-500 transition"
            >
              {/* Imagen */}
              <div className="relative w-full h-44 bg-neutral-950 border-b border-neutral-800">
                <Image
                  src={imageUrl}
                  alt={p.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>

              {/* Info */}
              <div className="p-4 space-y-2">
                {/* Nombre */}
                <h3 className="text-sm font-semibold text-white line-clamp-1">
                  {p.name}
                </h3>

                {/* Categoría + Tipo */}
                <p className="text-xs text-neutral-500">
                  {p.category?.name || "Sin categoría"} •{" "}
                  {p.productType?.name || "Sin tipo"}
                </p>

                {/* Precio */}
                <p className="text-lg font-bold text-yellow-400">
                  €{Number(p.price).toFixed(2)}
                </p>

                {/* BADGES */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {/* Publicado */}
                  <span
                    className={`px-2 py-1 text-[10px] font-bold rounded-md ${
                      p.published
                        ? "bg-green-600/20 text-green-400 border border-green-600/30"
                        : "bg-neutral-700/20 text-neutral-400 border border-neutral-600/30"
                    }`}
                  >
                    {p.published ? "Publicado" : "Borrador"}
                  </span>

                  {/* Stock total */}
                  <span
                    className={`px-2 py-1 text-[10px] rounded-md border ${
                      totalStock > 0
                        ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-300"
                        : "bg-red-600/20 border-red-600/40 text-red-400"
                    }`}
                  >
                    Stock: {totalStock}
                  </span>

                  {/* Variantes */}
                  <span className="px-2 py-1 text-[10px] rounded-md bg-indigo-500/20 border border-indigo-500/40 text-indigo-300">
                    {variantsCount} variantes
                  </span>
                </div>

                {/* Botones */}
                <div className="flex justify-between pt-2 border-t border-neutral-800 mt-3">
                  {/* Editar */}
                  <button
                    type="button"
                    onClick={() => onEdit(p)}
                    className="text-[11px] px-3 py-1 bg-neutral-800 border border-neutral-700 rounded-md text-neutral-200 hover:border-yellow-400 transition"
                  >
                    Editar
                  </button>

                  {/* Clonar 
                  <button
                    type="button"
                    onClick={() => onClone(p)}
                    className="text-[11px] px-3 py-1 bg-neutral-800 border border-neutral-700 rounded-md text-neutral-200 hover:border-yellow-400 transition"
                  >
                    Clonar
                  </button>*/}

                  {/* Eliminar */}
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(p)}
                    className="text-[11px] px-3 py-1 bg-red-600 border border-red-500 rounded-md text-white hover:bg-red-500 transition"
                  >
                    Eliminar
                  </button>
                </div>

                {/* Publicar / Despublicar */}
                <div className="pt-2">
                  <button
                    disabled={loadingId === p.id}
                    onClick={() => togglePublish(p, reload)}
                    className={`text-[11px] px-3 py-1 rounded-md border transition w-full ${
                      p.published
                        ? "bg-green-600 border-green-500 text-white hover:bg-green-500"
                        : "bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-yellow-400"
                    } ${
                      loadingId === p.id ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {loadingId === p.id
                      ? "Actualizando..."
                      : p.published
                      ? "Despublicar"
                      : "Publicar"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal borrar */}
      <ConfirmModal
        open={!!deleteTarget}
        title="¿Eliminar producto?"
        message={`Esta acción eliminará permanentemente el producto "${
          deleteTarget?.name || ""
        }".`}
        confirmLabel="Eliminar"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) onDelete(deleteTarget);
          setDeleteTarget(null);
        }}
      />
    </>
  );
}
