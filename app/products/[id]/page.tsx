"use client";

/**
 * ProductDetailPage
 * ------------------------------------------------------------
 * - Busca el producto en la fuente unificada (base + admin)
 * - Muestra imagen, nombre, detalles, precio
 * - Maneja tallas:
 *    → si tiene tallas, pide seleccionarla
 *    → si no tiene, añade directo
 *    → si tiene 1 sola talla, la preselecciona
 * - Si el producto YA está en el carrito → muestra "Ya en carrito ✅"
 * - Permite cambiar la talla de un item que ya estaba en el carrito
 * - Usa placeholder global de imagen
 */

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import useMergedProducts from "@/lib/useMergedProducts";
import useCartStore from "@/store/cartStore";
import { PRODUCT_PLACEHOLDER_IMAGE } from "@/lib/constants";
import type { Product } from "@/lib/types";

type ToastState = { show: boolean; kind: "success" | "error"; text: string };

export default function ProductDetailPage() {

  const router = useRouter();

  const params = useParams();
  // en Next 13/14 con app router, params.id puede venir como string o string[]
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

  const { products } = useMergedProducts();

  const { cart, addToCart, setItemSize } = useCartStore((s) => ({
    cart: s.cart,
    addToCart: s.addToCart,
    setItemSize: s.setItemSize,
  }));

  // buscar producto en el array unificado
  const product = useMemo<Product | undefined>(
    () => products.find((p) => p.id === id),
    [products, id]
  );

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    kind: "success",
    text: "",
  });
// 
const [quantity, setQuantity] = useState(1);




  const showToast = (kind: ToastState["kind"], text: string, ms = 2200) => {
    setToast({ show: true, kind, text });
    window.setTimeout(() => setToast((t) => ({ ...t, show: false })), ms);
  };

  // cuando cambia el producto o el carrito → sincronizar estado local
useEffect(() => {
  if (!product) return;

  // si tiene exactamente 1 talla → la dejamos ya marcada
  if (Array.isArray(product.sizes) && product.sizes.length === 1) {
    setSelectedSize(product.sizes[0]);
  } else {
    setSelectedSize(null);
  }

  const inCart = cart.find((i) => i.id === product.id);
  if (inCart) {
    setAdded(true);

    // si en carrito había talla → también la traemos
    if (inCart.size) {
      setSelectedSize(inCart.size);
    }

    // sincronizar cantidad con la del carrito
    if (typeof inCart.qty === "number") {
      setQuantity(inCart.qty);
    } else {
      setQuantity(1);
    }
  } else {
    setAdded(false);
    // si no está en carrito, por defecto cantidad 1
    setQuantity(1);
  }

  // ocultar toast cuando cambie de producto
  setToast((t) => ({ ...t, show: false }));
}, [product, cart]);


  // si no se encontró el producto
  if (!product) {
    return (
      <div className="text-white text-center py-20">
        <p className="text-neutral-400 mb-6">Producto no encontrado.</p>
        <Link
          href="/shop"
          className="text-sm bg-yellow-400 text-black font-semibold py-2 px-4 rounded-xl hover:bg-yellow-300 transition"
        >
          ← Volver a la tienda
        </Link>
      </div>
    );
  }

  const hasSizes =
    Array.isArray(product.sizes) && product.sizes.length > 0;

  const handleSelectSize = (size: string) => {
    setSelectedSize(size);
    // si ya estaba en carrito → actualizamos también en el store
    const inCart = cart.find((i) => i.id === product.id);
    if (inCart) {
      setItemSize(product.id, size);
      showToast("success", "Talla cambiada en el carrito ✅");
    }
  };
  
  // Función para cambiar cantidad
  const handleQuantityChange = (delta: number) => {
    setQuantity((q) => {
      const next = q + delta;
      // mínimo 1, máximo 10 (puedes ajustar)
      return Math.min(10, Math.max(1, next));
    });
  };



  //
  const handleAddToCart = () => {
    // si tiene tallas pero no hay ninguna seleccionada
    if (hasSizes && !selectedSize) {
      showToast("error", "Selecciona una talla antes de añadir.");
      return;
    }

    // si tiene tallas y no se seleccionó pero solo tiene 1 → usa esa
    const chosenSize =
      selectedSize ||
      (Array.isArray(product.sizes) && product.sizes.length === 1
        ? product.sizes[0]
        : undefined);

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      qty: quantity,
      image: product.image || PRODUCT_PLACEHOLDER_IMAGE,
      size: chosenSize,
    });

    setAdded(true);
    showToast("success", "Producto añadido al carrito 🛒");
  };

  return (
    <div className="relative max-w-5xl mx-auto py-10 px-6 text-white grid md:grid-cols-2 gap-8">

      <div className="md:col-span-2 mb-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900/70 px-4 py-2 text-sm font-semibold text-neutral-100 hover:border-yellow-400 hover:text-yellow-300 active:scale-95 transition-all"
          >
          <span className="text-lg">←</span>
          <span>Volver</span>
        </button>
      </div>

      {/* Imagen */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950">
        <Image
          src={product.image || PRODUCT_PLACEHOLDER_IMAGE}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex flex-col justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-3">{product.name}</h1>
          <p className="text-neutral-400 text-sm mb-4 leading-relaxed">
            {product.details || product.desc || "Producto de la colección SkaterShop."}
          </p>
          <p className="text-yellow-400 font-bold text-xl mb-6">
            €{product.price.toFixed(2)}
          </p>

          {/* Selector de tallas */}
          {hasSizes && (
            <div className="mb-6">
              <span className="block text-sm text-neutral-300 mb-2">
                Talla:
              </span>
              <div className="flex flex-wrap gap-2">
                {product.sizes!.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSelectSize(size)}
                    className={`px-3 py-1 rounded-lg text-sm font-semibold border transition ${
                      selectedSize === size
                        ? "bg-yellow-400 text-black border-yellow-400"
                        : "border-neutral-700 text-neutral-300 hover:border-yellow-400 hover:text-yellow-400"
                    }`}
                    aria-pressed={selectedSize === size}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {!selectedSize && !added && (
                <p className="mt-2 text-xs text-neutral-500">
                  Elige una talla para añadir al carrito.
                </p>
              )}
            </div>
          )}

          {/* Guía de tallas (si existe) */}
          {product.sizeGuide ? (
            <div className="mt-4 bg-neutral-900/40 border border-neutral-800 rounded-lg p-3">
              <p className="text-xs text-neutral-300 font-semibold mb-2">
                Guía de tallas / medidas
              </p>
              <pre className="text-[11px] text-neutral-400 whitespace-pre-line">
                {product.sizeGuide}
              </pre>
            </div>
          ) : null}
        </div>

        {/* Acciones */}
        <div className="mt-6 flex flex-wrap gap-3 items-center">

{/* Selector de cantidad */}
          <div className="inline-flex items-center rounded-full border border-neutral-700 bg-neutral-900/80 px-3 py-2 text-sm">
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


          <button
            onClick={handleAddToCart}
            disabled={added && !hasSizes}
            className={`${
              added && !hasSizes
                ? "bg-neutral-800 text-neutral-400 cursor-not-allowed border border-neutral-700"
                : "bg-yellow-400 text-black hover:bg-yellow-300"
            } font-bold py-3 px-6 rounded-xl active:scale-95 transition uppercase tracking-wide`}
            aria-live="polite"
          >
            {added ? "Ya en carrito ✅" : "Añadir al carrito"}
          </button>

          <Link
            href="/cart"
            className="text-sm font-semibold text-neutral-300 hover:text-yellow-400 transition flex items-center"
          >
            Ver carrito →
          </Link>

          {/* Pagar: solo si ya se añadió */}
          {added && (
            <Link
              href="/checkout"
              className="md:hidden text-sm font-bold bg-yellow-400 text-black py-3 px-6 rounded-xl hover:bg-yellow-300 active:scale-95 transition"
            >
              Pagar
            </Link>
          )}
        </div>
      </div>

      {/* Toast verde/rojo */}
      {toast.show && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed left-1/2 -translate-x-1/2 top-16 z-50 max-w-[90vw] md:max-w-md
              rounded-xl px-4 py-3 shadow-xl border
              ${
                toast.kind === "success"
                  ? "bg-green-900/90 border-green-600 text-green-200"
                  : "bg-red-900/90 border-red-600 text-red-200"
              }`}
        >
          <div className="text-sm font-medium">{toast.text}</div>
        </div>
      )}
    </div>
  );
}
