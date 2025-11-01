// lib/server/productsMemory.ts
import type { Product } from "@/lib/admin/types";

export const productsMemory: Product[] = [];

export function upsertProductInMemory(p: Product): Product {
  const idx = productsMemory.findIndex((x) => x.id === p.id);
  if (idx >= 0) {
    productsMemory[idx] = { ...productsMemory[idx], ...p };
    return productsMemory[idx];
  }
  productsMemory.push(p);
  return p;
}

export function removeProductFromMemory(id: string): boolean {
  const idx = productsMemory.findIndex((x) => x.id === id);
  if (idx === -1) return false;
  productsMemory.splice(idx, 1);
  return true;
}

export function getProductFromMemory(id: string): Product | null {
  return productsMemory.find((x) => x.id === id) ?? null;
}
