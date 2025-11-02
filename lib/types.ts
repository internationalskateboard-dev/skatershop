/**
 * useProductStore
 * ------------------------------------------------------------
 * - Guarda productos creados desde el admin
 * - Permite agregarlos, actualizarlos y borrarlos
 * - Permite reducir stock por lote (checkout)
 *
 * Ahora tipado con Product (lib/types.ts)
 */

/**
 * ColorVariant
 * ------------------------------------------------------------
 * Variante de color opcional para un producto.
 * La estamos generando en el admin a partir de un campo de texto
 * “Negro,Blanco,Rojo” + una imagen por cada color.
 */
export type ProductColor = {
  name: string;
  image?: string; // puede venir vacío si no subieron imagen para ese color
};

export type Product = {
  id: string;
  name: string;
  price: number;
  desc?: string;
  details?: string;
  image?: string; // puede ser URL o base64
  sizes?: string[]; // ej: ["S","M","L"] o ["ONE SIZE"]
  stock?: number; // opcional porque los productos base pueden no traerlo
  colors?: ProductColor[];
  sizeGuide?: string; // texto multilinea con medidas
};

/**
 * Lo que guardamos en el carrito.
 * - id: usamos el id del producto (si luego quieres “id+size”, también vale)
 * - size: opcional
 */
export type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
  size?: string;
};

/**
 * Datos de cliente que recoge el checkout (tu versión actual)
 */
export type CustomerInfo = {
  fullName: string;
  country: string;
  adresse: string;
  city: string;
  zip: string;
  phone: string;
  email: string;
};

/**
 * Item de una venta
 */
export type SaleItem = {
  productId: string;
  qty: number;
  size?: string;
};

/**
 * Registro de venta completo (lo que podríamos guardar en /api/sales
 * o en el store local)
 */
export type SaleRecord = {
  id: string;
  createdAt: string; // ISO
  items: SaleItem[];
  total: number;
  customer?: Partial<CustomerInfo>;
};

/**
 * Respuesta típica de la API
 */
export type ProductsApiResponse = {
  products: Product[];
};

export type SalesApiResponse = {
  sales: SaleRecord[];
};