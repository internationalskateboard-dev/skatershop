// lib/server/salesMemory.ts
import type { SaleRecord } from "@/lib/admin/types";

export const salesMemory: SaleRecord[] = [];

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

export function removeSaleFromMemory(id: string): boolean {
  const idx = salesMemory.findIndex((s) => s.id === id);
  if (idx === -1) return false;
  salesMemory.splice(idx, 1);
  return true;
}

export function getSaleFromMemory(id: string): SaleRecord | null {
  return salesMemory.find((s) => s.id === id) ?? null;
}
