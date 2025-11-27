"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ClientOnly from "@/components/layout/ClientOnly";
import useCartStore from "@/store/cartStore";
import { useState } from "react";

export default function FloatingCart() {
  const pathname = usePathname();
  const { cart, total } = useCartStore();

  const [isOpen, setIsOpen] = useState(true);

  const hideByRoute =
    pathname?.startsWith("/admin") ||
    pathname === "/cart" ||
    pathname === "/checkout";

  if (hideByRoute || cart.length === 0) {
    return null;
  }

  return (
    <ClientOnly>
      <div
        className="
          hidden
          md:fixed md:bottom-4 md:right-4
          md:block
          w-[260px]
          bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-xl
        "
      >
        {/* Encabezado + Botón de minimizar */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">
            Your Cart
          </h3>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-neutral-400 hover:text-yellow-400 transition text-xs font-bold"
          >
            {isOpen ? "−" : "+"}
          </button>
        </div>

        {/* Total siempre visible */}
        <p className="text-yellow-400 font-bold text-xs mt-1">
          €{total().toFixed(2)}
        </p>

        {/* Contenido (solo si está abierto) */}
        {isOpen && (
          <>
            <ul className="mt-3 max-h-40 overflow-y-auto space-y-2 pr-1">
              {cart.map((item) => (
                <li
                  key={`${item.id}-${item.size ?? "nosize"}-${item.colorName ?? "nocolor"}`}
                  className="flex justify-between text-xs text-neutral-300 border-b border-neutral-800 pb-2"
                >
                  <div className="pr-2">
                    <p className="font-semibold text-white leading-snug">
                      {item.name}
                    </p>
                    <p className="font-semibold text-white leading-snug">
                      {item.size} - {item.colorName}
                    </p>
                    <p className="text-neutral-500">
                      {item.qty} × €{item.price.toFixed(2)}
                    </p>
                  </div>

                  <div className="text-right text-yellow-400 font-semibold">
                    €{(item.qty * item.price).toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-col gap-2">
              <Link
                href="/cart"
                className="w-full text-center text-xs font-semibold bg-neutral-800 border border-neutral-700 rounded-lg py-2 text-white hover:border-yellow-400 hover:text-yellow-400 transition"
              >
                Ver carrito
              </Link>

              <Link
                href="/checkout"
                className="w-full text-center text-xs font-bold bg-yellow-400 text-black rounded-lg py-2 hover:bg-yellow-300 transition"
              >
                Pagar ahora
              </Link>
            </div>
          </>
        )}
      </div>
    </ClientOnly>
  );
}
