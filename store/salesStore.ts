// store/salesStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  SaleRecord,
  SaleItem,
  CustomerInfo,
} from "@/lib/types";

type SalesState = {
  sales: SaleRecord[];
  addSale: (sale: SaleRecord) => void;
  addSaleBatch: (
    items: { productId: string; qty: number; size?: string }[],
    opts?: {
      customer?: Partial<CustomerInfo>;
      total?: number;
      createdAt?: string;
    }
  ) => void;
  getSoldQty: (productId: string) => number;
};

const useSalesStore = create<SalesState>()(
  persist(
    (set, get) => ({
      sales: [],

      // guardar una venta completa
      addSale: (sale) =>
        set((state) => ({
          sales: [...state.sales, sale],
        })),

      /**
       * addSaleBatch
       * - atajo cuando solo tenemos los items (ej: viene de PayPal capture)
       * - opcional: pasar customer y total
       */
      addSaleBatch: (items, opts) => {
        const mapped: SaleItem[] = items.map((it) => ({
          productId: it.productId,
          qty: it.qty,
          size: it.size,
        }));

        const sale: SaleRecord = {
          id: opts?.createdAt
            ? "local-" + opts.createdAt
            : "local-" + Date.now().toString(),
          createdAt: opts?.createdAt ?? new Date().toISOString(),
          items: mapped,
          total: typeof opts?.total === "number" ? opts.total : 0,
          customer: opts?.customer ?? {},
        };

        set((state) => ({
          sales: [...state.sales, sale],
        }));
      },

      // cuántas unidades de un producto se vendieron
      getSoldQty: (productId) => {
        const sales = get().sales;
        let total = 0;
        for (const sale of sales) {
          for (const item of sale.items) {
            if (item.productId === productId) {
              total += item.qty;
            }
          }
        }
        return total;
      },
    }),
    {
      name: "skater-sales",
    }
  )
);

export default useSalesStore;
