// lib/server/salesMemory.ts
import type { SaleRecord } from "@/lib/types";

/**
 * “DB” en memoria para las ventas.
 * Vive solo mientras el server está levantado.
 */
export const salesMemory: SaleRecord[] = [];

/**
 * Añade una venta a la memoria.
 */
export function addSaleToMemory(
  sale: Omit<SaleRecord, "id" | "createdAt">
): SaleRecord {
  const full: SaleRecord = {
    id: "mem-" + Date.now().toString(),
    createdAt: new Date().toISOString(),
    ...sale,
  };
  salesMemory.push(full);
  return full;
}

/**
 * Borra una venta de la memoria por id.
 * Devuelve true si la encontró.
 */
export function removeSaleFromMemory(id: string): boolean {
  const idx = salesMemory.findIndex((s) => s.id === id);
  if (idx === -1) return false;
  salesMemory.splice(idx, 1);
  return true;
}
