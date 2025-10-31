/**
productStore (Zustand)
- Catálogo editable desde Admin.
- Cada producto tiene stock.
- reduceStockBatch descuenta stock tras una compra.
- removeProduct bloqueado si ya hubo ventas.
- ⚠️ Se recortan imágenes base64 muy grandes antes de guardarlas
  para no reventar el localStorage (QuotaExceededError).
*/

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AdminProduct = {
  id: string;
  name: string;
  price: number;
  image: string;
  desc: string;
  details: string;
  sizes: string[];
  stock: number;
  // 👇 nuevo, opcional (definido ya en tu AdminPage)
  colors?: {
    name: string;
    image: string;
  }[];
  // también opcional, pero tú lo tienes como string
  sizeGuide?: string;
};

type ProductState = {
  products: AdminProduct[];
  addProduct: (p: AdminProduct) => void;
  removeProduct: (id: string) => void;
  reduceStockBatch: (items: { productId: string; qty: number }[]) => void;
};

/**
 * Recorta las imágenes muy largas (base64) para que el JSON
 * que va a localStorage no pase el límite (~5MB).
 *
 * Esto es un parche mientras no tengamos backend / storage real.
 */
function shrinkProductForStorage(p: AdminProduct): AdminProduct {
  // límite aproximado de chars por imagen
  const MAX_LEN = 9120_000; // ajusta a 80_000 si sigue dando quota

  const safeImage =
    p.image && p.image.length > MAX_LEN
      ? p.image.slice(0, MAX_LEN) + "...truncated"
      : p.image;

  const safeColors = Array.isArray(p.colors)
    ? p.colors.map((c) => {
        if (!c.image) return c;
        return c.image.length > MAX_LEN
          ? { ...c, image: c.image.slice(0, MAX_LEN) + "...truncated" }
          : c;
      })
    : p.colors;

  return {
    ...p,
    image: safeImage,
    colors: safeColors,
  };
}

const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: [],

      addProduct: (p) => {
        // ✅ antes de guardar, lo “achicamos”
        const safe = shrinkProductForStorage(p);

        const exists = get().products.find((x) => x.id === p.id);
        if (exists) {
          set({
            products: get().products.map((x) =>
              x.id === p.id ? safe : x
            ),
          });
        } else {
          set({
            products: [...get().products, safe],
          });
        }
      },

      removeProduct: (id) => {
        set({
          products: get().products.filter((x) => x.id !== id),
        });
      },

      // 🔥 Descontar stock tras una compra
      reduceStockBatch: (items) => {
        const newProducts = [...get().products];

        items.forEach(({ productId, qty }) => {
          const idx = newProducts.findIndex((p) => p.id === productId);
          if (idx !== -1) {
            const currentStock = newProducts[idx].stock ?? 0;
            const newStock = currentStock - qty;
            newProducts[idx] = {
              ...newProducts[idx],
              stock: newStock < 0 ? 0 : newStock,
            };
          }
        });

        set({ products: newProducts });
      },
    }),
    {
      name: "skaterstore-products",
      getStorage: () => localStorage,
    }
  )
);

export default useProductStore;
