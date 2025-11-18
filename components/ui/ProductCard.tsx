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
import { useState, useMemo, useEffect } from "react";

export default function ProductCard({ product }: { product: Product }) {
  // ------------------
  const [quantity, setQuantity] = useState(1);

  //
  const router = useRouter();
  // Define los metodos para administrar los datos que se almacenan en el carrito!
  const { cart, addToCart } = useCartStore((s) => ({
    cart: s.cart,
    addToCart: s.addToCart,
  }));
  //
  const hasSizes = Array.isArray(product.sizes) && product.sizes.length > 1;
  //
  const hasSingleSize =
    Array.isArray(product.sizes) && product.sizes.length === 1;
  //
  const hasColor = Array.isArray(product.colors) && product.colors.length > 1;
  
  // Variables de estado
  const [selectedColorName, setSelectedColorName] = useState<string | null>(
    null
  );
  
    // imagen actual según el color seleccionado (o la del producto) (Revisar si es solo local)
    const currentImage = useMemo(() => {
      
      if (!product) return PRODUCT_PLACEHOLDER_IMAGE;
  
      const baseImage = product.image || PRODUCT_PLACEHOLDER_IMAGE;
  
      if (product.colors && product.colors.length > 0) {
        const activeName = selectedColorName ?? product.colors[0]?.name ?? null;
  
        const activeColor =
          (activeName && product.colors.find((c) => c.name === activeName)) ||
          product.colors[0];
  
        return activeColor?.image || baseImage;
      }
  
      return baseImage;
    }, [product, selectedColorName]);
  
  
  //
  const handleAdd = () => {

const chosenColorName =
    selectedColorName ||
    (product.colors && product.colors.length > 0
      ? product.colors[0].name
      : undefined);

      // si tiene varias tallas → ir al detalle
    if (hasSizes) {
      router.push(`/products/${product.id}`);
      return;
    }

    // si Varios Colores Disponibles Te lleva a esoger un color
    if (hasColor && hasSingleSize) {
      // router.push(`/products/${product.id}`);
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        qty: quantity,
        image: currentImage || PRODUCT_PLACEHOLDER_IMAGE,
        size: product.sizes![0],
        colorName: chosenColorName,
      });
      return;
    }

    

    // si tiene 1 sola talla → añadimos con esa
    if (hasSingleSize) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        qty: quantity,
        image: currentImage || PRODUCT_PLACEHOLDER_IMAGE,
        size: product.sizes![0], // seguro porque hasSingleSize
      });
      return;
    }

    // si no tiene tallas (ONE SIZE), ni Colores → añadir normal
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      qty: quantity,
      image: product.image || PRODUCT_PLACEHOLDER_IMAGE,
    });
  };

  // 👉 Sacamos un string con los nombres de los colores, si existen
  /* const colorNames =
    product.colors && product.colors.length > 0
      ? product.colors.map((c) => c.name).join(", ")
      : null; */

  // helper para convertir el nombre del color en algo que entienda CSS
  const cssColorFromName = (name: string) =>
    name.toLowerCase().replace(/\s+/g, "");

  /* ·········································································· */

// Entra cuando cambia el producto o el carrito → sincronizar estado local
  useEffect(() => {
    //
    if (!product) return;
 
    if (Array.isArray(product.colors) && product.colors.length >= 1) {
      setSelectedColorName(product.colors[0].name);
    }

  }, [product, cart]);








  // Verificar para crear una funcion global que se use en los componentes que llamen al contador
  // Función para cambiar cantidad
  const handleQuantityChange = (delta: number) => {
    setQuantity((q) => {
      const next = q + delta;
      // mínimo 1, máximo 10 (puedes ajustar)
      return Math.min(10, Math.max(1, next));
    });
  };


  // cambiar color (solo afecta al estado local y a la imagen / addToCart)
  const handleSelectColor = (colorName: string) => {
    setSelectedColorName(colorName);
  };



  /* ·········································································· */

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-neutral-800/70 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-md hover:border-yellow-400/80 hover:shadow-[0_0_40px_rgba(250,204,21,0.25)] hover:-translate-y-[3px] transition-transform duration-300 ">

      {/* Ver Informacion del producto desde la imagen */}
      <Link href={`/products/${product.id}`}>

        {/* Imagen del producto */}
        <div className="relative w-full h-full aspect-[4/5] bg-neutral-950">
          <Image
            src={currentImage || PRODUCT_PLACEHOLDER_IMAGE}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Faja sutil en la parte inferior para dar contraste al texto */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </div>
      </Link>

      {/* Detalles del producto */}
      <div className="flex flex-col gap-2.5 p-3.5 sm:p-4">
        <div>
          {/* Nombre del Producto */}
          <h3 className="mb-1 text-sm sm:text-base font-semibold tracking-tight">
            {product.name}
          </h3>

          {/* Descripcion Corta del Producto */}
          {product.desc ? (
            <p className="mb-1 text-sm sm:text-sm text-neutral-400 line-clamp-2">
              {product.desc}
            </p>
          ) : null}

          {/* Tallas Disponibles */}
          {(hasSizes || hasSingleSize) && (
            <p className="mb-1 text-xs uppercase tracking-wide text-neutral-500">
              Tallas:{" "}
              <span className="text-neutral-100">
                {/* hasSizes ? "Varias tallas" : product.sizes![0] */}
                {hasSizes ? product.sizes?.join(" - ") : product.sizes?.[0]}
              </span>
            </p>
          )}

          {/* Colores disponibles (chips visuales) */}
          {product.colors &&
            product.colors.length > 0 &&
            product.isClothing && (
              <div className="mb-1 flex items-center gap-2">
                <span className="text-xs text-neutral-300 uppercase tracking-wide">
                  Colores:
                </span>

                <div className="flex items-center gap-1.5">
                  {product.colors.slice(0, 4).map((c) => (
                    <button
                      type="button"
                      key={c.name}
                      onClick={() => handleSelectColor(c.name)} // Verificar el si solo afecta el estado local de data
                      className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border ring-1 ${
                        selectedColorName === c.name
                          ? "border-yellow-400 ring-yellow-400 scale-110"
                          : "border-neutral-700 ring-black/40"
                      } transition-transform`}
                      style={{
                        backgroundColor: cssColorFromName(c.name),
                      }}
                      title={c.name}
                    />
                  ))}

                  {product.colors.length > 4 && (
                    <span className="text-[10px] text-neutral-400">
                      + {product.colors.length - 4}
                    </span>
                  )}
                </div>
              </div>
            )}

          {/* Cantidad disponible */}           
            <p className="mb-1 text-xs uppercase tracking-wide text-neutral-500">
              STOCK:{" "} <span className="text-green-400">{product.stock}</span>
            </p>
          
          {/* Precio */}
          <p className="mb-1 text-xs sm:text-base font-bold text-yellow-400">
            <span className="flex items-center mt-1 sm:text-sm line-clamp-2 ">
              €{product.price.toFixed(2)}
            </span>
          </p>
        </div>

        {/* ################## Botones de acción ######################### */}

        <div className="mt-2 flex flex-col sm:flex-row gap-2">
          {/* ------
          <Link
            href={`/products/${product.id}`}
            className="inline-flex flex-1 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900/70 px-4 py-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-neutral-200 hover:border-yellow-400 hover:text-yellow-300 transition"
          >
            Detalles
          </Link>
          */}

          {/* Selector de cantidad */}

          <div className="inline-flex flex-1 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900/70 px-4 py-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-neutral-200 hover:border-yellow-400 hover:text-yellow-300 transition">
            <button
              type="button"
              onClick={() => handleQuantityChange(-1)}
              className="w-7 h-7 flex items-center justify-center rounded-full border border-neutral-700 hover:border-yellow-400 hover:text-yellow-300 transition"
              aria-label="Disminuir cantidad"
            >
              −
            </button>
            <span className="mx-3 min-w-[1.5rem] text-center font-semibold">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => handleQuantityChange(1)}
              className="w-7 h-7 flex items-center justify-center rounded-full border border-neutral-700 hover:border-yellow-400 hover:text-yellow-300 transition"
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>
        </div>

        <button
          onClick={handleAdd}
          className="inline-flex flex-1 items-center justify-center rounded-full bg-yellow-400 px-4 py-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-black shadow-lg shadow-yellow-400/40 hover:bg-yellow-300 active:scale-95 transition"
        >
          <span className="mr-2 text-sm">🛒</span>
        </button>
        {/* ################## /Botones de acción ######################### */}
      </div>
    </article>
  );
}
