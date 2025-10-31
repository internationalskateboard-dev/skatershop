/**
salesStore (Zustand)
- Historial de ventas por producto base.
- Se usa para bloquear edición/borrado en Admin.
- Se actualiza al aprobar el pago en Checkout.
*/

'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SaleRecord = {
  productId: string
  quantitySold: number
}

type SalesState = {
  sales: SaleRecord[]
  addSaleBatch: (items: { productId: string; qty: number }[]) => void
  getSoldQty: (productId: string) => number
}

const useSalesStore = create<SalesState>()(
  persist(
    (set, get) => ({
      sales: [],

      addSaleBatch: (items) => {
        const current = [...get().sales]

        items.forEach(({ productId, qty }) => {
          const idx = current.findIndex(
            (s) => s.productId === productId
          )
          if (idx === -1) {
            current.push({
              productId,
              quantitySold: qty,
            })
          } else {
            current[idx] = {
              ...current[idx],
              quantitySold:
                current[idx].quantitySold + qty,
            }
          }
        })

        set({ sales: current })
      },

      getSoldQty: (productId: string) => {
        const rec = get().sales.find(
          (s) => s.productId === productId
        )
        return rec ? rec.quantitySold : 0
      },
    }),
    {
      name: 'skaterstore-sales',
      getStorage: () => localStorage,
    }
  )
)

export default useSalesStore
