// lib/products/useMergedProducts.ts
"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";

import { productsBase } from "@/lib/productsBase";
import useProductStore from "@/store/productStore";
import { useAdminDataSource } from "@/components/admin/AdminDataSourceContext";

import { sanitizeProductImages } from "@/lib/utils/product/sanitizeProduct";

type UseMergedProductsResult = {
  products: Product[];
};

function mergeBaseAndLocal(base: Product[], local: Product[]): Product[] {
  const map = new Map<string, Product>();

  base.forEach((p) => map.set(p.id, sanitizeProductImages(p)));
  local.forEach((p) => map.set(p.id, sanitizeProductImages(p)));

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
      // FORCE + LOCAL
      if (mode === "force" && source === "local") {
        const merged = mergeBaseAndLocal(productsBase, adminProducts);
        setProducts(merged);
        return;
      }

      try {
        // BD FIRST
        const res = await fetch("/api/products?source=db", {
          cache: "no-store",
        });

        if (!res.ok) throw new Error(`API ${res.status}`);

        const data = await res.json();

        if (cancelled) return;

        if (data.products?.length > 0) {
          setProducts(data.products.map(sanitizeProductImages));
        } else {
          setProducts(
            mergeBaseAndLocal(productsBase, adminProducts)
          );
        }

        reportApiSuccess();
      } catch (err) {
        console.error("[useMergedProducts] Error:", err);

        if (cancelled) return;

        // fallback
        setProducts(
          mergeBaseAndLocal(productsBase, adminProducts)
        );

        reportApiError("No se pudo leer BD, usando local");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [mode, source, adminProducts, reportApiSuccess, reportApiError]);

  return { products };
}
