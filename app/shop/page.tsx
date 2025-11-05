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
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, [products]);

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
              {lastError ? (
                <span className="ml-2 text-red-400">{lastError}</span>
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
