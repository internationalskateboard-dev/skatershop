/**
 * ProductCard
 * ------------------------------------------------------------
 * Tarjeta individual de producto usada en la tienda (/shop).
 *
 * ✅ Qué hace:
 * - Muestra imagen, nombre, precio y descripción corta.
 * - Incluye botones “Ver” y “Añadir”.
 * - Si el producto tiene varias tallas → redirige al detalle.
 * - Si tiene 1 sola talla → añade directo al carrito con esa talla.
 * - Si no tiene tallas → añade directo al carrito.
 *
 * ✅ Mejoras hechas en esta versión:
 * 1. Se tipó el producto (se evitó `any`).
 * 2. Se manejó el caso de “una sola talla”.
 * 3. Se hizo el precio seguro (Number(...).toFixed(2)).
 * 4. Se extrajo el placeholder a `lib/constants.ts`.
 */

"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useCartStore from "@/store/cartStore";
import { PRODUCT_PLACEHOLDER_IMAGE } from "@/lib/constants";

// Tipado básico del producto para la tarjeta.
// Si luego tu producto real tiene más campos, puedes extender esta interfaz aquí
// sin tocar el resto de componentes.
type ProductCardProduct = {
  id: string;
  name: string;
  price: number | string;
  desc?: string;
  image?: string;
  sizes?: string[]; // ← viene del admin o de productsBase
};

type ProductCardProps = {
  product: ProductCardProduct;
};

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const addToCart = useCartStore((s) => s.addToCart);

  // ¿Tiene varias tallas?
  const hasMultipleSizes =
    Array.isArray(product.sizes) && product.sizes.length > 1;

  // ¿Tiene exactamente una talla?
  const singleSize =
    Array.isArray(product.sizes) && product.sizes.length === 1
      ? product.sizes[0]
      : undefined;

  const handleAdd = () => {
    // 🔁 Si tiene varias tallas → obligamos a ir al detalle para que elija
    if (hasMultipleSizes) {
      router.push(`/products/${product.id}`);
      return;
    }

    // 🔹 Si tiene 1 sola talla o ninguna → añadimos directo al carrito
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price ?? 0), // aseguramos number
      qty: 1,
      image: product.image,
      ...(singleSize ? { size: singleSize } : {}),
    });
  };

  return (
    <div className="border border-neutral-800 bg-neutral-900 rounded-2xl overflow-hidden shadow-md hover:shadow-yellow-400/20 transition duration-300 flex flex-col">
      {/* Imagen del producto */}
      <div className="relative w-full aspect-square">
        <Image
          src={product.image || PRODUCT_PLACEHOLDER_IMAGE}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Contenido */}
      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <p className="text-neutral-400 text-sm mt-1 line-clamp-2">
            {product.desc}
          </p>
          <p className="text-yellow-400 font-bold mt-2">
            €{Number(product.price ?? 0).toFixed(2)}
          </p>
        </div>

        {/* Botones de acción */}
        <div className="mt-4 flex justify-end gap-3">
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
