// hooks/product/useProductVariants.ts
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { PRODUCT_PLACEHOLDER_IMAGE } from "@/lib/constants";
import {
  getVariantStock,
  getColorStock,
  getSizeStock,
  getRealStock,
} from "@/lib/stock";
import { soldMap } from "@/lib/stock/soldMap";

export function useProductVariants(product?: Product) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // ------------------------------------------------------------
  // Colores habilitados (normalizados)
  // ------------------------------------------------------------
  const enabledColors = useMemo<string[]>(() => {
    if (!product || !Array.isArray(product.colors)) return [];

    return product.colors
      .filter((c) => getColorStock(product, c.name, soldMap) > 0)
      .map((c) => c.name.toUpperCase()); // 👈 normalizamos
  }, [product]);

  // ------------------------------------------------------------
  // Tallas habilitadas (normalizadas)
  // ------------------------------------------------------------
  const enabledSizes = useMemo<string[]>(() => {
    if (!product || !Array.isArray(product.sizes)) return [];

    // Sin variantStock → todas habilitadas
    if (!product.variantStock?.length) {
      return product.sizes;
    }

    // Color seleccionado
    if (selectedColor) {
      const sizesSet = new Set<string>();
      const normalizedColor = selectedColor.toUpperCase();

      product.variantStock.forEach((v) => {
        const vColor = (v.colorName ?? "").toUpperCase();
        const vSize = v.size ?? "";

        if (vColor === normalizedColor && vSize) {
          const key = `${vColor}_${vSize}`;
          const sold = soldMap[key] ?? 0;
          const real = getRealStock(v.stock ?? 0, sold);
          if (real > 0) sizesSet.add(vSize);
        }
      });

      return product.sizes.filter((s) => sizesSet.has(s));
    }

    // Sin color: tallas con stock global
    return product.sizes.filter(
      (s) => getSizeStock(product, s, soldMap) > 0
    );
  }, [product, selectedColor]);

  // ------------------------------------------------------------
  // Color inicial
  // ------------------------------------------------------------
  useEffect(() => {
    if (!product) return;

    if (enabledColors.length === 0) {
      setSelectedColor(null);
      return;
    }

    setSelectedColor((prev) => {
      const prevNorm = prev?.toUpperCase();
      if (prevNorm && enabledColors.includes(prevNorm)) return prev;
      return enabledColors[0];
    });
  }, [product, enabledColors]);

  // ------------------------------------------------------------
  // Talla inicial
  // ------------------------------------------------------------
  useEffect(() => {
    if (!product) return;

    if (enabledSizes.length === 0) {
      setSelectedSize(null);
      return;
    }

    setSelectedSize((prev) => {
      if (prev && enabledSizes.includes(prev)) return prev;
      return enabledSizes[0];
    });
  }, [product, enabledSizes]);

  // ------------------------------------------------------------
  // Stock
  // ------------------------------------------------------------
  const stock = useMemo(() => {
    if (!product) return 0;
    return getVariantStock(product, selectedSize, selectedColor, soldMap);
  }, [product, selectedSize, selectedColor]);

  // ------------------------------------------------------------
  // Imagen actual
  // ------------------------------------------------------------
  const currentImage = useMemo(() => {
    if (!product) return PRODUCT_PLACEHOLDER_IMAGE;

    // Imagen base cuando no hay colores
    const base = product.image ?? PRODUCT_PLACEHOLDER_IMAGE;

    if (selectedColor && Array.isArray(product.colors)) {
      const normalized = selectedColor.toUpperCase();
      const found = product.colors.find(
        (c) => c.name.toUpperCase() === normalized
      );
      return found?.image ?? base;
    }

    return base;
  }, [product, selectedColor]);

  return {
    selectedSize,
    selectedColor,
    setSelectedSize,
    setSelectedColor,
    stock,
    currentImage,
    enabledColors,
    enabledSizes,
  };
}
