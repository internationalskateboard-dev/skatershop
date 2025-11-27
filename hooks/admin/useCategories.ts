// hooks/admin/useCategories.ts
"use client";

import { useEffect, useState } from "react";
import type { Category } from "@/lib/types";

type UseCategoriesResult = {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/categories");
      if (!res.ok) throw new Error("Error HTTP");
      const data = (await res.json()) as { categories?: Category[] };
      setCategories(data.categories ?? []);
    } catch (err) {
      console.error("[useCategories] error:", err);
      setError("No se pudieron cargar las categorías.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return { categories, loading, error, refresh: () => void load() };
}
