/**
 * useMergedProducts
 * ------------------------------------------------------------
 * Une:
 * - productos base (lib/productsBase)
 * - productos creados por el admin (store/productStore)
 *
 * Prioridad:
 * - si hay un producto en el store con el MISMO id que uno base → gana el del store
 */

"use client";

import { useMemo } from "react";
import useProductStore from "@/store/productStore";
import { productsBase } from "./productsBase";
import type { Product } from "./types";

export default function useMergedProducts() {
  
  const adminProducts = useProductStore((s) => s.products);

  const products: Product[] = useMemo(() => {
    // índice para rápida sustitución
    const map = new Map<string, Product>();

    // 1) primero los base
    productsBase.forEach((p) => {
      map.set(p.id, p);
    });

    // 2) luego los del admin (sobrescriben)
    adminProducts.forEach((p) => {
      map.set(p.id, p);
    });

    return Array.from(map.values());
  }, [adminProducts]);

  return { products };
}
