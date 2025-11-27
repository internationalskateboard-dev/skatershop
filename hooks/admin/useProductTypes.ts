// hooks/admin/useProductTypes.ts
"use client";

import { useEffect, useState } from "react";
import type { ProductType } from "@/lib/types";

type UseProductTypesResult = {
  types: ProductType[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useProductTypes(): UseProductTypesResult {
  const [types, setTypes] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/product-types");
      if (!res.ok) throw new Error("Error HTTP");
      const data = (await res.json()) as { types?: ProductType[] };
      setTypes(data.types ?? []);
    } catch (err) {
      console.error("[useProductTypes] error:", err);
      setError("No se pudieron cargar los tipos de producto.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return { types, loading, error, refresh: () => void load() };
}
