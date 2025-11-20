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

  // console.log("PRODUCT JSON:", JSON.stringify(product, null, 2));

  const {
    selectedSize,
    selectedColor,
    setSelectedSize,
    setSelectedColor,
    stock,
    currentImage,
  } = useProductVariants(product);

  const { quantity, handleQuantityChange, handleAdd, alreadyInCartQty, toast } =
    useProductCard(product, stock, selectedSize, selectedColor, currentImage);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-950 p-3">
      {/* Toast */}
      {toast.show && (
        <div
          className={`fixed left-1/2 -translate-x-1/2 top-16 z-50 px-4 py-3 rounded-xl shadow-xl border ${
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
        <ProductImage image={currentImage} name={product.name} />
      </Link>

      {/* Detalles */}
      <div className="mt-3">
        <h3 className="text-base font-semibold">{product.name}</h3>

        {product.desc && (
          <p className="text-neutral-400 text-sm line-clamp-2">
            {product.desc}
          </p>
        )}

        <ProductSizes
          product={product}
          selectedSize={selectedSize}
          selectedColor={selectedColor}
          onSelect={setSelectedSize}
        />

        <ProductColors
          product={product}
          selectedColor={selectedColor}
          selectedSize={selectedSize}
          onSelect={setSelectedColor}
        />

        <p className="text-xs text-neutral-500">
          STOCK: <span className="text-green-400">{stock}</span>
        </p>

        <p className="text-yellow-400 font-bold text-base">
          €{product.price.toFixed(2)}
        </p>

        {/* Controles */}
        <div className="mt-3 flex flex-col gap-2">
          <ProductQuantity
            quantity={quantity}
            onChange={handleQuantityChange}
          />
          <ProductAddButton onAdd={handleAdd} qty={alreadyInCartQty} />
        </div>
      </div>
    </article>
  );
}
