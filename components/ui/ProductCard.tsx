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
    <div className="border border-neutral-800 bg-neutral-900 rounded-2xl overflow-hidden shadow-md hover:shadow-yellow-400/20 transition duration-300 flex flex-col">
      {/* Imagen del producto */}
      <div className="relative w-full aspect-square bg-neutral-950">
        <Image
          src={product.image || PRODUCT_PLACEHOLDER_IMAGE}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Contenido */}
      <div className="p-4 flex flex-col flex-grow justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{product.name}</h3>
          {product.desc ? (
            <p className="text-neutral-400 text-sm mt-1 line-clamp-2">
              {product.desc}
            </p>
          ) : null}
          <p className="text-yellow-400 font-bold mt-2">
            €{product.price.toFixed(2)}
          </p>
        </div>

        {/* Botones de acción */}
        <div className="mt-2 flex justify-end gap-3">
          <Link
            href={`/products/${product.id}`}
            className="text-xs font-bold bg-neutral-800 border border-neutral-700 px-4 py-2 rounded-lg hover:border-yellow-400 hover:text-yellow-400 transition"
          >
            Ver
          </Link>

          <button
            onClick={handleAdd}
            className="text-xs font-bold bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-300 active:scale-95 transition"
          >
            Añadir
          </button>
        </div>
      </div>
    </div>
  );
}
