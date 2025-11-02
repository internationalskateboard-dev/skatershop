/**
 * productsBase
 * ------------------------------------------------------------
 * Productos de ejemplo / precargados.
 * Se mezclan con los del admin en useMergedProducts.
 */

import type { Product } from "./types";
import { PRODUCT_PLACEHOLDER_IMAGE } from "./constants";

export const productsBase: Product[] = [
  {
    id: "hoodie-black",
    name: "Hoodie Black",
    price: 39.9,
    desc: "Hoodie negro oversize con logo.",
    details: "Algodón 450gsm, fit relajado.",
    image: "/images/hoodie-black.jpg",
    sizes: ["S", "M", "L", "XL"],
    stock: 10,
  },
  
  {
    id: "cap-yellow",
    name: "Gorra Yellow",
    price: 18,
    desc: "Gorra plana negra",
    details: "Visera rígida, talla única.",
    image: "/images/cap-classic.jpg",
    sizes: ["ONE SIZE"],
    stock: 5,
  },
];
