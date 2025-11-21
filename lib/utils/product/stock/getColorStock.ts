import type { Product } from "@/lib/types";
import { getRealStock } from "./getRealStock";

/**
 * Stock total disponible por color
 */
export function getColorStock(
  product: Product,
  colorName: string,
  soldMap: Record<string, number> = {}
): number {
  const variants = product.variantStock;

  if (!variants?.length) return product.stock ?? 0;

  return variants
    .filter((v) => v.colorName === colorName)
    .reduce((sum, v) => {
      const key = `${v.colorName}_${v.size}`;
      const sold = soldMap[key] ?? 0;

      return sum + getRealStock(v.stock ?? 0, sold);
    }, 0);
}
