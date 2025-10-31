"use client";

/**
 * store/productStore.ts
 * ------------------------------------------------------------
 * Store de productos creados desde el admin.
 * - Persiste en localStorage (Zustand + persist)
 * - Soporta los campos nuevos del admin:
 *    → colors?: { name: string; image?: string }[]
 *    → sizeGuide?: string
 * - Expone tanto `deleteProduct` como `removeProduct`
 *   para ser compatible con las páginas que ya usan uno u otro.
 * - Incluye `reduceStockBatch` para el checkout.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, SaleItem } from "@/lib/types";

type ProductState = {
  products: Product[];

  // crear
  addProduct: (p: Product) => void;

  // actualizar parcial
  updateProduct: (id: string, data: Partial<Product>) => void;

  // borrar (nombre viejo)
  deleteProduct: (id: string) => void;

  // borrar (nombre nuevo, para el admin actual)
  removeProduct: (id: string) => void;

  // usado por checkout
  reduceStockBatch: (batch: SaleItem[]) => void;

  // marcar como bloqueado (ventas)
  markLocked: (id: string) => void;

  // helper
  findById: (id: string) => Product | undefined;
};

const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: [],

      /**
       * Añadir producto.
       * Si ya existe uno con ese id → lo actualizamos.
       */
      addProduct: (p) =>
        set((state) => {
          const exists = state.products.find((x) => x.id === p.id);
          if (exists) {
            return {
              products: state.products.map((x) =>
                x.id === p.id
                  ? // merge completo, incluimos colors y sizeGuide
                    {
                      ...x,
                      ...p,
                      colors: p.colors ?? x.colors,
                      sizeGuide: p.sizeGuide ?? x.sizeGuide,
                    }
                  : x
              ),
            };
          }
          return {
            products: [
              ...state.products,
              {
                ...p,
                colors: p.colors ?? [],
                sizeGuide: p.sizeGuide ?? "",
              },
            ],
          };
        }),

      /**
       * Actualizar parcial
       */
      updateProduct: (id, data) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id
              ? {
                  ...p,
                  ...data,
                  // aseguramos que no se pierdan estos dos
                  colors:
                    data.colors !== undefined ? data.colors : p.colors,
                  sizeGuide:
                    data.sizeGuide !== undefined
                      ? data.sizeGuide
                      : p.sizeGuide,
                }
              : p
          ),
        })),

      /**
       * Borrar por id (nombre viejo)
       */
      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),

      /**
       * Borrar por id (nombre nuevo)
       * → esto es lo que tu admin actual está usando
       */
      removeProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),

      /**
       * Reducir stock en batch
       * - se llama desde checkout y desde /api/checkout
       * - si un producto no tiene stock definido → no se toca
       */
      reduceStockBatch: (batch) =>
        set((state) => {
          if (!Array.isArray(batch) || batch.length === 0) {
            return { products: state.products };
          }

          const map = new Map<string, number>();
          batch.forEach((item) => {
            map.set(
              item.productId,
              (map.get(item.productId) ?? 0) + item.qty
            );
          });

          return {
            products: state.products.map((p) => {
              const toReduce = map.get(p.id);
              if (!toReduce) return p;
              if (typeof p.stock !== "number") return p;
              return {
                ...p,
                stock: Math.max(0, p.stock - toReduce),
              };
            }),
          };
        }),

      /**
       * Marcar un producto como bloqueado
       */
      markLocked: (id) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, locked: true } : p
          ),
        })),

      /**
       * Buscar por id
       */
      findById: (id) => {
        return get().products.find((p) => p.id === id);
      },
    }),
    {
      name: "skatershop-products-v1",
    }
  )
);

// reexportamos el tipo para compatibilidad
export type { Product } from "@/lib/types";

export default useProductStore;
