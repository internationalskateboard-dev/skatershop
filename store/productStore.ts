/**
 * useProductStore
 * ------------------------------------------------------------
 * - Guarda productos creados desde el admin (en memoria)
 * - Permite agregarlos, actualizarlos y borrarlos
 * - Permite reducir stock por lote (checkout)
 *
 * La persistencia real de productos debe estar en la BD,
 * este store es solo estado de UI.
 */

import { create } from "zustand";
import type { Product } from "@/lib/types";

export type ProductState = {
  products: Product[];
  addProduct: (p: Product) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  reduceStockBatch: (batch: { productId: string; qty: number }[]) => void;
  findById: (id: string) => Product | undefined;
};

const useProductStore = create<ProductState>((set, get) => ({
  products: [],

  addProduct: (p) =>
    set((state) => {
      const exists = state.products.find((x) => x.id === p.id);
      if (exists) {
        // si ya existe, lo sobreescribimos
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

  removeProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    })),

  // usado en checkout
  reduceStockBatch: (batch) =>
    set((state) => {
      if (!batch || batch.length === 0) return state;
      const updated = state.products.map((p) => {
        const found = batch.find((b) => b.productId === p.id);
        if (!found) return p;
        const currentStock = typeof p.stock === "number" ? p.stock : 0;
        const newStock = Math.max(0, currentStock - found.qty);
        return { ...p, stock: newStock };
      });
      return { products: updated };
    }),

  findById: (id) => {
    return get().products.find((p) => p.id === id);
  },
}));

export default useProductStore;
