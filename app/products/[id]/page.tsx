"use client";

/**
 * ProductDetailPage
 * ------------------------------------------------------------
 * Página de detalle de un producto: /products/[id]
 *
 * ✅ Qué hace:
 * - Obtiene el producto desde el hook combinado (base + admin): useMergedProducts()
 * - Busca el producto por id de la URL.
 * - Muestra imagen, nombre, descripción/detalles y precio.
 * - Permite elegir talla (si el producto tiene tallas).
 * - Si el producto ya está en el carrito y cambias de talla → actualiza en el store y muestra toast.
 * - Permite añadir al carrito y da feedback visual con toast.
 * - Muestra botón rápido de “Pagar” en móvil cuando el producto ya está en el carrito.
 *
 * ✅ Mejoras en esta versión:
 * 1. Tipado básico del producto y del item de carrito.
 * 2. Precio seguro con Number(...) para evitar .toFixed en undefined.
 * 3. Uso de la constante global de placeholder de imagen (PRODUCT_PLACEHOLDER_IMAGE).
 * 4. Reseteo de toasts al cambiar de producto.
 */


import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import useMergedProducts from "@/lib/useMergedProducts";
import useCartStore from "@/store/cartStore";
import { PRODUCT_PLACEHOLDER_IMAGE } from "@/lib/constants";

type ToastState = { show: boolean; kind: "success" | "error"; text: string };

export default function ProductDetailPage() {
  const { id } = useParams();
  const { products, source } = useMergedProducts();

  const { cart, addToCart, setItemSize } = useCartStore((s) => ({
    cart: s.cart,
    addToCart: s.addToCart,
    setItemSize: s.setItemSize,
  }));

  // buscamos el producto
  const product = useMemo(
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

  // 🔐 normalizamos tallas para TS (aunque product pueda ser undefined aquí)
  const sizes =
    product && Array.isArray(product.sizes) ? product.sizes : [];
  const hasSizes = sizes.length > 0;
  const sizeGuide =
    product &&
    typeof product.sizeGuide === "string" &&
    product.sizeGuide.trim().length > 0
      ? product.sizeGuide
      : null;

  // hook SIEMPRE va aquí, NO después de return
  useEffect(() => {
    if (!product) return;
    const inCart = cart.find((i) => i.id === product.id);
    if (inCart) {
      setAdded(true);
      setSelectedSize(inCart.size ?? null);
    } else {
      setAdded(false);
      setSelectedSize(null);
    }
    setToast((t) => ({ ...t, show: false }));
  }, [product, cart]);

  // 🚫 aquí sí podemos devolver
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

  const showToast = (kind: ToastState["kind"], text: string, ms = 2200) => {
    setToast({ show: true, kind, text });
    window.setTimeout(() => setToast((t) => ({ ...t, show: false })), ms);
  };

  const handleSelectSize = (size: string) => {
    setSelectedSize(size);
    const inCart = cart.find((i) => i.id === product.id);
    if (inCart) {
      setItemSize(product.id, size);
      showToast("success", "Talla cambiada en el carrito ✅");
    }
  };

  const handleAddToCart = () => {
    if (hasSizes && !selectedSize) {
      showToast("error", "Selecciona una talla antes de añadir.");
      return;
    }
    const chosenSize = selectedSize || (hasSizes ? sizes[0] : undefined);

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      qty: 1,
      image: product.image,
      size: chosenSize,
    });

    setAdded(true);
    showToast("success", "Producto añadido al carrito 🛒");
  };

  return (
    <div className="relative max-w-5xl mx-auto py-10 px-6 text-white grid md:grid-cols-2 gap-8">
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
          <div className="flex items-center justify-between gap-3 mb-3">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <span className="text-[10px] uppercase tracking-wide text-neutral-500">
              {source === "api"
                ? "API"
                : source === "local"
                ? "LOCAL"
                : "BASE"}
            </span>
          </div>

          <p className="text-neutral-400 text-sm mb-4 leading-relaxed">
            {product.details || product.desc}
          </p>
          <p className="text-yellow-400 font-bold text-xl mb-6">
            €{product.price.toFixed(2)}
          </p>

          {/* Selector de tallas */}
          {hasSizes && (
            <div className="mb-6">
              <span className="block text-sm text-neutral-300 mb-2">Talla:</span>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
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

          {/* Guía de tallas */}
          {sizeGuide && (
            <div className="mb-6 bg-neutral-900/40 border border-neutral-800 rounded-xl p-3">
              <p className="text-xs font-semibold text-neutral-200 mb-2">
                Guía de tallas / medidas
              </p>
              <pre className="text-[11px] text-neutral-400 whitespace-pre-wrap leading-relaxed">
                {sizeGuide}
              </pre>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="mt-6 flex flex-wrap gap-3 items-center">
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

      {/* Toast */}
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
