// lib/server/mappers.ts
/**
 * Funciones helper para convertir entre:
 * - Tipos de dominio del frontend (Product, SaleRecord)
 * - Registros que vienen de Prisma (db: any)
 *
 * Importante: aquí NO usamos tipos de @prisma/client para evitar
 * errores de tipos en build (Vercel) con campos JSON.
 */

import type { Product, SaleRecord } from "@/lib/types";

// ----------------------
// PRODUCTO
// ----------------------

export function mapDbProductToProduct(db: any): Product {
  return {
    id: db.id,
    name: db.name,
    price: db.price,
    desc: db.desc ?? undefined,
    details: db.details ?? undefined,
    image: db.image ?? undefined,

    // En schema.prisma: sizesJson Json?
    // Guardamos arrays directamente como JSON
    sizes: (db.sizesJson as string[] | null) ?? undefined,

    // En schema: stock Int?
    stock:
      typeof db.stock === "number"
        ? db.stock
        : db.stock != null
        ? Number(db.stock)
        : undefined,

    // En schema: colorsJson Json?
    colors: (db.colorsJson as any[] | null) ?? undefined,

    sizeGuide: db.sizeGuide ?? undefined,
    isClothing: Boolean(db.isClothing),
    variantStock: (db.variantStock as any) ?? [], // 👈 importante
  };
}

export function mapProductToDbData(p: Product) {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    desc: p.desc ?? null,
    details: p.details ?? null,
    image: p.image ?? null,

    // Json? → Prisma admite arrays/objetos sin problema
    sizesJson: p.sizes ?? null,
    colorsJson: p.colors ?? null,

    // nuevo: guardamos también el JSON de variantes
    variantStock: p.variantStock ?? null,

    // stock total (en tu route ya lo calculamos antes de llamar al mapper)
    stock: p.stock ?? null,

    sizeGuide: p.sizeGuide ?? null,
    isClothing: p.isClothing,
  };
}

// ----------------------
// VENTA
// ----------------------

export function mapDbSaleToSaleRecord(db: any): SaleRecord {
  return {
    id: String(db.id),
    createdAt: db.createdAt
      ? db.createdAt.toISOString()
      : new Date().toISOString(),

    // itemsJson: Json → array de SaleItem
    items: (db.itemsJson as any[]) ?? [],

    total:
      typeof db.total === "number" ? db.total : Number(db.total ?? 0),

    // customerJson: Json?
    customer: (db.customerJson as any) ?? undefined,
  };
}

export function mapSaleRecordToDbData(
  sale: Omit<SaleRecord, "id" | "createdAt">
) {
  return {
    itemsJson: sale.items,
    total: sale.total,
    customerJson: sale.customer ?? null,
  };
}
