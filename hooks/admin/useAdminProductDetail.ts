// hooks/admin/useAdminProductDetail.ts
"use client";

import { useEffect, useState } from "react";
import type { ProductWithRelations } from "@/lib/types";

type UseAdminProductDetailResult = {
  product: ProductWithRelations | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
};

export function useAdminProductDetail(
  productId: number | undefined
): UseAdminProductDetailResult {
  const [product, setProduct] = useState<ProductWithRelations | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadFlag, setReloadFlag] = useState(0);

  useEffect(() => {
    if (!productId) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/products/${productId}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || "Error al cargar el producto");
        }
        if (!cancelled) {
          setProduct(data.product ?? null);
        }
      } catch (err) {
        console.error("[useAdminProductDetail] error:", err);
        if (!cancelled) {
          setError("No se pudo cargar el resumen del producto.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [productId, reloadFlag]);

  return {
    product,
    loading,
    error,
    reload: () => setReloadFlag((x) => x + 1),
  };
}
