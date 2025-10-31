/**
useMergedProducts
- Hook que mezcla productos base hardcodeados con productos creados en Admin.
- Los productos del Admin tienen prioridad.
- Expone { products, getById } para las páginas.
*/

'use client'

import { useMemo } from 'react'
import { products as baseProducts, Product } from '@/lib/products'
import useProductStore, { AdminProduct } from '@/store/productStore'

export type StoreProduct = Product & { stock?: number }

export default function useMergedProducts() {
  const adminProducts = useProductStore((s) => s.products)

  const merged: StoreProduct[] = useMemo(() => {
    const map = new Map<string, StoreProduct>()

    // primero admin (tienen prioridad)
    adminProducts.forEach((p: AdminProduct) => {
      map.set(p.id, {
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.image,
        desc: p.desc,
        details: p.details,
        sizes: p.sizes,
        stock: p.stock, // 👈 incluimos stock
      })
    })

    // luego base, si no existe en admin
    baseProducts.forEach((p) => {
      if (!map.has(p.id)) {
        map.set(p.id, {
          ...p,
          stock: undefined, // base products no tienen stock editable aún
        })
      }
    })

    return Array.from(map.values())
  }, [adminProducts])

  function getById(id: string): StoreProduct | undefined {
    return merged.find((p) => p.id === id)
  }

  return {
    products: merged,
    getById,
  }
}
