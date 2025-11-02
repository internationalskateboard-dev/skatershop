// lib/server/salesMemory.ts
import type { SaleRecord } from "@/lib/types";

export const salesMemory: SaleRecord[] = [];

// crear venta en memoria
export function addSaleToMemory(
  sale: Omit<SaleRecord, "id" | "createdAt">
): SaleRecord {
  const full: SaleRecord = {
    id: "sale-" + Date.now().toString(),
    createdAt: new Date().toISOString(),
    ...sale,
  };
  salesMemory.push(full);
  return full;
}

// listar todas
export function listSalesFromMemory(): SaleRecord[] {
  return salesMemory;
}

// obtener una
export function getSaleFromMemory(id: string): SaleRecord | null {
  return salesMemory.find((s) => s.id === id) ?? null;
}

// borrar una
export function removeSaleFromMemory(id: string): boolean {
  const idx = salesMemory.findIndex((s) => s.id === id);
  if (idx === -1) return false;
  salesMemory.splice(idx, 1);
  return true;
}
