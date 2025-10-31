"use client";

/**
 * ShopPage
 * ------------------------------------------------------------
 * Página principal de la tienda / catálogo.
 *
 * ✅ Qué hace:
 * - Intenta cargar productos desde la API (/api/products)
 * - Si la API falla → usa los productos del store (Zustand)
 * - Siempre completa con los productos base (lib/productsBase)
 * - Muestra la fuente usada: API / Local / Base
 * - Renderiza las tarjetas con <ProductCard />
 * - Botón rápido al carrito
 */

import Link from "next/link";
import ClientOnly from "@/components/layout/ClientOnly";
import ProductCard from "@/components/ui/ProductCard";
import useCartStore from "@/store/cartStore";
import useMergedProducts from "@/lib/useMergedProducts";

export default function ShopPage() {
  // Estado global del carrito (Zustand)
  const cartCount = useCartStore((s) => s.countItems());

  // Productos combinados: api → local → base
  const { products, source, loading, error } = useMergedProducts();

  return (
    <ClientOnly>
      <div className="text-white">
        {/* Header de la tienda */}
        <section className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tight font-display">
              Skater Shop
            </h1>
            <p className="text-neutral-400 max-w-md text-sm leading-relaxed">
              Ropa inspirada en la calle, hecha para patinar. Drop limitado.
            </p>

            {/* Fuente de productos */}
            <p className="mt-2 text-[11px] text-neutral-500">
              Fuente:{" "}
              <span
                className={
                  source === "api"
                    ? "text-green-400"
                    : source === "local"
                    ? "text-yellow-400"
                    : "text-neutral-300"
                }
              >
                {source === "api"
                  ? "API"
                  : source === "local"
                  ? "Local (Zustand)"
                  : "Base"}
              </span>
              {error ? (
                <span className="ml-2 text-red-400">{error}</span>
              ) : null}
            </p>
          </div>

          {/* Acceso rápido al carrito */}
          <Link
            href="/cart"
            className="text-sm bg-yellow-400 text-black font-semibold py-2 px-4 rounded-xl hover:bg-yellow-300 transition"
          >
            🛒 Carrito ({cartCount})
          </Link>
        </section>

        {/* Estados de carga / vacío / lista */}
        {loading ? (
          <p className="text-neutral-500 text-sm mt-10">
            Cargando productos...
          </p>
        ) : products.length === 0 ? (
          <p className="text-neutral-500 text-sm mt-10">
            No hay productos disponibles todavía.
          </p>
        ) : (
          <section className="grid md:grid-cols-2 gap-6 mt-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </section>
        )}
      </div>
    </ClientOnly>
  );
}
