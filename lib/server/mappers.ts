// lib/server/mappers.ts
/**
 * Funciones helper para convertir entre tu tipo Product / SaleRecord
 * y los datos que vienen de Prisma.
 *
 * Nota: Para evitar errores de tipos en Vercel con @prisma/client,
 * aquí NO importamos tipos de Prisma. Usamos `any` para el registro
 * que viene de la BD y devolvemos siempre tus tipos de dominio.
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

    // En Prisma: Json?
    // Guardas arrays directamente como JSON (Prisma lo maneja)
    sizes: (db.sizesJson as string[] | null) ?? undefined,

    // stock: Int?
    stock:
      typeof db.stock === "number"
        ? db.stock
        : db.stock != null
        ? Number(db.stock)
        : undefined,

    colors: (db.colorsJson as any[] | null) ?? undefined,
    sizeGuide: db.sizeGuide ?? undefined,
    isClothing: Boolean(db.isClothing),
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

    // En schema: Json? → podemos guardar directamente el array
    sizesJson: p.sizes ?? null,
    stock: p.stock ?? null,
    colorsJson: p.colors ?? null,
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

    // En schema: itemsJson Json
    // Esperamos que allí haya un array de items serializable
    items: (db.itemsJson as any[]) ?? [],

    total:
      typeof db.total === "number" ? db.total : Number(db.total ?? 0),

    // En schema: customerJson Json?
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
