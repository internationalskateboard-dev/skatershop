// lib/utils/product/stock.ts
import type { Product } from "@/lib/types";

/**
 * Obtener stock exacto de una combinación (talla + color).
 */
export function getVariantStock(
  product: Product,
  size: string | null,
  colorName: string | null
): number {
  const variants = product.variantStock;

  if (!variants || variants.length === 0) {
    return product.stock ?? 0;
  }

  // Combinación exacta
  const variant = variants.find(
    (v) => v.size === size && v.colorName === colorName
  );

  return variant?.stock ?? 0;
}

/**
 * ¿Este color tiene stock disponible para esta talla?
 * Si NO se ha seleccionado talla → ver si el color tiene stock en cualquier talla.
 */
export function colorHasStock(
  product: Product,
  colorName: string,
  selectedSize: string | null
): boolean {
  const variants = product.variantStock;

  if (!variants || variants.length === 0) {
    return (product.stock ?? 0) > 0;
  }

  // Si NO hay talla seleccionada → el color está disponible si existe stock en ese color
  if (!selectedSize) {
    return variants.some(
      (v) => v.colorName === colorName && (v.stock ?? 0) > 0
    );
  }

  // Si SÍ hay talla seleccionada → verificar combinación exacta
  return variants.some(
    (v) =>
      v.colorName === colorName &&
      v.size === selectedSize &&
      (v.stock ?? 0) > 0
  );
}

/**
 * ¿Esta talla tiene stock disponible para este color?
 * Si NO se ha seleccionado color → ver si la talla tiene stock en cualquier color.
 */
export function sizeHasStock(
  product: Product,
  size: string,
  selectedColor: string | null
): boolean {
  const variants = product.variantStock;

  if (!variants || variants.length === 0) {
    return (product.stock ?? 0) > 0;
  }

  // Si NO hay color seleccionado → ver si esa talla existe con stock (en cualquier color)
  if (!selectedColor) {
    return variants.some((v) => v.size === size && (v.stock ?? 0) > 0);
  }

  // Si SÍ hay color seleccionado → verificar combinación exacta
  return variants.some(
    (v) =>
      v.size === size &&
      v.colorName === selectedColor &&
      (v.stock ?? 0) > 0
  );
}
