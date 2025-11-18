/**
 * useCartStore (Zustand)
 * - Añadir/actualizar productos del carrito
 * - Persistencia en localStorage
 * - Ahora usando CartItem de lib/types.ts
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/lib/types";

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

      addToCart: (item) =>
        set((state) => {
          // Buscar si ya existe MISMO producto + MISMA talla + MISMO color
          const existingIndex = state.cart.findIndex(
            (i) =>
              i.id === item.id &&
              i.size === item.size &&
              i.colorName === item.colorName
          );

          // ✅ Si existe esa combinación → solo actualizamos cantidad
          if (existingIndex !== -1) {
            return {
              cart: state.cart.map((i, idx) =>
                idx === existingIndex
                  ? {
                      ...i,
                      qty: i.qty + (item.qty || 1),
                      image: item.image ?? i.image, // opcional
                    }
                  : i
              ),
            };
          }

          // 🆕 Si NO existe esa combinación (cambia talla o color) → nueva línea
          return {
            cart: [
              ...state.cart,
              {
                id: item.id,
                name: item.name,
                price: item.price,
                qty: item.qty || 1,
                image: item.image || "",
                size: item.size,
                colorName: item.colorName,
              },
            ],
          };
        }),

      removeFromCart: (id) =>
        set((state) => ({
          cart: state.cart.filter((i) => i.id !== id),
        })),

      updateQty: (id, qty) =>
        set((state) => ({
          cart: state.cart.map((i) =>
            i.id === id ? { ...i, qty: Math.max(1, qty) } : i
          ),
        })),

      // actualizar talla del item ya añadido
      setItemSize: (id, size) =>
        set((state) => ({
          cart: state.cart.map((i) => (i.id === id ? { ...i, size } : i)),
        })),

      clearCart: () => set({ cart: [] }),

      total: () => get().cart.reduce((acc, i) => acc + i.price * i.qty, 0),

      countItems: () => get().cart.reduce((acc, i) => acc + i.qty, 0),
    }),
    {
      name: "skater-cart",
      // 🔑 solo persistimos campos pequeños (sin image)
      partialize: (state) => ({
        cart: state.cart.map(({ id, name, price, qty, size, colorName }) => ({
          id,
          name,
          price,
          qty,
          size,
          colorName,
        })),
      }),
    }
  )
);

export default useCartStore;
