"use client";

/**
 * store/productStore.ts
 * ------------------------------------------------------------
 * Store de productos en memoria (admin).
 * Ahora reexporta el tipo Product para compatibilidad.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product, SaleItem } from "@/lib/types";

type ProductState = {
  products: Product[];
  addProduct: (p: Product) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  reduceStockBatch: (batch: SaleItem[]) => void;
  markLocked: (id: string) => void;
  findById: (id: string) => Product | undefined;
};

const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: [],

      addProduct: (p) =>
        set((state) => {
          const exists = state.products.find((x) => x.id === p.id);
          if (exists) {
            return {
              products: state.products.map((x) =>
                x.id === p.id ? { ...x, ...p } : x
              ),
            };
          }
          return { products: [...state.products, p] };
        }),

      updateProduct: (id, data) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        })),

      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),

      reduceStockBatch: (batch) =>
        set((state) => {
          if (!Array.isArray(batch) || batch.length === 0) {
            return { products: state.products };
          }

          const reduceMap = new Map<string, number>();
          batch.forEach((item) => {
            reduceMap.set(
              item.productId,
              (reduceMap.get(item.productId) ?? 0) + item.qty
            );
          });

          return {
            products: state.products.map((p) => {
              const toReduce = reduceMap.get(p.id);
              if (!toReduce) return p;
              if (typeof p.stock !== "number") return p;
              return { ...p, stock: Math.max(0, p.stock - toReduce) };
            }),
          };
        }),

      markLocked: (id) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, locked: true } : p
          ),
        })),

      findById: (id) => get().products.find((p) => p.id === id),
    }),
    {
      name: "skatershop-products-v1",
    }
  )
);

// ⬇️ esto es lo que te faltaba para que “haya algo exportado”
export type { Product } from "@/lib/types";

export default useProductStore;
