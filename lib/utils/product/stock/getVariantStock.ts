// /lib/utils/product/stock/getVariantStock.ts
import type { Product } from "@/lib/types";
import { getRealStock } from "./getRealStock";
import { soldMap } from "./soldMap";

/**
 * Devuelve el stock REAL para una combinación (talla + color)
 * considerando:
 *  - stock base de la variante
 *  - stock vendido (soldMap)
 */
export function getVariantStock(
  product: Product,
  size: string | null,
  colorName: string | null,
  sold: Record<string, number> = soldMap
): number {
  const variants = product.variantStock;

  // Si NO existen variantes → usar stock global
  if (!variants || variants.length === 0) {
    const key = `${product.id}_global`;
    const soldUnits = sold[key] ?? 0;

    return getRealStock(product.stock ?? 0, soldUnits);
  }

  // Buscar variante exacta
  const variant = variants.find(
    (v) => v.size === size && v.colorName === colorName
  );

  if (!variant) return 0;

  // Clave única por variante (id + color + talla)
  const key = `${product.id}_${variant.colorName}_${variant.size}`;

  const soldUnits = sold[key] ?? 0;
  const baseStock = variant.stock ?? 0;

  return getRealStock(baseStock, soldUnits);
}
