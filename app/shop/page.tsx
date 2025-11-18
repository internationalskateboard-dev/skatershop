"use client";

/**
 * ShopPage
 * ------------------------------------------------------------
 * Página principal de la tienda / catálogo.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import ClientOnly from "@/components/layout/ClientOnly";
import ProductCard from "@/components/ui/ProductCard";
import useCartStore from "@/store/cartStore";
import useMergedProducts from "@/lib/useMergedProducts";
import {
  AdminDataSourceProvider,
  useAdminDataSource,
} from "@/components/admin/AdminDataSourceContext";

// Componente que Next usa como página
export default function ShopPage() {
  // Aquí SOLO envolvemos con el provider
  return (
    <AdminDataSourceProvider>
      <ShopPageWithContext />
    </AdminDataSourceProvider>
  );
}

// Componente real que usa el contexto, productos, etc.
function ShopPageWithContext() {
  // Estado global del carrito (Zustand)
  const cartCount = useCartStore((s) => s.countItems());

  // Productos combinados: base + admin
  const { products } = useMergedProducts();

  // Contexto de admin (fuente de datos, errores, etc.)
  const { source, lastError } = useAdminDataSource();

  // Estado local de carga para mostrar "Cargando..."
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Pequeño delay para que se vea el estado de carga
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, [products]);

  return (
    <ClientOnly>
      {/* <div className="text-white bg-neutral-950 min-h-screen"> */}
      <div className="text-white bg-neutral-900 min-h-screen">
        
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 sm:pt-6">
          {/* Header de la tienda */}
          <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight font-display">
                Skater Shop
              </h1>
              <p className="text-neutral-300 max-w-md text-xs sm:text-sm leading-relaxed mt-1">
                Ropa inspirada en la calle, hecha para patinar. Drop limitado.
              </p>

              {/* Fuente de productos */}
              <p className="mt-1 text-[11px] sm:text-xs text-neutral-500">
                Fuente:{" "}
                <span
                  className={
                    source === "db"
                      ? "text-green-400"
                      : source === "api"
                      ? "text-blue-400"
                      : source === "local"
                      ? "text-yellow-400"
                      : "text-neutral-300"
                  }
                >
                  {source === "db"
                    ? "BD (Prisma/Postgres)"
                    : source === "api"
                    ? "API externa"
                    : source === "local"
                    ? "Local (Zustand)"
                    : "Base"}
                </span>
                {lastError ? (
                  <span className="ml-2 text-red-400">{lastError}</span>
                ) : null}
              </p>
            </div>

            {/* Acceso rápido al carrito */}
            <div className="sm:self-auto">
              <Link
                href="/cart"
                className="inline-flex items-center justify-center w-full sm:w-auto rounded-full bg-yellow-400/90 text-black font-semibold text-xs sm:text-sm px-4 py-2 shadow-lg shadow-yellow-400/30 hover:bg-yellow-300 transition"
              >
                <span className="mr-2 text-sm">🛒</span>
                <span>Carrito ({cartCount})</span>
              </Link>
            </div>
          </section>

          {/* Estados de carga / vacío / lista Falta corregir para cuando loading sea false! */}
          {loading ? (
            <p className="text-neutral-500 text-sm mt-6">
              Cargando productos... 
            </p>
          ) : loading! && products.length === 0 ? (
            <p className="text-neutral-500 text-sm mt-6">
              No hay productos disponibles todavía.
            </p>
          ) : (
            <section className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </section>
          )}
        </main>
      </div>
    </ClientOnly>
  );
}
