// lib/utils/product/sanitizeProduct.ts
import { PRODUCT_PLACEHOLDER_IMAGE } from "@/lib/constants";
import type { Product } from "@/lib/types";

/**
 * Asegura que TODAS las imágenes del producto sean válidas.
 * Soporta:
 *  - rutas locales (/image.jpg)
 *  - URLs (http/https)
 *  - base64 (data:image/png;base64,...)
 */
export function sanitizeProductImages(p: Product): Product {
  const safeImage = (img?: string) => {
    if (!img || typeof img !== "string") return PRODUCT_PLACEHOLDER_IMAGE;

    const t = img.trim();

    if (
      t.startsWith("/") ||          // ruta local
      t.startsWith("http") ||       // URL externa
      t.startsWith("data:image")    // base64
    ) {
      return t;
    }

    return PRODUCT_PLACEHOLDER_IMAGE;
  };

  return {
    ...p,
    image: safeImage(p.image),
    colors: Array.isArray(p.colors)
      ? p.colors.map((c) => ({
          ...c,
          image: safeImage(c.image),
        }))
      : [],
    variantStock: Array.isArray(p.variantStock)
      ? p.variantStock.map((v) => ({
          ...v,
          image: safeImage(v.image),
        }))
      : [],
  };
}
