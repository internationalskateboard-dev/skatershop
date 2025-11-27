// components/admin/AdminProductList.tsx
"use client";

import Image from "next/image";
import type { ProductWithRelations } from "@/lib/types";

type AdminProductListProps = {
  source?: "api" | "local";
  products: ProductWithRelations[];
  onEdit: (p: ProductWithRelations) => void;
  onClone: (p: ProductWithRelations) => void;
};

export default function AdminProductList({
  products,
  onEdit,
  onClone,
}: AdminProductListProps) {
  if (!products || products.length === 0) {
    return (
      <div className="border border-neutral-800 rounded-xl p-6 text-center">
        <p className="text-xs text-neutral-500">No hay productos registrados.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {products.map((p) => {
        const img =
          p.colorImages?.[0]?.imageUrl ??
          "/placeholder.png"; // fallback

        // Stock total sumado desde stockRows
        const totalStock = (p.stockRows ?? []).reduce(
          (acc, r) => acc + (r.stock || 0),
          0
        );

        return (
          <div
            key={p.id}
            className="border border-neutral-800 bg-neutral-900 rounded-xl overflow-hidden hover:border-yellow-500 transition"
          >
            {/* Imagen */}
            <div className="relative w-full h-44 bg-neutral-950 border-b border-neutral-800">
              <Image
                src={img}
                alt={p.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            {/* Información */}
            <div className="p-4 space-y-2">
              <h3 className="text-sm font-semibold text-white">{p.name}</h3>

              <p className="text-xs text-neutral-500">
                {p.category?.name ?? "Sin categoría"} •{" "}
                {p.productType?.name ?? "Sin tipo"}
              </p>

              <p className="text-lg font-bold text-yellow-400">
                €{p.price.toFixed(2)}
              </p>

              <p className="text-[11px] text-neutral-500">
                Stock total:{" "}
                <span className="font-semibold text-yellow-300">
                  {totalStock}
                </span>
              </p>

              {/* Colores → círculos */}
              {p.colors && p.colors.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {p.colors.map((c) => (
                    <span
                      key={c.id}
                      title={c.name}
                      className="w-4 h-4 rounded-full border border-neutral-700"
                      style={{
                        backgroundColor: "#ccc", // fallback
                      }}
                    ></span>
                  ))}
                </div>
              )}

              {/* Botones */}
              <div className="flex justify-between pt-2 border-t border-neutral-800 mt-3">
                <button
                  onClick={() => onEdit(p)}
                  className="text-[11px] px-3 py-1 bg-neutral-800 border border-neutral-700 rounded-md text-neutral-200 hover:border-yellow-400 transition"
                >
                  Editar
                </button>

                <button
                  onClick={() => onClone(p)}
                  className="text-[11px] px-3 py-1 bg-neutral-800 border border-neutral-700 rounded-md text-neutral-200 hover:border-yellow-400 transition"
                >
                  Clonar
                </button>
              </div>
              
            </div>
          </div>
        );
      })}
    </div>
  );
}
