/**
 * ShopPage
 * ------------------------------------------------------------
 * Página principal de la tienda / catálogo.
 * 
 * ✅ Qué hace:
 * - Muestra todos los productos disponibles combinando:
 *    → Los creados por el admin (productStore)
 *    → Los productos base precargados (lib/productsBase)
 * - Cada producto se muestra con <ProductCard />.
 * - Permite acceder al carrito o al detalle de producto.
 * 
 * 💡 Contexto:
 * - Esta es la página vinculada a la ruta `/shop`.
 * - Sustituye la antigua `/products` como catálogo principal.
 * - Usa `ClientOnly` para evitar errores de SSR,
 *   ya que `useCartStore` y `useMergedProducts` viven en el cliente.
 */

"use client";

import Link from "next/link";
import ClientOnly from "@/components/layout/ClientOnly";
import ProductCard from "@/components/ui/ProductCard";
import useCartStore from "@/store/cartStore";
import useMergedProducts from "@/lib/useMergedProducts";

export default function ShopPage() {
  // Estado global del carrito (Zustand)
  const cartCount = useCartStore((s) => s.countItems());

  // Productos combinados: admin + base
  const { products } = useMergedProducts();

  return (
    <ClientOnly>
      <div className="text-white">
        {/* Header de la tienda */}
        <section className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tight font-display">
              Skater Shop
            </h1>
            <p className="text-neutral-400 max-w-md text-sm leading-relaxed">
              Ropa inspirada en la calle, hecha para patinar. Drop limitado.
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

        {/* Render condicional: productos o aviso vacío */}
        {products.length === 0 ? (
          <p className="text-neutral-500 text-sm mt-10">
            No hay productos disponibles todavía.
          </p>
        ) : (
          <section className="grid md:grid-cols-2 gap-6 mt-10">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </section>
        )}
      </div>
    </ClientOnly>
  );
}
