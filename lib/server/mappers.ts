// lib/server/mappers.ts

/**
 * funciones helper para convertir entre tu tipo Product / SaleRecord y los modelos de Prisma:
 */

import type { Product, SaleRecord } from "@/lib/types";
import type { Product as DbProduct, Sale as DbSale  } from "@prisma/client";

// 
export function mapDbProductToProduct(db: DbProduct): Product {
  return {
    id: db.id,
    name: db.name,
    price: db.price,
    desc: db.desc ?? undefined,
    details: db.details ?? undefined,
    image: db.image ?? undefined,
    sizes: (db.sizesJson as string[] | null) ?? undefined,
    stock: db.stock ?? undefined, // parseInt(db.stock) ?? undefined,
    colors: (db.colorsJson as any[] | null) ?? undefined,
    sizeGuide: db.sizeGuide ?? undefined,
    isClothing: db.isClothing,
  };
}

// 
export function mapProductToDbData(p: Product) {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    desc: p.desc ?? null,
    details: p.details ?? null,
    image: p.image ?? null,
    sizesJson: p.sizes ?? null,
    stock: p.stock ?? null,
    colorsJson: p.colors ?? null,
    sizeGuide: p.sizeGuide ?? null,
    isClothing: p.isClothing,
  };
}

export function mapDbSaleToSaleRecord(db: DbSale): SaleRecord {
  return {
    //id: db.id,
    //createdAt: db.createdAt.toISOString(),
    // items: db.itemsJson as any,
    // total: db.total,
    customer: (db.customerJson as any) ?? undefined,

id: String(db.id),
    // adapta estos nombres a las columnas reales de tu modelo de venta:
    createdAt: db.createdAt.toISOString() ?? new Date().toISOString(),
    // En schema: itemsJson Json
    // Esperamos que allí haya un array de items serializable
    items: (db.itemsJson as any[]) ?? [],
    total:typeof db.total === "number" ? db.total : Number(db.total ?? 0),
    // cualquier otro campo que tengas en SaleRecord:
    // customerEmail: db.customerEmail ?? undefined,
    // customerJson: db.customer ?? null,

  };
}

export function mapSaleRecordToDbData(sale: Omit<SaleRecord, "id" | "createdAt">) {
  return {
    itemsJson: sale.items,
    total: sale.total,
    customerJson: sale.customer ?? null,
  };
}












