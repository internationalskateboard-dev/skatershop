/**
 * /lib/utils/product/stock/getRealStock.ts
 * 
 * getRealStock
 * --------------------------------------------------------------
 * Calcula el stock REAL de una variante.
 *
 * - Por ahora devuelve el stock base SIN modificar.
 * - Más adelante, cuando activemos ventas reales,
 *   simplemente descomenta el bloque indicado.
 *
 * stockReal = stockInicial - vendidos
 */

export function getRealStock(
  stock: number,
  sold: number = 0   // ← recibir ventas es opcional, pero ya está preparado
): number {
  const base = stock ?? 0;

  // 🔥 FUTURO: activar stock real con ventas
    return Math.max(0, base - sold);

  // Actual (modo estándar): retornar stock sin ventas
  // return base;
}
