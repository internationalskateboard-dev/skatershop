// lib/productsBase.ts
import type { Product } from "@/lib/types";

const productsBase: Product[] = [
  {
    id: 'cap-classic',
    name: 'Snapback Classic Logo',
    price: 11.99,
    image: '/images/cap-classic.jpg',
    desc: 'Gorra plana con logo bordado SKATER STORE.',
    details:
      'Estructura 6 paneles, visera plana, cierre snapback. Bordado amarillo textura desgaste.',
    sizes: ['ONE SIZE'],
  },
  {
    id: "hoodie-black",
    name: "Hoodie Black",
    price: 23.9,
    desc: "Sudadera negra oversize.",
    details: "Algodón, impresión frontal y trasera.",
    image: "/images/sueter_azul.png",
    sizes: ["S", "M", "L", "XL"],
    stock: 10,
  }
  // ...los que ya tenías
];

export default productsBase;
