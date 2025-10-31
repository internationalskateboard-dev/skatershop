/**
 * store/productStore.ts
 * ------------------------------------------------------------
 * Store de productos creados desde el admin (en memoria + persistencia).
 * - Guarda productos del admin.
 * - Permite añadir/editar.
 * - Permite reducir stock en batch (se llama desde checkout).
 * - Usa tipos compartidos de lib/types.
 */

"use client";

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

      /**
       * Añadir producto desde admin.
       * Si ya existe un producto con el mismo id, lo sobreescribimos.
       */
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
          return {
            products: [...state.products, p],
          };
        }),

      /**
       * Actualizar un producto por id.
       */
      updateProduct: (id, data) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        })),

      /**
       * Eliminar producto
       * (se suele bloquear si tiene ventas → ver markLocked)
       */
      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),

      /**
       * Reducir stock en batch
       * - batch viene del checkout: [{ productId, qty, size? }, ...]
       * - si un producto no tiene stock definido → lo dejamos igual
       */
      reduceStockBatch: (batch) =>
        set((state) => {
          if (!Array.isArray(batch) || batch.length === 0) {
            return { products: state.products };
          }

          const mapById = new Map<string, number>();
          batch.forEach((item) => {
            const prev = mapById.get(item.productId) ?? 0;
            mapById.set(item.productId, prev + item.qty);
          });

          return {
            products: state.products.map((p) => {
              // si el producto no está en el batch, lo dejamos igual
              if (!mapById.has(p.id)) return p;

              const toReduce = mapById.get(p.id) ?? 0;

              // si no tenía stock → lo dejamos sin tocar
              if (typeof p.stock !== "number") {
                return p;
              }

              const newStock = Math.max(0, p.stock - toReduce);
              return {
                ...p,
                stock: newStock,
              };
            }),
          };
        }),

      /**
       * Marcar un producto como bloqueado (tiene ventas)
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

export default useProductStore;
