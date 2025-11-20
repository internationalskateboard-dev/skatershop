"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import useMergedProducts from "@/lib/useMergedProducts";

import { useProductVariants } from "@/hooks/product/useProductVariants";
import { useProductCard } from "@/hooks/product/useProductCard";

import { ProductSizes } from "@/components/product/ProductCard/ProductSizes";
import { ProductColors } from "@/components/product/ProductCard/ProductColors";
import { ProductQuantity } from "@/components/product/ProductCard/ProductQuantity";
import { ProductAddButton } from "@/components/product/ProductCard/ProductAddButton";

import type { Product } from "@/lib/types";

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const { products } = useMergedProducts();

  const product: Product | undefined = useMemo(
    () => products.find((p) => p.id === id),
    [products, id]
  );

  // 📌 Si no existe → no renderizamos nada con hooks
  if (!product) {
    return (
      <div className="text-white text-center py-20">
        <p className="text-neutral-400 mb-6">Producto no encontrado.</p>
        <Link
          href="/shop"
          className="text-sm bg-yellow-400 text-black py-2 px-4 rounded-xl hover:bg-yellow-300 transition"
        >
          ← Volver a la tienda
        </Link>
      </div>
    );
  }

  // Hooks ahora SÍ seguros
  const variants = useProductVariants(product);
  const cart = useProductCard(
    product,
    variants.stock,
    variants.selectedSize,
    variants.selectedColor,
    variants.currentImage
  );

  return (
    <div className="relative max-w-6xl mx-auto px-6 text-white grid md:grid-cols-2 gap-6 mt-10 pb-24">

      {/* Volver */}
      <div className="md:col-span-2 mb-2">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900/60 px-4 py-2 text-sm font-semibold text-neutral-200 hover:border-yellow-400 hover:text-yellow-300 active:scale-95 transition"
        >
          <span className="text-lg">←</span> Volver
        </button>
      </div>

      {/* Imagen grande estilo Zara */}
      <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 shadow-[0_0_30px_rgba(0,0,0,0.4)]">
        <Image
          src={variants.currentImage}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Información minimalista */}
      <div className="flex flex-col gap-6 pt-4">

        {/* Título y descripción */}
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">
            {product.name}
          </h1>

          <p className="text-neutral-500 text-sm leading-relaxed mb-4">
            {product.details || product.desc || "Producto SkaterShop."}
          </p>

          <p className="text-yellow-400 font-extrabold text-2xl">
            €{product.price.toFixed(2)}
          </p>
        </div>

        {/* Colores */}
        <div className="mt-2">
          <ProductColors
            product={product}
            selectedColor={variants.selectedColor}
            selectedSize={variants.selectedSize}
            onSelect={variants.setSelectedColor}
          />
        </div>

        {/* Tallas */}
        <div className="">
          <ProductSizes
            product={product}
            selectedSize={variants.selectedSize}
            selectedColor={variants.selectedColor}
            onSelect={variants.setSelectedSize}
          />
        </div>

        {/* Stock */}
        <div className="text-neutral-400 text-sm">
          Disponible:{" "}
          <span className="text-green-400 font-semibold">
            {variants.stock}
          </span>
        </div>

        {/* Acciones minimal */}
        <div className="flex flex-col gap-4 mt-4">

          <ProductQuantity
            quantity={cart.quantity}
            onChange={cart.handleQuantityChange}
          />

          {/* Botón Carrito estilo ZARA Premium */}
          <ProductAddButton
            onAdd={cart.handleAdd}
            qty={cart.alreadyInCartQty}
          />
        </div>
      </div>

      {/* Toast */}
      {cart.toast.show && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed left-1/2 -translate-x-1/2 top-16 z-50 px-6 py-3 rounded-xl shadow-xl border backdrop-blur-md
            ${
              cart.toast.kind === "success"
                ? "bg-green-900/80 border-green-600 text-green-200"
                : "bg-red-900/80 border-red-600 text-red-200"
            }`}
        >
          {cart.toast.text}
        </div>
      )}
    </div>
  );
}
