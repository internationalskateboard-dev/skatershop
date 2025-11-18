"use client";

/**
 * ProductDetailPage
 * ------------------------------------------------------------
 * - Busca el producto en la fuente unificada (base + admin)
 * - Muestra imagen, nombre, detalles, precio
 * - Maneja tallas
 * - Sincroniza talla, cantidad y color con el carrito
 *
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

  // Estado local de carga para mostrar "Cargando..."
  const [loading, setLoading] = useState(true);
  //
  const router = useRouter();
  //
  const params = useParams();

  // en Next 13/14 con app router, params.id puede venir como string o string[]
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

  // Define el objeto productos
  const { products } = useMergedProducts();

  // Define los metodos para administrar los datos que se almacenan en el carrito!
  const { cart, addToCart, setItemSize } = useCartStore((s) => ({
    cart: s.cart,
    addToCart: s.addToCart,
    setItemSize: s.setItemSize,
  }));

  // buscar producto en el array unificado de la base (No comprendo aun esta funcion)
  const product = useMemo<Product | undefined>(
    () => products.find((p) => p.id === id),
    [products, id]
  );

  // Variables de estado
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    kind: "success",
    text: "",
  });
  const [quantity, setQuantity] = useState(1);
  const [selectedColorName, setSelectedColorName] = useState<string | null>(
    null
  );

  // Definicion de objeto Notificaciones libreria (...?)
  const showToast = (kind: ToastState["kind"], text: string, ms = 2200) => {
    setToast({ show: true, kind, text });
    window.setTimeout(() => setToast((t) => ({ ...t, show: false })), ms);
  };

  /* ------------------------------------------------------ */
  // Entra cuando cambia el producto o el carrito → sincronizar estado local
  useEffect(() => {
    //
    if (!product) return;
    // Selecciona la primera talla por defecto
    if (Array.isArray(product.sizes) && product.sizes.length >= 1) {
      setSelectedSize(product.sizes[0]);
    }

    if (Array.isArray(product.colors) && product.colors.length >= 1) {
      setSelectedColorName(product.colors[0].name);
    }

  }, [product, cart]);
  /* ------------------------------------------------------ */

  // helper para convertir el nombre del color en algo que entienda CSS
  const cssColorFromName = (name: string) =>
    name.toLowerCase().replace(/\s+/g, "");

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

  // si no se encontró el producto (Revisar si es solo local)
  // Falta Revisar esta parte para colocar cargando mientras busca el producto.
  if (!product) {
    return (
      <div className="text-white text-center py-20">
        <p className="text-neutral-400 mb-6">
          Producto no encontrado. Revisar Para poner condicion Cargando...
        </p>
        <Link
          href="/shop"
          className="text-sm bg-yellow-400 text-black font-semibold py-2 px-4 rounded-xl hover:bg-yellow-300 transition"
        >
          ← Volver a la tienda
        </Link>
      </div>
    );
  }
  // Para verificar si tiene medidas el producto
  const hasSizes = Array.isArray(product.sizes) && product.sizes.length > 0;

  // Agrega la talla en el carrito al seleccionar una medida o talla.
  const handleSelectSize = (size: string) => {
    // 
    setSelectedSize(size);
  };

  // cambiar color (solo afecta al estado local y a la imagen / addToCart)
  const handleSelectColor = (colorName: string) => {
    setSelectedColorName(colorName);
  };

  // Función para cambiar cantidad
  const handleQuantityChange = (delta: number) => {
    setQuantity((q) => {
      const next = q + delta;
      // mínimo 1, máximo 10 (puedes ajustar)
      return Math.min(10, Math.max(1, next));
    });
  };

  // Accion al hacer click Añadir o si ya esta en el carrito (Corregir si ya esta en el carrito esa parte se va a modificar)
  const handleAddToCart = () => {
  if (hasSizes && !selectedSize) {
    showToast("error", "Selecciona una talla antes de añadir.");
    return;
  }

  const chosenSize =
    selectedSize ||
    (Array.isArray(product.sizes) && product.sizes.length === 1
      ? product.sizes[0]
      : undefined);

  const chosenColorName =
    selectedColorName ||
    (product.colors && product.colors.length > 0
      ? product.colors[0].name
      : undefined);

  addToCart({
    id: product.id,
    name: product.name,
    price: product.price,
    qty: quantity,
    image: currentImage,
    size: chosenSize,
    colorName: chosenColorName,
  });

  setAdded(true);
  showToast("success", "Producto añadido al carrito 🛒");
};


  // --------------------------------------------------------------------
  return (
    <div className="relative max-w-5xl mx-auto px-6 text-white grid md:grid-cols-2 gap-8">
      <div className="md:col-span-2 mb-0">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900/70 px-4 py-2 text-sm font-semibold text-neutral-100 hover:border-yellow-400 hover:text-yellow-300 active:scale-95 transition-all"
        >
          <span className="text-lg">←</span>
          <span>Volver</span>
        </button>
      </div>

      {/* Imagen del Producto */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950">
        <Image
          src={currentImage}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex flex-col justify-between">
        <div>
          {/* Nombre del producto */}
          <h1 className="text-3xl font-bold mb-3">{product.name}</h1>

          {/* Details Una descripcion detallada del producto */}
          <p className="text-neutral-400 text-sm mb-2 leading-relaxed">
            {product.details ||
              product.desc ||
              "Producto de la colección SkaterShop."}
          </p>

          {/* Precio */}
          <p className="text-yellow-400 font-bold text-xl mb-2">
            €{product.price.toFixed(2)}
          </p>

          {/* Colores disponibles (chips visuales) */}
          {product.colors &&
            product.colors.length > 0 &&
            product.isClothing && (
              <div className="mb-3 flex items-center gap-2">
                <span className="text-sm text-neutral-300 uppercase tracking-wide">
                  Colores:
                </span>

                <div className="flex items-center gap-1.5">
                  {product.colors.slice(0, 5).map((c) => (
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

                  {product.colors.length > 5 && (
                    <span className="text-[10px] text-neutral-400">
                      + {product.colors.length - 5}
                    </span>
                  )}
                </div>
              </div>
            )}

          {/* Selector de tallas */}
          {hasSizes && (
            <div className="mb-2">
              <div className="flex items-center gap-2 text-sm text-neutral-300 uppercase">
                <span>Tallas:</span>

                <div className="flex items-center gap-1.5">
                  {product.sizes!.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSelectSize(size)}
                      className={`px-3 py-1 rounded-lg font-semibold border transition ${
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
              </div>

              <div className="block text-neutral-500">
                {!selectedSize && !added && (
                  <p className="mt-2 text-xs">
                    Elige una talla para añadir al carrito.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Guía de tallas (si existe) */}
          {product.isClothing && product.sizeGuide ? (
            <div className="mt-4 bg-neutral-900/40 border border-neutral-800 rounded-lg p-3">
              <p className="text-xs text-neutral-300 font-semibold mb-2">
                Guía de tallas / medidas
              </p>
              <pre className="text-[11px] text-neutral-400 whitespace-pre-line">
                {product.sizeGuide}
              </pre>
            </div>
          ) : null}

          {/* Cantidad Disponible por tallas */}
          {hasSizes && product.colors && product.colors.length > 0 ? (
            <div className="mb-2 mt-4 flex items-center gap-2">
              <span className="text-sm text-neutral-300 uppercase tracking-wide">
                Disp:
              </span>

              <div className="flex items-center gap-1.5">
                Tiene color y talla
              </div>
            </div>
          ) : (
            <div className="mb-2 mt-2 flex items-center gap-2">
              <span className="text-sm text-neutral-300 uppercase tracking-wide">
                Disp:
              </span>

              {Number(product.stock) > 0 ? (
                <div className="flex items-center gap-1.5 text-green-500">
                  {product.stock}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-red-500">
                  {product.stock}
                </div>
              )}
            </div>
          )}
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
          {/* Boton Añadir */}
<button
              onClick={handleAddToCart}
              disabled={added && !hasSizes}
              className={`${
                added && !hasSizes
                  ? "bg-neutral-800 text-neutral-400 cursor-not-allowed border border-neutral-700"
                  : "bg-yellow-400 text-black hover:bg-yellow-300"
              } font-bold py-3 px-6 rounded-xl active:scale-95 transition uppercase tracking-wide`}
              aria-live="polite">
                Añadir 🛒
            </button>

            {/* Si ya fue agregado  este articulo Ver que se puede hacer o borrar al depurar */}
          {!added ? (
            <></>
          ) : (
            <></>
          )}

          

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
