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
    id: "hoodie-black-Base",
    name: "Hoodie Black Base",
    price: 39.9,
    desc: "Hoodie negro oversize con logo.",
    details: "Algodón 450gsm, fit relajado.",
    image: "/images/hoodie-black.jpg",
    sizes: ["S", "M", "L", "XL"],
    stock: 10,
    colors: [ 
      { name: "Black", image: "/images/hoodie-black.jpg" },
      { name: "Blue", image: "/images/sueter_azul.png" }
    ],
    sizeGuide: "string",
    isClothing: true
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
      { name: "string", image: "string" },
      { name: "string", image: "string" }
    ],
    sizeGuide: "string",
    isClothing: false
  },
];
