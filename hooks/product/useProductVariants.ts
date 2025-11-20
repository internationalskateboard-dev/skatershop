import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { PRODUCT_PLACEHOLDER_IMAGE } from "@/lib/constants";
import { getVariantStock } from "@/lib/utils/product/stock";

export function useProductVariants(product?: Product) {
  // Hooks siempre arriba
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // Inicialización segura
  useEffect(() => {
    if (!product) return;

    if (product.sizes?.length) setSelectedSize(product.sizes[0]);
    if (product.colors?.length) setSelectedColor(product.colors[0].name);
  }, [product]);

  // Stock calculado
  const stock = useMemo(() => {
    if (!product) return 0;
    return getVariantStock(product, selectedSize, selectedColor);
  }, [product, selectedSize, selectedColor]);

  // Imagen actual
  const currentImage = useMemo(() => {
    if (!product) return PRODUCT_PLACEHOLDER_IMAGE;

    const base = product.image ?? PRODUCT_PLACEHOLDER_IMAGE;
    if (!product.colors?.length) return base;

    const active =
      product.colors.find((c) => c.name === selectedColor) ||
      product.colors[0];

    return active?.image ?? base;
  }, [product, selectedColor]);

  return {
    selectedSize,
    selectedColor,
    setSelectedSize,
    setSelectedColor,
    stock,
    currentImage,
  };
}
