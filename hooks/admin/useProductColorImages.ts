// hooks/admin/useProductColorImages.ts
"use client";

import { useEffect, useState } from "react";

export type ProductColorImageRow = {
  colorId: number;
  colorName: string;
  imageUrl: string;
};

export function useProductColorImages(productId: number | undefined) {
  const [colorImages, setColorImages] = useState<ProductColorImageRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/admin/products/color-images/${productId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Error al leer color-images");
        }

        if (!cancelled) {
          setColorImages(data.colorImages || []);
        }
      } catch (err) {
        console.error("[useProductColorImages] error:", err);
        if (!cancelled) setError("No se pudieron cargar las imágenes por color");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  return { colorImages, loading, error };
}
