/**
productStore (Zustand)
- Catálogo editable desde Admin.
- Cada producto tiene stock.
- reduceStockBatch descuenta stock tras una compra.
- removeProduct bloqueado si ya hubo ventas.
*/

'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AdminProduct = {
  id: string
  name: string
  price: number
  image: string
  desc: string
  details: string
  sizes: string[]
  stock: number
}

type ProductState = {
  products: AdminProduct[]
  addProduct: (p: AdminProduct) => void
  removeProduct: (id: string) => void
  reduceStockBatch: (items: { productId: string; qty: number }[]) => void
}

const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: [],

      addProduct: (p) => {
        const exists = get().products.find((x) => x.id === p.id)
        if (exists) {
          set({
            products: get().products.map((x) =>
              x.id === p.id ? p : x
            ),
          })
        } else {
          set({
            products: [...get().products, p],
          })
        }
      },

      removeProduct: (id) => {
        set({
          products: get().products.filter(
            (x) => x.id !== id
          ),
        })
      },

      // 🔥 Descontar stock tras una compra
      reduceStockBatch: (items) => {
        const newProducts = [...get().products]

        items.forEach(({ productId, qty }) => {
          const idx = newProducts.findIndex(
            (p) => p.id === productId
          )
          if (idx !== -1) {
            const currentStock = newProducts[idx].stock ?? 0
            const newStock = currentStock - qty
            newProducts[idx] = {
              ...newProducts[idx],
              stock: newStock < 0 ? 0 : newStock,
            }
          }
        })

        set({ products: newProducts })
      },
    }),
    {
      name: 'skaterstore-products',
      getStorage: () => localStorage,
    }
  )
)

export default useProductStore
