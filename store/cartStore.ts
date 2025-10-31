/**
 * useCartStore (Zustand)
 * - Añadir/actualizar productos del carrito
 * - Persistencia en localStorage
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  setItemSize: (id: string, size: string) => void; // ✅ nuevo
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
          const existing = state.cart.find((i) => i.id === item.id);
          if (existing) {
            return {
              cart: state.cart.map((i) =>
                i.id === item.id
                  ? {
                      ...i,
                      qty: i.qty + (item.qty || 1),
                      image: item.image ?? i.image,
                      size: item.size ?? i.size,
                    }
                  : i
              ),
            };
          }
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

      // ✅ actualizar talla del item ya añadido
      setItemSize: (id, size) =>
        set((state) => ({
          cart: state.cart.map((i) =>
            i.id === id ? { ...i, size } : i
          ),
        })),

      clearCart: () => set({ cart: [] }),

      total: () =>
        get().cart.reduce((acc, i) => acc + i.price * i.qty, 0),

      countItems: () =>
        get().cart.reduce((acc, i) => acc + i.qty, 0),
    }),
    { name: "skater-cart" }
  )
);

export default useCartStore;
