// store/cartStore.ts
/**
 * useCartStore (Zustand)
 * Manejo del carrito con soporte para talla + color + stock real
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/lib/types";

type CartState = {
  cart: CartItem[];

  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, size?: string, colorName?: string) => void;
  updateQty: (
    id: string,
    size: string | undefined,
    colorName: string | undefined,
    qty: number
  ) => void;

  clearCart: () => void;
  total: () => number;
  countItems: () => number;
};

const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],

      // ----------------------------------------------------------
      // ADD TO CART
      // ----------------------------------------------------------
      addToCart: (item) =>
        set((state) => {
          const idx = state.cart.findIndex(
            (i) =>
              i.id === item.id &&
              i.size === item.size &&
              i.colorName === item.colorName
          );

          if (idx !== -1) {
            const existing = state.cart[idx];
            const nextQty = existing.qty + (item.qty || 1);

            return {
              cart: state.cart.map((i, iIndex) =>
                iIndex === idx
                  ? {
                      ...i,
                      qty: Math.min(nextQty, existing.stock),
                      image: item.image ?? i.image,
                    }
                  : i
              ),
            };
          }

          return {
            cart: [
              ...state.cart,
              {
                ...item,
                qty: item.qty || 1,
                stock: item.stock ?? 0,
              },
            ],
          };
        }),

      // ----------------------------------------------------------
      // REMOVE
      // ----------------------------------------------------------
      removeFromCart: (id, size, colorName) =>
        set((state) => ({
          cart: state.cart.filter(
            (i) =>
              !(
                i.id === id &&
                i.size === size &&
                i.colorName === colorName
              )
          ),
        })),

      // ----------------------------------------------------------
      // UPDATE QTY
      // ----------------------------------------------------------
      updateQty: (id, size, colorName, qty) =>
        set((state) => ({
          cart: state.cart.map((i) =>
            i.id === id &&
            i.size === size &&
            i.colorName === colorName
              ? { ...i, qty: Math.min(Math.max(1, qty), i.stock) }
              : i
          ),
        })),

      // ----------------------------------------------------------
      clearCart: () => set({ cart: [] }),

      total: () =>
        get().cart.reduce((acc, i) => acc + i.price * i.qty, 0),

      countItems: () =>
        get().cart.reduce((acc, i) => acc + i.qty, 0),
    }),
    {
      name: "skater-cart",
      partialize: (state) => ({
        cart: state.cart.map(
          ({ id, name, price, qty, size, colorName, stock }) => ({
            id,
            name,
            price,
            qty,
            size,
            colorName,
            stock,
          })
        ),
      }),
    }
  )
);

export default useCartStore;
