/**
 * store/salesStore.ts
 * ------------------------------------------------------------
 * Registra las ventas hechas desde el checkout (en memoria).
 * - Guarda un historial de ventas (simple).
 * - Permite consultar cuánto se ha vendido de un producto.
 * - Usa los tipos compartidos de lib/types.
 */

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SaleItem, SaleRecord } from "@/lib/types";

type SalesState = {
  sales: SaleRecord[];
  addSaleBatch: (items: SaleItem[], extra?: Partial<SaleRecord>) => void;
  getSoldQty: (productId: string) => number;
  clearSales: () => void;
};

const useSalesStore = create<SalesState>()(
  persist(
    (set, get) => ({
      sales: [],

      /**
       * addSaleBatch
       * - Se llama desde checkout cuando PayPal aprueba.
       * - items: [{ productId, qty, size? }, ...]
       * - extra: info opcional del pedido (cliente, total, fecha)
       */
      addSaleBatch: (items, extra) =>
        set((state) => {
          const newRecord: SaleRecord = {
            id: Date.now().toString(),
            items,
            createdAt: new Date().toISOString(),
            ...extra,
          };

          return {
            sales: [...state.sales, newRecord],
          };
        }),

      /**
       * getSoldQty
       * - Devuelve el total vendido de un producto en todas las ventas
       * - Lo usa el admin para saber si puede borrar un producto o mostrar “LOCKED”
       */
      getSoldQty: (productId) => {
        const { sales } = get();
        return sales.reduce((acc, sale) => {
          const match = sale.items.filter(
            (it) => it.productId === productId
          );
          const qty = match.reduce((a, m) => a + m.qty, 0);
          return acc + qty;
        }, 0);
      },

      /**
       * Limpiar ventas (por si quieres resetear en desarrollo)
       */
      clearSales: () => set({ sales: [] }),
    }),
    {
      name: "skatershop-sales-v1",
    }
  )
);

export default useSalesStore;
