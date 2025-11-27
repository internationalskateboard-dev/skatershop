// components/admin/products/wizard/steps/ProductSummaryStep.tsx
"use client";

import Image from "next/image";
import { useAdminProductDetail } from "@/hooks/admin/useAdminProductDetail";
import type { ProductWithRelations, StockColorSizeRow } from "@/lib/types";

type ProductSummaryStepProps = {
  productId: number;
};

export function ProductSummaryStep({ productId }: ProductSummaryStepProps) {
  const { product, loading, error } = useAdminProductDetail(productId);

  if (loading) {
    return (
      <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mt-4">
        <p className="text-xs text-neutral-400">
          Cargando resumen del producto...
        </p>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mt-4">
        <p className="text-xs text-red-400">
          {error || "No se encontró el producto para el resumen."}
        </p>
      </section>
    );
  }

  const totalStock = (product.stockRows ?? []).reduce(
    (acc, row) => acc + (row.stock || 0),
    0
  );

  const variantsView = buildVariantView(product);

  return (
    <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-6 mt-4">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            Paso 4 de 4
          </p>
          <h3 className="text-lg font-semibold text-white">
            Resumen final del producto
          </h3>
          <p className="text-xs text-neutral-500 mt-1">
            Verifica la información antes de considerar este producto como listo
            para la tienda. Por ahora este paso solo muestra datos, no realiza
            cambios adicionales en la BD.
          </p>
        </div>

        <div className="text-right text-[11px] text-neutral-500">
          <p>
            ID BD:{" "}
            <span className="font-mono text-neutral-200">
              #{product.id}
            </span>
          </p>
          <p className="mt-1">
            slug:{" "}
            <span className="font-mono text-neutral-200">
              {product.slug}
            </span>
          </p>
        </div>
      </header>

      {/* Bloque principal: datos base */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Columna izquierda: nombre, precio, textos */}
        <div className="md:col-span-2 space-y-2">
          <p className="text-sm font-semibold text-white">
            {product.name}
          </p>

          <p className="text-2xl font-bold text-yellow-400">
            €{product.price.toFixed(2)}
          </p>

          {product.desc && (
            <p className="text-xs text-neutral-300">{product.desc}</p>
          )}

          {product.details && (
            <p className="text-[11px] text-neutral-500 whitespace-pre-line">
              {product.details}
            </p>
          )}
        </div>

        {/* Columna derecha: meta info */}
        <div className="border border-neutral-800 rounded-lg p-3 text-xs text-neutral-400 space-y-1">
          <p>
            Tipo:{" "}
            <span className="text-neutral-200">
              {product.productType?.name ?? "—"}
            </span>
          </p>
          <p>
            Categoría:{" "}
            <span className="text-neutral-200">
              {product.category?.name ?? "—"}
            </span>
          </p>
          <p>
            Stock total:{" "}
            <span className="text-yellow-300 font-semibold">
              {totalStock}
            </span>
          </p>
          <p className="text-[10px] text-neutral-500 mt-1">
            Creado: {new Date(product.createdAt).toLocaleString()}
          </p>
          <p className="text-[10px] text-neutral-500">
            Actualizado: {new Date(product.updatedAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Imágenes por color */}
      {product.colorImages && product.colorImages.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-neutral-400 uppercase tracking-wide">
            Imágenes por color
          </p>
          <div className="flex flex-wrap gap-3">
            {product.colorImages.map((img) => {
              const colorName = product.colors?.find(
                (c) => c.id === img.colorId
              )?.name;

              return (
                <div
                  key={img.id}
                  className="border border-neutral-800 rounded-lg p-2 w-32 flex flex-col items-center gap-2"
                >
                  <div className="w-16 h-16 rounded-md overflow-hidden border border-neutral-700 bg-neutral-950">
                    <Image
                      src={img.imageUrl}
                      alt={colorName || "color"}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[11px] text-neutral-300 text-center">
                    {colorName ?? "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Variantes (color + talla + stock) */}
      {variantsView.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-neutral-400 uppercase tracking-wide">
            Variantes (color / talla / stock)
          </p>
          <div className="border border-neutral-800 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-neutral-950">
                <tr className="text-[11px] uppercase tracking-wide text-neutral-500">
                  <th className="px-3 py-2 text-left">Color</th>
                  <th className="px-3 py-2 text-left">Talla</th>
                  <th className="px-3 py-2 text-center">Stock</th>
                </tr>
              </thead>
              <tbody>
                {variantsView.map((row, idx) => (
                  <tr
                    key={`${row.colorId}-${row.sizeId}-${idx}`}
                    className="border-t border-neutral-800"
                  >
                    <td className="px-3 py-2 text-neutral-200">
                      {row.colorName ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-neutral-200">
                      {row.sizeLabel ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-center text-yellow-300 font-semibold">
                      {row.stock}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Aviso final */}
      <div className="pt-3 border-t border-neutral-800 text-[11px] text-neutral-500">
        Este producto ya tiene base, imágenes y variantes registradas en la BD.
        En esta versión el paso 4 es solo de revisión visual. Más adelante
        podemos añadir aquí acciones como “Publicar / Despublicar” o estados
        adicionales.
      </div>
    </section>
  );
}

/**
 * Construye una vista de variantes (color + talla + stock) uniendo:
 * - stockRows
 * - colors
 * - sizes
 */
function buildVariantView(product: ProductWithRelations) {
  const colorsById = new Map<number, string>();
  (product.colors ?? []).forEach((c) => {
    colorsById.set(c.id, c.name);
  });

  const sizesById = new Map<number, string>();
  (product.sizes ?? []).forEach((s) => {
    sizesById.set(s.id, s.label);
  });

  const stockRows: StockColorSizeRow[] = product.stockRows ?? [];

  return stockRows.map((row) => ({
    colorId: row.colorId,
    sizeId: row.sizeId,
    stock: row.stock,
    colorName: colorsById.get(row.colorId) ?? null,
    sizeLabel: sizesById.get(row.sizeId) ?? null,
  }));
}
