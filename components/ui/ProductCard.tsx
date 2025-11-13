/**
 * ProductCard
 * ------------------------------------------------------------
 * Tarjeta individual de producto usada en la tienda (/shop).
 *
 * ✅ Tipado con Product (lib/types.ts)
 * ✅ Maneja sizes opcionales
 * ✅ Añadir directo si NO hay tallas o hay solo 1
 * ✅ Usa placeholder desde lib/constants
 */

"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useCartStore from "@/store/cartStore";
import type { Product } from "@/lib/types";
import { PRODUCT_PLACEHOLDER_IMAGE } from "@/lib/constants";

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const addToCart = useCartStore((s) => s.addToCart);

  const hasSizes =
    Array.isArray(product.sizes) && product.sizes.length > 1;
  const hasSingleSize =
    Array.isArray(product.sizes) && product.sizes.length === 1;

  const handleAdd = () => {
    // si tiene varias tallas → ir al detalle
    if (hasSizes) {
      router.push(`/products/${product.id}`);
      return;
    }

    // si tiene 1 sola talla → añadimos con esa
    if (hasSingleSize) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        qty: 1,
        image: product.image || PRODUCT_PLACEHOLDER_IMAGE,
        size: product.sizes![0], // seguro porque hasSingleSize
      });
      return;
    }

    // si no tiene tallas → añadir normal
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      qty: 1,
      image: product.image || PRODUCT_PLACEHOLDER_IMAGE,
    });
  };

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-neutral-800/70 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-md hover:border-yellow-400/80 hover:shadow-[0_0_40px_rgba(250,204,21,0.25)] hover:-translate-y-[3px] transition-transform duration-300">
      {/* Imagen del producto */}
      <div className="relative w-full aspect-[4/5] bg-neutral-950">
        <Image
          src={product.image || PRODUCT_PLACEHOLDER_IMAGE}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Faja sutil en la parte inferior para dar contraste al texto */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      </div>

      {/* Contenido */}
      <div className="flex flex-col gap-2.5 p-3.5 sm:p-4">
        <div>
          <h3 className="text-sm sm:text-base font-semibold tracking-tight">
            {product.name}
          </h3>

          {product.desc ? (
            <p className="mt-1 text-xs sm:text-sm text-neutral-400 line-clamp-2">
              {product.desc}
            </p>
          ) : null}

          {(hasSizes || hasSingleSize) && (
            <p className="mt-2 text-[11px] uppercase tracking-wide text-neutral-500">
              Tallas:{" "}
              <span className="text-neutral-100">
                {hasSizes ? "Varias tallas" : product.sizes![0]}
              </span>
            </p>
          )}

          <p className="mt-3 text-sm sm:text-base font-bold text-yellow-400">
            €{product.price.toFixed(2)}
          </p>
        </div>

        {/* Botones de acción */}
        <div className="mt-2 flex flex-col sm:flex-row gap-2">
          <Link
            href={`/products/${product.id}`}
            className="inline-flex flex-1 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900/70 px-4 py-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-neutral-200 hover:border-yellow-400 hover:text-yellow-300 transition"
          >
            Ver
          </Link>

          <button
            onClick={handleAdd}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-yellow-400 px-4 py-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-black shadow-lg shadow-yellow-400/40 hover:bg-yellow-300 active:scale-95 transition"
          >
            Añadir
          </button>
        </div>
      </div>
    </article>
  );
}
