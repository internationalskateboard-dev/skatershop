/**
 * useMergedProducts
 * ------------------------------------------------------------
 * Une:
 * - productos base (lib/productsBase)
 * - productos creados por el admin (store/productStore)
 *
 * Prioridad:
 * - si hay un producto en el store con el MISMO id que uno base → gana el del store


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
 */

// lib/useMergedProducts.ts
"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { productsBase } from "@/lib/productsBase";
import useProductStore from "@/store/productStore";
import { useAdminDataSource } from "@/components/admin/AdminDataSourceContext";

type UseMergedProductsResult = {
  products: Product[];
};

function mergeBaseAndLocal(base: Product[], local: Product[]): Product[] {
  const map = new Map<string, Product>();

  // primero los base
  for (const p of base) {
    map.set(p.id, p);
  }
  // luego los locales/admin (sobrescriben si mismo id)
  for (const p of local) {
    map.set(p.id, p);
  }

  return Array.from(map.values());
}

export default function useMergedProducts(): UseMergedProductsResult {
  
  const adminProducts = useProductStore((s) => s.products);
  const { source, mode, reportApiSuccess, reportApiError } =
    useAdminDataSource();

  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Si el modo está en FORCE + LOCAL: no pegamos a la API, solo local/base
      if (mode === "force" && source === "local") {
        const merged = mergeBaseAndLocal(productsBase, adminProducts);
        setProducts(merged);
        return;
      }

      try {
        // 1) Intentar siempre la BD vía /api/products?source=db
        const res = await fetch("/api/products?source=db", {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`API respondió ${res.status}`);
        }

        const data = (await res.json()) as { products: Product[] };

        if (cancelled) return;

        if (data.products && data.products.length > 0) {
          setProducts(data.products);
        } else {
          // BD vacía: usamos base + lo que haya en admin local
          const merged = mergeBaseAndLocal(productsBase, adminProducts);
          setProducts(merged);
        }

        // Notificamos que la API/DB funciona
        reportApiSuccess();
      } catch (err) {
        console.error("[useMergedProducts] Error cargando desde DB/API", err);
        if (cancelled) return;

        // Fallback a local/base
        const merged = mergeBaseAndLocal(productsBase, adminProducts);
        setProducts(merged);

        reportApiError("No se pudo leer desde la BD, usando datos locales");
      }
    }

    load();

    // cleanup
    return () => {
      cancelled = true;
    };
  }, [mode, source, adminProducts, reportApiSuccess, reportApiError]);

  return { products };
}
