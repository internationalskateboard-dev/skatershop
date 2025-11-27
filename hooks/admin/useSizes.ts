// hooks/admin/useSizes.ts
"use client";

import { useEffect, useState } from "react";
import type { Size } from "@/lib/types";

type UseSizesResult = {
  sizes: Size[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useSizes(productTypeId: number | null): UseSizesResult {
  const [sizes, setSizes] = useState<Size[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!productTypeId) {
      setSizes([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/sizes?productTypeId=${productTypeId}`);
      if (!res.ok) throw new Error("Error HTTP");
      const data = (await res.json()) as { sizes?: Size[] };
      setSizes(data.sizes ?? []);
    } catch (err) {
      console.error("[useSizes] error:", err);
      setError("No se pudieron cargar las tallas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productTypeId]);

  return { sizes, loading, error, refresh: () => void load() };
}
