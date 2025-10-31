// lib/useMergedProducts.ts
/**
 * useMergedProducts
 * ------------------------------------------------------------
 * Objetivo:
 * - Obtener el catálogo unificado de la tienda.
 *
 * Orden de preferencia:
 * 1. 🔎 Intentar leer desde la API: GET /api/products
 * 2. 🧠 Si falla o no hay API → usar el store local (admin)
 * 3. 🧱 Unirlo con los productos base (lib/productsBase.ts)
 *
 * Esto nos permite ir migrando a backend SIN romper
 * las pantallas que ya consumen este hook (shop, detail, admin).
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import productsBase from "@/lib/productsBase";
import useProductStore from "@/store/productStore";

export default function useMergedProducts() {
  // productos que tengas en el admin (Zustand, cliente)
  const adminProducts = useProductStore((s) => s.products) as Product[];

  // estado para los que vengan del backend
  const [remoteProducts, setRemoteProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // efecto: intentar traer desde la API
  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      try {
        setLoading(true);
        const res = await fetch("/api/products", {
          method: "GET",
        });

        if (!res.ok) {
          throw new Error("Error al obtener productos del backend");
        }

        const data = await res.json();
        const apiProducts = (data.products || []) as Product[];

        if (!cancelled) {
          setRemoteProducts(apiProducts);
          setError(null);
        }
      } catch (err) {
        console.warn("[useMergedProducts] usando fallback local:", err);
        if (!cancelled) {
          setRemoteProducts(null);
          setError(
            err instanceof Error ? err.message : "Error desconocido en API"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  // merge final
  const products = useMemo<Product[]>(() => {
    // 1) fuente elegida: si hay backend, usamos backend
    const source = remoteProducts ?? adminProducts;

    // 2) Unimos con los base. Los admin/remotos pisan a los base.
    const map = new Map<string, Product>();

    // base primero
    productsBase.forEach((p) => {
      map.set(p.id, p);
    });

    // luego los que vienen de API o del admin
    source.forEach((p) => {
      map.set(p.id, p);
    });

    return Array.from(map.values());
  }, [remoteProducts, adminProducts]);

  return {
    products,
    loading,
    error,
    // lo dejo expuesto por si en admin quieres saber si vienes de API o de local
    source: remoteProducts ? "api" : "local",
  };
}
