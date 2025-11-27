// store/productStore.ts

import { create } from "zustand";
import type { Product } from "@/lib/types";
import { sanitizeProductImages } from "@/lib/utils/product/sanitizeProduct";

export type ProductState = {
  products: Product[];
  addProduct: (p: Product) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  removeProduct: (id: string) => void;

  /** ⚠ Debería actualizar variantStock, no stock global */
  reduceStockBatch: (batch: { productId: string; qty: number }[]) => void;

  findById: (id: string) => Product | undefined;
};

const useProductStore = create<ProductState>((set, get) => ({
  products: [],

  addProduct: (p) =>
    set((state) => {
      const product = sanitizeProductImages(p);

      const exists = state.products.find((x) => x.id === p.id);
      if (exists) {
        return {
          products: state.products.map((x) =>
            x.id === p.id ? sanitizeProductImages({ ...x, ...p }) : x
          ),
        };
      }
      return { products: [...state.products, product] };
    }),

  updateProduct: (id, data) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id
          ? sanitizeProductImages({ ...p, ...data })
          : p
      ),
    })),

  removeProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    })),

  // ⚠ Actualmente obsoleto en tu sistema (stock global no existe)
  reduceStockBatch: (batch) =>
    set((state) => {
      console.warn(
        "[reduceStockBatch] ADVERTENCIA: debería modificarse para variantStock"
      );

      return state; // por ahora no modificamos nada
    }),

  findById: (id) =>
    sanitizeProductImages(
      get().products.find((p) => p.id === id) ?? (undefined as any)
    ),
}));

export default useProductStore;
