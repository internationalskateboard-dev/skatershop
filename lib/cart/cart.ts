// /lib/utils/cart/cart.ts
import type { Product, CartItem } from "@/lib/types";

/**
 * Obtener cantidad existente en el carrito
 * considerando id + talla + color.
 */
export function getExistingItemQty(
  product: Product,
  cart: CartItem[],
  size?: string | null,
  colorName?: string | null
): number {
  const item = cart.find(
    (i) =>
      i.id === product.id &&
      (size ? i.size === size : true) &&
      (colorName ? i.colorName === colorName : true)
  );

  return item?.qty ?? 0;
}

/**
 * Obtener el subtotal por línea
 */
export function getItemSubtotal(item: CartItem): number {
  return item.price * item.qty;
}

/**
 * Obtener el total del carrito (igual al store.total)
 */
export function getCartTotal(cart: CartItem[]): number {
  return cart.reduce((acc, item) => acc + item.price * item.qty, 0);
}

/**
 * Contar total de unidades (igual a countItems)
 */
export function countCartUnits(cart: CartItem[]): number {
  return cart.reduce((acc, item) => acc + item.qty, 0);
}

/**
 * Ver si un item ya existe (mismo id+size+color)
 */
export function findCartItem(
  product: Product,
  cart: CartItem[],
  size?: string | null,
  colorName?: string | null
): CartItem | undefined {
  return cart.find(
    (i) =>
      i.id === product.id &&
      (size ? i.size === size : true) &&
      (colorName ? i.colorName === colorName : true)
  );
}
