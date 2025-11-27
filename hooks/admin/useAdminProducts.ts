// hooks/admin/useAdminProducts.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import type { ProductWithRelations } from "@/lib/types";

export type UseAdminProductsParams = {
  enabled?: boolean;
};

export type ProductFilters = {
  search: string;
  categoryId: number | null;
  typeId: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  published: "all" | "yes" | "no";
  sort: string; // price_asc | price_desc | newest | oldest
  page: number;
  limit: number;
};

export function useAdminProducts(params: UseAdminProductsParams = {}) {
  const { enabled = true } = params;

  // ------------------------------
  // Estado principal
  // ------------------------------
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ------------------------------
  // Estado de filtros
  // ------------------------------
  const [filters, setFilters] = useState<ProductFilters>({
    search: "",
    categoryId: null,
    typeId: null,
    minPrice: null,
    maxPrice: null,
    published: "all",
    sort: "newest",
    page: 1,
    limit: 6,
  });

  // Paginación
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  // ------------------------------
  // Función de carga
  // ------------------------------
  const loadProducts = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();

      if (filters.search) params.set("search", filters.search);
      if (filters.categoryId) params.set("categoryId", String(filters.categoryId));
      if (filters.typeId) params.set("typeId", String(filters.typeId));

      if (filters.minPrice !== null)
        params.set("minPrice", String(filters.minPrice));
      if (filters.maxPrice !== null)
        params.set("maxPrice", String(filters.maxPrice));

      if (filters.published !== "all")
        params.set("published", filters.published);

      params.set("sort", filters.sort);
      params.set("page", String(filters.page));
      params.set("limit", String(filters.limit));

      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Error al cargar productos");

      setProducts(data.products || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (err: any) {
      console.error("[useAdminProducts] error:", err);
      setError(err?.message || "Error al cargar productos");
    } finally {
      setLoading(false);
    }
  }, [enabled, filters]);

  // Ejecutar carga cuando cambien filtros
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // ------------------------------
  // Métodos externos
  // ------------------------------
  function updateFilter(patch: Partial<ProductFilters>) {
    setFilters((prev) => ({
      ...prev,
      ...patch,
      page: patch.page ? patch.page : prev.page,
    }));
  }

  function resetFilters() {
    setFilters({
      search: "",
      categoryId: null,
      typeId: null,
      minPrice: null,
      maxPrice: null,
      published: "all",
      sort: "newest",
      page: 1,
      limit: 12,
    });
  }

  function reload() {
    loadProducts();
  }

  return {
    products,
    loading,
    error,

    // filtros
    filters,
    updateFilter,
    resetFilters,

    // paginación
    page: filters.page,
    limit: filters.limit,
    total,
    pages,

    reload,
  };
}
