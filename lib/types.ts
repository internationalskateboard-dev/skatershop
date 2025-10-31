// lib/types.ts
// Tipos compartidos entre admin, checkout y los stores.

/**
 * Product
 * ------------------------------------------------------------
 * Representa un producto disponible en la tienda.
 * Se usa en:
 * - store/productStore
 * - lib/useMergedProducts
 * - páginas /shop y /products/[id]
 * - admin
 */
export type Product = {
  id: string;
  name: string;
  price: number;
  desc?: string;
  details?: string;
  image?: string;      // puede ser URL o base64
  sizes?: string[];    // ["S","M","L"]
  stock?: number;      // si no viene → tratamos como infinito
  locked?: boolean;    // para no borrar productos que ya tienen ventas
};

/**
 * SaleItem
 * ------------------------------------------------------------
 * Unidad de venta que viene del checkout.
 * Es el mismo shape que estás usando en:
 *   const batch = cart.map((it) => ({ productId: it.id, qty: it.qty }));
 */
export type SaleItem = {
  productId: string;
  qty: number;
  size?: string;
};

/**
 * SaleRecord
 * ------------------------------------------------------------
 * Registro de venta que guarda el store.
 * Te deja en un futuro guardar fecha, cliente, etc.
 */
export type SaleRecord = {
  id: string;               // algún id interno, podemos usar Date.now().toString()
  items: SaleItem[];
  createdAt: string;        // ISO string
  total?: number;
  customer?: {
    fullName?: string;
    email?: string;
    phone?: string;
    country?: string;
  };
};
