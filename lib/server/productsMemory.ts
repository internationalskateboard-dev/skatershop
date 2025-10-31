// lib/server/productsMemory.ts
import type { Product } from "@/lib/types";

/**
 * “DB” en memoria de productos
 * - Vive solo mientras el proceso de Next está activo
 * - Sirve para que /api/products funcione
 */
export const productsMemory: Product[] = [];

/**
 * Crea o actualiza un producto en memoria
 */
export function upsertProductInMemory(p: Product): Product {
  const idx = productsMemory.findIndex((x) => x.id === p.id);
  if (idx >= 0) {
    productsMemory[idx] = { ...productsMemory[idx], ...p };
    return productsMemory[idx];
  }
  productsMemory.push(p);
  return p;
}

/**
 * Elimina un producto por id de la “DB” en memoria
 */
export function removeProductFromMemory(id: string): boolean {
  const idx = productsMemory.findIndex((x) => x.id === id);
  if (idx === -1) return false;
  productsMemory.splice(idx, 1);
  return true;
}
