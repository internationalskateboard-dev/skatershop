// lib/productsBase.ts
/**
 * productsBase
 * ------------------------------------------------------------
 * Productos precargados (solo ejemplo).
 * IMPORTANTÍSIMO: Deben venir SANITIZADOS.
 */

import type { Product } from "./types";
import { PRODUCT_PLACEHOLDER_IMAGE } from "./constants";

/**
 * Función interna para rellenar variantStock automáticamente.
 */
function buildVariantStock(
  colors: { name: string; image?: string }[],
  sizes: string[],
  stock: number
) {
  // Repartimos el stock de forma simple (mismo stock para todas)
  const perVariant = Math.max(1, Math.floor(stock / (colors.length * sizes.length)));

  const arr: any[] = [];

  for (const c of colors) {
    for (const s of sizes) {
      arr.push({
        colorName: c.name,
        size: s,
        stock: perVariant,
      });
    }
  }

  return arr;
}

export const productsBase: Product[] = [
  {
    id: "tee-skull",
    name: "Hoodie Black Base",
    price: 39.9,
    desc: "Hoodie negro oversize con logo.",
    details: "Algodón 450gsm, fit relajado.",
    image: "/images/hoodie-black.jpg",

    sizes: ["S", "M", "L", "XL"],
    stock: 10,

    colors: [
      { name: "Black", image: "/images/hoodie-black.jpg" },
      { name: "Yellow", image: PRODUCT_PLACEHOLDER_IMAGE },
    ],

    variantStock: buildVariantStock(
      [
        { name: "Black", image: "/images/hoodie-black.jpg" },
        { name: "Yellow", image: PRODUCT_PLACEHOLDER_IMAGE },
      ],
      ["S", "M", "L", "XL"],
      10
    ),

    sizeGuide: undefined,
    isClothing: true,
  },

  {
    id: "cap-yellow-Base",
    name: "Gorra Black Base",
    price: 18,
    desc: "Gorra plana negra",
    details: "Visera rígida, talla única.",
    image: "/images/cap-classic.jpg",

    sizes: ["ONE SIZE"],
    stock: 5,

    colors: [
      { name: "Black", image: "/images/cap-classic.jpg" },
      { name: "Yellow", image: PRODUCT_PLACEHOLDER_IMAGE },
    ],

    variantStock: buildVariantStock(
      [
        { name: "Black", image: "/images/cap-classic.jpg" },
        { name: "Yellow", image: PRODUCT_PLACEHOLDER_IMAGE },
      ],
      ["ONE SIZE"],
      5
    ),

    sizeGuide: undefined,
    isClothing: false,
  },
];
