/**
 * /lib/utils/product/stock/soldMap.ts
 * --------------------------------------------------------------
 * soldMap = ventas simuladas por variante
 *
 * La clave siempre debe ser:
 *
 *    `${productId}_${colorName}_${size}`
 *
 * Ejemplo real:
 *    "sueter-V1_Black_L": 2,
 *
 * Este mapa es completamente opcional:
 *  - Si está vacío → NO descuenta ventas (stock = stock base)
 *  - Si tiene valores → getVariantStock restará automáticamente
 *
 * Más adelante reemplazaremos este archivo por
 * datos reales desde la base de datos (Prisma).
 */

export const soldMap: Record<string, number> = {
  // SIMULACIÓN DE VENTAS (ejemplos)
  "sueter-V1_Black_L": 5, // 6
  "sueter-V1_Black_XL": 1, // 5
  "sueter-V1_Blue_S": 4,
};
