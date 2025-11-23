// product-utils.tsx
import type { Product, VariantStockItem, CartItem } from "@/lib/types";

/*
export function getExistingItemQty(
  product: Product | undefined,
  cart: CartItem[],
  selectedSize?: string | null,
  selectedColorName?: string | null
): number {
  if (!product) return 0;

  // Determinar talla elegida
  const chosenSize =
    selectedSize ||
    (Array.isArray(product.sizes) && product.sizes.length === 1
      ? product.sizes[0]
      : undefined);

  // Determinar color elegido
  const chosenColor =
    selectedColorName ||
    (product.colors && product.colors.length > 0
      ? product.colors[0].name
      : undefined);

  // Buscar coincidencia exacta (id + talla + color)
  const found = cart.find(
    (i) =>
      i.id === product.id &&
      i.size === chosenSize &&
      i.colorName === chosenColor
  );

  return found?.qty ?? 0;
}

/** *
export function getVariantStock(
  product: Product,
  selectedSize: string | null,
  selectedColorName: string | null
): number {
  // Si no hay stock por variante, usa el stock general
  if (!product.variantStock || product.variantStock.length === 0) {
    return product.stock ?? 0;
  }

  const row = product.variantStock.find((v) => {
    const sizeOk = v.size === (selectedSize ?? null);
    const colorOk = v.colorName === (selectedColorName ?? null);
    return sizeOk && colorOk;
  });

  // Si no encuentra combinación exacta → 0 (o fallback a stock global)
  return row?.stock ?? 0;
}
*/


/** */

export function getExistingItemQty(
  product: Product | undefined,
  cart: CartItem[],
  selectedSize: string | null,
  selectedColorName: string | null
): number {
  if (!product) return 0;

  const existing = cart.find(
    (i) =>
      i.id === product.id &&
      (selectedSize ? i.size === selectedSize : !i.size) &&
      (selectedColorName ? i.colorName === selectedColorName : !i.colorName)
  );

  return existing?.qty ?? 0;
}

/**
 * Devuelve el stock disponible para la combinación actual
 * (talla + color). Si no hay variantStock, usa stock general.
 */
export function getVariantStock(
  product: Product,
  selectedSize: string | null,
  selectedColorName: string | null
): number {
  const variants = product.variantStock;

  

  // si no hay variantes → usamos stock general
  if (!variants || variants.length === 0) {
    // console.log("!variants: "+ JSON.stringify(variants, null, 2) )
    return product.stock ?? 0;
  }

  const row = variants.find((v) => {

// console.log("variants: "+ JSON.stringify(variants, null, 2) )

    const sizeOk =
      (selectedSize == null && (v.size == null || v.size === "")) ||
      (selectedSize != null && v.size === selectedSize);

    const colorOk =
      (selectedColorName == null &&
        (v.colorName == null || v.colorName === "")) ||
      (selectedColorName != null && v.colorName === selectedColorName);

    return sizeOk && colorOk;
  });

  // si no encuentra esa combinación → 0
  return row?.stock ?? 0;
}

