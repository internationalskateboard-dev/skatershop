// lib/types.ts
// Tipos compartidos entre:
// - páginas (shop, product detail, admin)
// - stores (cartStore, productStore, salesStore)
// - API routes (app/api/...)
// Mantener este archivo como “fuente de verdad”.

/**
 * ColorVariant
 * ------------------------------------------------------------
 * Variante de color opcional para un producto.
 * La estamos generando en el admin a partir de un campo de texto
 * “Negro,Blanco,Rojo” + una imagen por cada color.
 */
export type ColorVariant = {
  name: string;
  image?: string; // base64 o URL
};

/**
 * Product
 * ------------------------------------------------------------
 * Representa un producto completo dentro de la tienda.
 * Esta versión ya contempla lo que hace tu Admin actual:
 * - tallas por botones (selectedSizes → lo guardamos aquí como sizes)
 * - ONE SIZE
 * - colores con imagen
 * - guía de tallas
 */
export type Product = {
  id: string;
  name: string;
  price: number;
  desc?: string;
  details?: string;
  image?: string;              // principal (puede ser base64)
  sizes?: string[];            // ["S","M","L"] o ["ONE SIZE"]
  stock?: number;              // si no está → lo tratamos como “sin controlar”
  locked?: boolean;            // para marcar productos con ventas
  colors?: ColorVariant[];     // 👈 NUEVO: colores con imagen
  sizeGuide?: string;          // 👈 NUEVO: guía de tallas / medidas
};

/**
 * SaleItem
 * ------------------------------------------------------------
 * Lo que guarda checkout cuando alguien compra.
 * Ojo: el checkout trabaja con productId y qty, y a veces con talla.
 */
export type SaleItem = {
  productId: string;
  qty: number;
  size?: string;
};

/**
 * SaleRecord
 * ------------------------------------------------------------
 * Venta completa guardada en el store de ventas.
 */
export type SaleRecord = {
  id: string;               // p.ej. Date.now().toString()
  items: SaleItem[];
  createdAt: string;        // ISO string
  total?: number;
  customer?: {
    fullName?: string;
    email?: string;
    phone?: string;
    country?: string;
    adresse?: string;       // lo llamaste "adresse" en checkout
    city?: string;
    zip?: string;
  };
};
