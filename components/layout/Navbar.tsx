/**
 * Navbar
 * - Header global del sitio.
 * - Muestra el logo SVG vectorial (sin fondo).
 * - Cuando estás en /admin, simplifica navegación y oculta carrito.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import CartBadge from "@/components/layout/CartBadge";

export default function Navbar() {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");

  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-neutral-800 border-b-yellow-400">
      <nav className="max-w-6xl mx-auto flex justify-between items-center py-4 px-6">
        {/* Logo / Marca */}
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo-skater-yellow.svg"
            alt="INTERNATIONAL SK8.ART.SUBCULTURE"
            className="h-10 w-auto"
          />
        </Link>

        <div className="flex items-center gap-6">
          {isAdminPage ? (
            // Vista admin
            <Link
              href="/admin"
              className={`text-sm font-medium hover:text-yellow-400 transition ${
                pathname?.startsWith("/admin")
                  ? "text-yellow-400"
                  : "text-neutral-300"
              }`}
            >
              Admin
            </Link>
          ) : (
            // Vista tienda normal
            <>
              <Link
                href="/"
                className={`text-sm font-medium hover:text-yellow-400 transition ${
                  pathname === "/"
                    ? "text-yellow-400"
                    : "text-neutral-300"
                }`}
              >
                Home
              </Link>

              <Link
                href="/shop"
                className={`text-sm font-medium hover:text-yellow-400 transition ${
                  pathname?.startsWith("/shop")
                    ? "text-yellow-400"
                    : "text-neutral-300"
                }`}
              >
                Tienda
              </Link>

              <Link
                href="/cart"
                className="relative flex items-center text-neutral-300 hover:text-yellow-400 transition"
              >
                <CartBadge />
                <span className="ml-2 text-sm font-medium">Carrito</span>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
