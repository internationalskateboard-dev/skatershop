// lib/stock/getVariantStock.ts
import type { Product } from "@/lib/types";
import { getRealStock } from "./getRealStock";
import { soldMap } from "./soldMap";
import { normalize } from "./util";

export function getVariantStock(
  product: Product,
  size: string | null,
  colorName: string | null,
  sold: Record<string, number> = soldMap
): number {
  const variants = product.variantStock;

  if (!variants?.length) {
    const key = `${product.id}_global`;
    const soldUnits = sold[key] ?? 0;
    return getRealStock(product.stock ?? 0, soldUnits);
  }

  const cleanSize = normalize(size);
  const cleanColor = normalize(colorName);

  const variant = variants.find(
    (v) =>
      normalize(v.size) === cleanSize &&
      normalize(v.colorName) === cleanColor
  );

  if (!variant) return 0;

  const key = `${product.id}_${cleanColor}_${cleanSize}`;
  const soldUnits = sold[key] ?? 0;

  return getRealStock(variant.stock ?? 0, soldUnits);
}
