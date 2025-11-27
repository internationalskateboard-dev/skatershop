// lib/server/productsMemory.ts
import type { Product } from "@/lib/types";
import { sanitizeProductImages } from "@/lib/utils/product/sanitizeProduct";

export const productsMemory: Product[] = [];

// create or update
export function upsertProductInMemory(p: Product): Product {
  const clean = sanitizeProductImages({
    ...p,
    variantStock: p.variantStock?.map((v) => ({
      size: v.size?.trim() ?? null,
      colorName: v.colorName?.trim() ?? null,
      stock: v.stock ?? 0,
    })),
  });

  const idx = productsMemory.findIndex((x) => x.id === clean.id);

  if (idx >= 0) {
    productsMemory[idx] = { ...productsMemory[idx], ...clean };
    return productsMemory[idx];
  }

  productsMemory.push(clean);
  return clean;
}

export function getProductFromMemory(id: string): Product | null {
  const found = productsMemory.find((x) => x.id === id);
  return found ? sanitizeProductImages(found) : null;
}

export function removeProductFromMemory(id: string): boolean {
  const idx = productsMemory.findIndex((x) => x.id === id);
  if (idx === -1) return false;
  productsMemory.splice(idx, 1);
  return true;
}
