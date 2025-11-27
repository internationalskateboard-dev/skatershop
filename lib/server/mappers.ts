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
import { PRODUCT_PLACEHOLDER_IMAGE } from "@/lib/constants";

function safeImage(src: any): string {
  if (typeof src !== "string") return PRODUCT_PLACEHOLDER_IMAGE;

  // base64
  if (src.startsWith("data:image")) return src;

  // rutas locales
  if (src.startsWith("/")) return src;

  // http / https
  if (src.startsWith("http")) return src;

  return PRODUCT_PLACEHOLDER_IMAGE;
}


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

    image: safeImage(db.image),

    sizes: Array.isArray(db.sizesJson)
      ? db.sizesJson.map((s: any) => String(s).trim())
      : [],

    stock: typeof db.stock === "number" ? db.stock : Number(db.stock ?? 0),

    colors: Array.isArray(db.colorsJson)
      ? db.colorsJson.map((c: any) => ({
          name: String(c?.name ?? "").trim(),
          image: safeImage(c?.image),
        }))
      : [],

    sizeGuide: db.sizeGuide ?? undefined,
    isClothing: Boolean(db.isClothing),

    variantStock: Array.isArray(db.variantStock)
      ? db.variantStock.map((v: any) => ({
          size: v.size ? String(v.size).trim() : null,
          colorName: v.colorName ? String(v.colorName).trim() : null,
          stock: Number(v.stock ?? 0),
          image: safeImage(v.image),
        }))
      : [],
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
