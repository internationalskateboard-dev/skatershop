"use client";

import ClientOnly from "@/components/layout/ClientOnly";
import useCartStore from "@/store/cartStore";
import Link from "next/link";
import Image from "next/image";

export default function CartPage() {
  const { cart, removeFromCart, updateQty, clearCart, total } = useCartStore();

  return (
    <ClientOnly>
      {cart.length === 0 ? (
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
      ) : (
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
            {cart.map((it) => (
              <li
                key={it.id}
                className="flex items-start justify-between border-b border-neutral-800 pb-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-lg border border-neutral-800 bg-neutral-950 flex items-center justify-center overflow-hidden">
                    {it.image ? (
                      <Image
                        src={it.image}
                        alt={it.name ?? "producto"}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[10px] text-neutral-600">
                        sin imagen
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="font-semibold leading-snug">{it.name}</p>
                    {it.size && (
                      <p className="text-xs text-neutral-400">Talla: {it.size}</p>
                    )}
                    <p className="text-neutral-400 text-sm leading-snug">
                      €{it.price.toFixed(2)} c/u
                    </p>

                    <div className="flex items-center gap-3 mt-2 text-sm">
                      <button
                        onClick={() => updateQty(it.id, it.qty - 1)}
                        className="w-8 h-8 flex items-center justify-center border border-neutral-700 rounded text-lg hover:border-yellow-400 hover:text-yellow-400 transition"
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-semibold">{it.qty}</span>
                      <button
                        onClick={() => updateQty(it.id, it.qty + 1)}
                        className="w-8 h-8 flex items-center justify-center border border-neutral-700 rounded text-lg hover:border-yellow-400 hover:text-yellow-400 transition"
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

                <div className="text-right text-yellow-400 font-semibold text-sm min-w-[70px]">
                  €{(it.price * it.qty).toFixed(2)}
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex justify-between text-lg font-semibold">
            <span>Total:</span>
            <span>€{total().toFixed(2)}</span>
          </div>

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
      )}
    </ClientOnly>
  );
}
