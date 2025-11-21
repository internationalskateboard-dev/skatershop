import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { PRODUCT_PLACEHOLDER_IMAGE } from "@/lib/constants";
import { getVariantStock } from "@/lib/utils/product/stock";
import { soldMap } from "@/lib/utils/product/stock/soldMap";

export function useProductVariants(product?: Product) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // ------------------------------------------------------------
  // 1) Seleccionar PRIMER color disponible al cargar el producto
  // ------------------------------------------------------------
  useEffect(() => {
    if (!product) return;

    const firstColor = product.colors?.[0]?.name ?? null;
    setSelectedColor(firstColor);
  }, [product]);

  // ------------------------------------------------------------
  // 2) Si el color NO tiene tallas → elegir otro color válido
  // ------------------------------------------------------------
  useEffect(() => {
    if (!product || !selectedColor) return;

    // Tallas con stock para este color
    const sizesForColor =
      product.variantStock
        ?.filter((v) => v.colorName === selectedColor && v.stock > 0)
        .map((v) => v.size) ?? [];

    // Este color SI tiene tallas → no tocar
    if (sizesForColor.length > 0) return;

    // Buscar PRIMER color con tallas disponibles
    const availableColor = product.colors?.find((c) =>
      product.variantStock?.some((v) => v.colorName === c.name && v.stock > 0)
    );

    if (availableColor) {
      setSelectedColor(availableColor.name);
    }
  }, [selectedColor, product]);

  // ------------------------------------------------------------
  // 3) Seleccionar la PRIMERA talla disponible para el color actual
  // ------------------------------------------------------------
  useEffect(() => {
    if (!product || !selectedColor) return;

    const sizesForColor: string[] =
      product.variantStock
        ?.filter((v) => v.colorName === selectedColor && v.stock > 0)
        .map((v) => v.size)
        .filter((s): s is string => typeof s === "string") ?? [];

    if (sizesForColor.length > 0) {
      if (!selectedSize || !sizesForColor.includes(selectedSize)) {
        setSelectedSize(sizesForColor[0]);
      }
      return;
    }

    // fallback si no existen variantStock
    if (product.sizes?.length) {
      setSelectedSize(product.sizes[0]);
    }
  }, [selectedColor, product]);

  // ------------------------------------------------------------
  // STOCK
  // ------------------------------------------------------------
  const stock = useMemo(() => {
    if (!product) return 0;
    return getVariantStock(product, selectedSize, selectedColor, soldMap);
  }, [product, selectedSize, selectedColor]);

  // ------------------------------------------------------------
  // IMAGEN
  // ------------------------------------------------------------
  const currentImage = useMemo(() => {
    if (!product) return PRODUCT_PLACEHOLDER_IMAGE;

    const base = product.image ?? PRODUCT_PLACEHOLDER_IMAGE;
    const active =
      product.colors?.find((c) => c.name === selectedColor) ??
      product.colors?.[0];

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
