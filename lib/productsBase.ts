// lib/productsBase.ts
import type { Product } from "@/lib/types";

const productsBase: Product[] = [
  {
    id: "hoodie-black",
    name: "Hoodie Black",
    price: 49.9,
    desc: "Sudadera negra oversize.",
    details: "Algodón, impresión frontal y trasera.",
    image: "/images/hoodie-black.jpg",
    sizes: ["S", "M", "L", "XL"],
    stock: 10,
  },
  {
    id: "tshirt-classic",
    name: "T-Shirt Classic",
    price: 24.9,
    desc: "Camiseta corte regular.",
    image: "/images/tshirt-classic.jpg",
    sizes: ["M", "L"],
    stock: 15,
  },
  // ...los que ya tenías
];

export default productsBase;
