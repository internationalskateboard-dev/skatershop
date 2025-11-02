// lib/server/productsMemory.ts
import type { Product } from "@/lib/types";

export const productsMemory: Product[] = [];

// crea o actualiza
export function upsertProductInMemory(p: Product): Product {
  const idx = productsMemory.findIndex((x) => x.id === p.id);
  if (idx >= 0) {
    productsMemory[idx] = { ...productsMemory[idx], ...p };
    return productsMemory[idx];
  }
  productsMemory.push(p);
  return p;
}

// obtener por id (👉 este era el que faltaba)
export function getProductFromMemory(id: string): Product | null {
  return productsMemory.find((x) => x.id === id) ?? null;
}

// borrar
export function removeProductFromMemory(id: string): boolean {
  const idx = productsMemory.findIndex((x) => x.id === id);
  if (idx === -1) return false;
  productsMemory.splice(idx, 1);
  return true;
}
