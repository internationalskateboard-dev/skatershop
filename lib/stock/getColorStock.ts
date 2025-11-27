// lib/stock/getColorStock.ts
import type { Product } from "@/lib/types";
import { getRealStock } from "./getRealStock";
import { normalize } from "./util";

export function getColorStock(
  product: Product,
  colorName: string,
  soldMap: Record<string, number> = {}
): number {
  const variants = product.variantStock;
  const cleanColor = normalize(colorName);

  if (!variants?.length) return product.stock ?? 0;

  return variants
    .filter((v) => normalize(v.colorName) === cleanColor)
    .reduce((sum, v) => {
      const key = `${product.id}_${cleanColor}_${normalize(v.size)}`;
      const sold = soldMap[key] ?? 0;
      return sum + getRealStock(v.stock ?? 0, sold);
    }, 0);
}
