"use client";

import Link from "next/link";
import type { Product } from "@/lib/types";

import { useProductVariants } from "@/hooks/product/useProductVariants";
import { useProductCard } from "@/hooks/product/useProductCard";

import { ProductImage } from "./ProductImage";
import { ProductSizes } from "./ProductSizes";
import { ProductColors } from "./ProductColors";
import { ProductQuantity } from "./ProductQuantity";
import { ProductAddButton } from "./ProductAddButton";

export default function ProductCard({ product }: { product: Product }) {
  
  const {
    selectedSize,
    selectedColor,
    setSelectedSize,
    setSelectedColor,
    stock,
    currentImage,
  } = useProductVariants(product);

  const {
    quantity,
    handleQuantityChange,
    handleAdd,
    alreadyInCartQty,
    toast,
  } = useProductCard(product, stock, selectedSize, selectedColor, currentImage);

  return (
    <article className="h-auto group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 p-4 shadow-md hover:shadow-xl transition-all">

      {/* Toast */}
      {toast.show && (
        <div
          className={`fixed left-1/2 -translate-x-1/2 top-16 z-50 px-4 py-3 rounded-xl shadow-xl border
            ${
              toast.kind === "success"
                ? "bg-green-900/90 border-green-600 text-green-200"
                : "bg-red-900/90 border-red-600 text-red-200"
            }`}
        >
          {toast.text}
        </div>
      )}

      {/* Imagen */}
      <Link href={`/products/${product.id}`}>
        <div className="rounded-xl overflow-hidden border border-neutral-800 aspect-[4/5] bg-neutral-900">
          <ProductImage image={currentImage} name={product.name} />
        </div>
      </Link>

      {/* Contenido */}
      <div className="flex flex-col gap-3 mt-4">

        {/* Nombre */}
        <h3 className="text-lg font-semibold tracking-tight text-white">
          {product.name}
        </h3>

        {/* Precio */}
        <p className="text-yellow-400 font-bold text-lg">
          €{product.price.toFixed(2)}
        </p>

        {/* Colores */}
        <div className="flex items-center justify-between">
          <ProductColors
            product={product}
            selectedColor={selectedColor}
            selectedSize={selectedSize}
            onSelect={setSelectedColor}
          />
        </div>

        {/* Tallas */}
        <ProductSizes
          product={product}
          selectedSize={selectedSize}
          selectedColor={selectedColor}
          onSelect={setSelectedSize}
        />

        {/* Stock */}
        <p className="text-xs text-neutral-500">
          DISP: <span className="text-green-400">{stock}</span>
        </p>

        {/* Control + Añadir */}
        <div className="flex flex-col gap-3 mt-1">
          <ProductQuantity
            quantity={quantity}
            onChange={handleQuantityChange}
          />

          <ProductAddButton
            onAdd={handleAdd}
            qty={alreadyInCartQty}
          />
        </div>
      </div>
    </article>
  );
}
