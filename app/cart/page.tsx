"use client";

/**
 * CartPage
 * ------------------------------------------------------------
 * Página del carrito del usuario.
 *
 * ✅ Qué hace:
 * - Lista todos los items del carrito (Zustand).
 * - Permite aumentar / disminuir cantidad.
 * - Permite quitar un producto.
 * - Muestra talla si el item tiene `size`.
 * - Muestra imagen (con placeholder global).
 * - Muestra total final.
 *
 * ✅ Mejoras de esta versión:
 * - Uso obligatorio de PRODUCT_PLACEHOLDER_IMAGE para no romper la UI.
 * - Precio seguro (Number(...).toFixed(2)).
 * - updateQty protegido: no dejar cantidad < 1.
 * - Comentarios actualizados.
 */

import ClientOnly from "@/components/layout/ClientOnly";
import useCartStore from "@/store/cartStore";
import Link from "next/link";
import Image from "next/image";
import { PRODUCT_PLACEHOLDER_IMAGE } from "@/lib/constants";

export default function CartPage() {
  // extraemos todo el estado que necesitamos
  const { cart, removeFromCart, updateQty, clearCart, total } = useCartStore();

  // helper para actualizar cantidad sin dejarla en 0 o negativo
  const handleUpdateQty = (id: string, nextQty: number) => {
    const safeQty = Math.max(1, nextQty);
    updateQty(id, safeQty);
  };

  // carrito vacío
  if (cart.length === 0) {
    return (
      <ClientOnly>
        <div className="text-white">
          <h2 className="text-2xl font-bold mb-4">Tu Carrito</h2>
          <p className="text-neutral-400">El carrito está vacío.</p>
          <Link
            href="/shop"
            className="inline-block mt-6 bg-yellow-400 text-black font-semibold py-3 px-5 rounded-xl hover:bg-yellow-300 transition"
          >
            Ir a la tienda
          </Link>
        </div>
      </ClientOnly>
    );
  }

  // carrito con items
  return (
    <ClientOnly>
      <div className="text-white">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Tu Carrito</h2>

          {/* ✅ Vaciar carrito */}
          <button
            onClick={clearCart}
            className="text-xs font-semibold bg-red-800 border border-red-100 text-neutral-200 px-3 py-2 rounded-lg hover:border-red-500 hover:text-red-300 transition"
            aria-label="Vaciar carrito"
          >
            Vaciar carrito
          </button>
        </div>

        <ul className="space-y-4">
          {cart.map((it) => {
            // precio seguro para este item
            const unitPrice = Number(it.price ?? 0);
            const lineTotal = unitPrice * it.qty;

            return (
              <li
                key={`${it.id}-${it.size ?? "nosize"}-${it.colorName ?? "nocolor"}`}
                className="flex items-start justify-between border-b border-neutral-800 pb-4"
              >
                <div className="flex items-start gap-4">
                  {/* Imagen del producto */}
                  <div className="w-16 h-16 rounded-lg border border-neutral-800 bg-neutral-950 flex items-center justify-center overflow-hidden">
                    <Image
                      src={it.image || PRODUCT_PLACEHOLDER_IMAGE}
                      alt={it.name ?? "producto"}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info del producto */}
                  <div>
                    <p className="font-semibold leading-snug">
                      {it.name ?? "Producto"}
                    </p>
                    {it.size && (
                      <p className="text-xs text-neutral-400">
                        Talla: {it.size}
                      </p>
                    )}

                    {/* Color del producto (si existe) */}

                    {it.colorName && (
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-neutral-300">
                        <span
                          className="inline-block w-3.5 h-3.5 rounded-full border border-neutral-700"
                          style={{
                            backgroundColor: it.colorName
                              ? it.colorName.toLowerCase().replace(/\s+/g, "")
                              : "#333",
                          }}
                        />
                        <span className="text-neutral-400">{it.colorName}</span>
                      </div>
                    )}

                    <p className="text-neutral-400 text-sm leading-snug">
                      €{unitPrice.toFixed(2)} c/u
                    </p>

                    {/* Controles de cantidad */}
                    <div className="flex items-center gap-3 mt-2 text-sm">
                      <button
                        onClick={() => handleUpdateQty(it.id, it.qty - 1)}
                        className="w-8 h-8 flex items-center justify-center border border-neutral-700 rounded text-lg hover:border-yellow-400 hover:text-yellow-400 transition"
                        aria-label="Disminuir cantidad"
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-semibold">
                        {it.qty}
                      </span>
                      <button
                        onClick={() => handleUpdateQty(it.id, it.qty + 1)}
                        className="w-8 h-8 flex items-center justify-center border border-neutral-700 rounded text-lg hover:border-yellow-400 hover:text-yellow-400 transition"
                        aria-label="Aumentar cantidad"
                      >
                        +
                      </button>

                      <button
                        onClick={() => removeFromCart(it.id)}
                        className="ml-4 text-xs text-red-400 hover:text-red-300 transition"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Total por línea */}
                <div className="text-right text-yellow-400 font-semibold text-sm min-w-[70px]">
                  €{lineTotal.toFixed(2)}
                </div>
              </li>
            );
          })}
        </ul>

        {/* Total general */}
        <div className="mt-6 flex justify-between text-lg font-semibold">
          <span>Total:</span>
          <span>€{Number(total() ?? 0).toFixed(2)}</span>
        </div>

        {/* Acciones finales */}
        <div className="mt-8 flex gap-3 flex-wrap">
          <Link
            href="/checkout"
            className="inline-block bg-yellow-400 text-black font-bold py-3 px-5 rounded-xl hover:bg-yellow-300 transition"
          >
            Ir al Checkout →
          </Link>
          <Link
            href="/shop"
            className="inline-block bg-neutral-800 border border-neutral-700 text-neutral-200 font-semibold py-3 px-5 rounded-xl hover:border-yellow-400 hover:text-yellow-400 transition"
          >
            Seguir comprando
          </Link>
        </div>
      </div>
    </ClientOnly>
  );
}
