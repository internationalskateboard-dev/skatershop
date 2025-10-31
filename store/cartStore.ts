/**
 * useCartStore (Zustand)
 * ------------------------------------------------------------
 * - Añadir / actualizar productos del carrito
 * - Persistencia en localStorage
 * - Control de talla por item
 * - Cálculo de total y conteo de items
 *
 * Esta versión está alineada con:
 * - /components/ui/ProductCard.tsx
 * - /app/shop/page.tsx
 * - /app/products/[id]/page.tsx
 * - /app/cart/page.tsx
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PRODUCT_PLACEHOLDER_IMAGE } from "@/lib/constants";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
  size?: string; // ✅ talla opcional
}

type CartState = {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  setItemSize: (id: string, size: string) => void;
  clearCart: () => void;
  total: () => number;
  countItems: () => number;
};

const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],

      /**
       * addToCart
       * - si el item ya existe → suma cantidad y actualiza imagen/talla
       * - si no existe → lo añade con qty por defecto = 1
       */
      addToCart: (item) =>
        set((state) => {
          const existing = state.cart.find((i) => i.id === item.id);

          // si ya está en carrito → actualizar
          if (existing) {
            return {
              cart: state.cart.map((i) =>
                i.id === item.id
                  ? {
                      ...i,
                      // sumamos cantidad entrante (si no viene, tomamos 1)
                      qty: i.qty + (item.qty || 1),
                      // si llega una imagen nueva la usamos; si no, dejamos la anterior
                      image:
                        item.image ??
                        i.image ??
                        PRODUCT_PLACEHOLDER_IMAGE,
                      // si llega talla nueva, la usamos
                      size: item.size ?? i.size,
                    }
                  : i
              ),
            };
          }

          // si NO estaba en carrito → añadir nuevo
          return {
            cart: [
              ...state.cart,
              {
                id: item.id,
                name: item.name,
                // aseguramos number
                price: Number(item.price ?? 0),
                qty: item.qty || 1,
                // si no viene imagen, dejamos placeholder para no romper UI
                image: item.image || PRODUCT_PLACEHOLDER_IMAGE,
                size: item.size,
              },
            ],
          };
        }),

      /**
       * removeFromCart
       * - quita un item por id
       */
      removeFromCart: (id) =>
        set((state) => ({
          cart: state.cart.filter((i) => i.id !== id),
        })),

      /**
       * updateQty
       * - actualiza cantidad pero nunca permite < 1
       */
      updateQty: (id, qty) =>
        set((state) => ({
          cart: state.cart.map((i) =>
            i.id === id ? { ...i, qty: Math.max(1, qty) } : i
          ),
        })),

      /**
       * setItemSize
       * - permite cambiar la talla de un item que YA está en el carrito
       * - lo usamos en /products/[id]
       */
      setItemSize: (id, size) =>
        set((state) => ({
          cart: state.cart.map((i) =>
            i.id === id ? { ...i, size } : i
          ),
        })),

      /**
       * clearCart
       * - vacía el carrito
       */
      clearCart: () => set({ cart: [] }),

      /**
       * total
       * - suma de (precio × cantidad) de todos los items
       * - con Number(...) para evitar NaN si algo vino mal del admin
       */
      total: () =>
        get().cart.reduce(
          (acc, i) => acc + Number(i.price ?? 0) * i.qty,
          0
        ),

      /**
       * countItems
       * - número total de unidades (no de productos distintos)
       */
      countItems: () =>
        get().cart.reduce((acc, i) => acc + i.qty, 0),
    }),
    {
      // nombre de la clave en localStorage
      name: "skatershop-cart-v1",
    }
  )
);

export default useCartStore;
