"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import useMergedProducts from "@/lib/products/useMergedProducts";

import { useProductVariants } from "@/hooks/product/useProductVariants";
import { useProductCard } from "@/hooks/product/useProductCard";

import { ProductSizes } from "@/components/product/ProductCard/ProductSizes";
import { ProductColors } from "@/components/product/ProductCard/ProductColors";
import { ProductQuantity } from "@/components/product/ProductCard/ProductQuantity";
import { ProductAddButton } from "@/components/product/ProductCard/ProductAddButton";

import { PRODUCT_PLACEHOLDER_IMAGE } from "@/lib/constants";
import type { Product } from "@/lib/types";

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const { products } = useMergedProducts();

  // Buscar producto
  const product: Product | undefined = useMemo(
    () => products.find((p) => p.id === id),
    [products, id]
  );

  // 🔥 Hooks siempre antes del render condicional
  const variants = useProductVariants(product);

  const cart = useProductCard(product, {
    stock: variants.stock,
    selectedSize: variants.selectedSize,
    selectedColor: variants.selectedColor,
    currentImage: variants.currentImage,
  });

  // ------------------------------------------------------------
  // UI condicional después de hooks
  // ------------------------------------------------------------
  if (!product) {
    return (
      <div className="text-white text-center py-20">
        <p className="text-neutral-400 mb-6">Cargando...</p>

        <Link
          href="/shop"
          className="text-sm bg-yellow-400 text-black py-2 px-4 rounded-xl hover:bg-yellow-300 transition"
        >
          ← Volver a la tienda
        </Link>
      </div>
    );
  }

  // Imagen segura
  const safeImage =
    variants.currentImage || product.image || PRODUCT_PLACEHOLDER_IMAGE;

  return (
    <div className="relative max-w-5xl mx-auto px-6 text-white grid md:grid-cols-2 gap-8 mt-1 pb-24">
      {/* Volver */}
      <div className="md:col-span-2">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold text-neutral-100 hover:border-yellow-400 hover:text-yellow-300 active:scale-95 transition"
        >
          <span className="text-lg">←</span> Volver
        </button>
      </div>

      {/* Imagen */}
      <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 shadow-xl">
        <Image
          src={safeImage}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Información del producto */}
      <div className="flex flex-col justify-between">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold md:text-3xl">{product.name}</h1>

          <p className="text-yellow-400 font-bold text-2xl">
            €{product.price.toFixed(2)}
          </p>

          {/* Colores */}
          <ProductColors
            product={product}
            selectedColor={variants.selectedColor}
            onSelect={variants.setSelectedColor}
            enabledColors={variants.enabledColors || []}
          />

          {/* Tallas */}
          <ProductSizes
            product={product}
            selectedSize={variants.selectedSize}
            onSelect={variants.setSelectedSize}
            enabledSizes={variants.enabledSizes || []}
          />

          {/* Stock */}
          <p className="text-sm text-neutral-400">
            Stock para esta combinación:{" "}
            <span className="text-green-400 font-semibold">
              {variants.stock}
            </span>
          </p>

          <p className="text-neutral-400 text-sm leading-relaxed">
            {product.details || product.desc || "Producto SkaterShop."}
          </p>
        </div>

        {/* Acciones */}
        <div className="mt-7 flex flex-col gap-3">
          <ProductQuantity
            quantity={cart.quantity}
            onChange={cart.handleQuantityChange}
            max={variants.stock}
          />

          <ProductAddButton
            onAdd={cart.handleAdd}
            qtyInCart={cart.alreadyInCartQty}
            stock={variants.stock}
          />
        </div>
      </div>

      {/* Toast */}
      {cart.toast.show && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed left-1/2 -translate-x-1/2 top-16 z-50 px-4 py-3 rounded-xl shadow-xl border
            ${
              cart.toast.kind === "success"
                ? "bg-green-900/90 border-green-600 text-green-200"
                : "bg-red-900/90 border-red-600 text-red-200"
            }`}
        >
          {cart.toast.text}
        </div>
      )}
    </div>
  );
}
