// lib/stock/getSizeStock.ts
import type { Product } from "@/lib/types";
import { getRealStock } from "./getRealStock";
import { normalize } from "./util";

export function getSizeStock(
  product: Product,
  size: string,
  soldMap: Record<string, number> = {}
): number {
  const variants = product.variantStock;
  const cleanSize = normalize(size);

  if (!variants?.length) return product.stock ?? 0;

  return variants
    .filter((v) => normalize(v.size) === cleanSize)
    .reduce((sum, v) => {
      const key = `${product.id}_${normalize(v.colorName)}_${cleanSize}`;
      const sold = soldMap[key] ?? 0;
      return sum + getRealStock(v.stock ?? 0, sold);
    }, 0);
}
