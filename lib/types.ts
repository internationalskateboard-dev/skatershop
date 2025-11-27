// lib/types.ts

/************************************************************
 * LEGACY TYPES (ANTIGUO MODELO LOCAL)
 * ----------------------------------------------------------
 * Los dejo comentados como referencia histórica.
 * TODO: eliminar cuando todo el frontend use el nuevo modelo
 ************************************************************/

/*
export type VariantStockItem = {
  size?: string | null;
  colorName?: string | null;
  stock: number;
  image?: string;
};

export type ProductColor = {
  name: string;
  image?: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  desc?: string;
  details?: string;
  image?: string;
  sizes?: string[];
  stock?: number | null;
  colors?: { name: string; image?: string }[];
  sizeGuide?: string;
  isClothing: boolean;
  variantStock?: VariantStockItem[] | null;
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
  size: string | undefined;
  colorName: string | undefined;
  stock: number;
};

export type CustomerInfo = {
  fullName: string;
  country: string;
  adresse: string;
  city: string;
  zip: string;
  phone: string;
  email: string;
};

export type SaleItem = {
  productId: string;
  qty: number;
  size?: string;
};

export type SaleRecord = {
  id: string;
  createdAt: string;
  items: SaleItem[];
  total: number;
  customer?: Partial<CustomerInfo>;
};

export type ProductCardVariants = {
  selectedSize: string | null;
  stock: number | 0;
  selectedColor: string | null;
  currentImage: string;
};

export type ProductsApiResponse = {
  products: Product[];
};

export type SalesApiResponse = {
  sales: SaleRecord[];
};
*/

/************************************************************
 * NUEVO MODELO TIPADO BASADO EN LA BD (PRISMA + POSTGRES)
 * ----------------------------------------------------------
 * Todo lo nuevo del Admin / Wizard / Carrito debe usar estos
 * tipos. Están pensados para ser escalables y alineados con
 * tu esquema real:
 *
 *  - category
 *  - product_type
 *  - colorsprod
 *  - sizesprod
 *  - product
 *  - product_color_image
 *  - stock_color_size
 *  - productvariant
 *  - orders / order_items / sold_stock_log
 ************************************************************/

// Alias básicos
export type Id = number;          // para ids BigInt en JS
export type DecimalString = string; // por si usamos strings al serializar decimales

/************************************************************
 * ENTIDADES BÁSICAS (CATÁLOGOS)
 ************************************************************/

export type Category = {
  id: Id;           // category.idcategory
  name: string;
};

export type ProductType = {
  id: Id;           // product_type.idtype
  name: string;     // typename
};

export type Color = {
  id: Id;           // colorsprod.idcolorsprod
  name: string;     // namecolorsprod
};

export type Size = {
  id: Id;                // sizesprod.idsizesprod
  label: string;         // sizesprod
  productTypeId: Id;     // idtype_fk (nombre limpio en el domain model) typeId: Id;
};

/************************************************************
 * PRODUCTO (CAPA DOMAIN / UI)
 * ----------------------------------------------------------
 * Este es el shape "normalizado" que idealmente usamos en
 * el frontend (tanto tienda como admin). Es una proyección
 * de la BD, no el modelo Prisma 1:1.
 ************************************************************/

export type ProductBase = {
  id: Id;                 // product.idprod
  slug: string;           // product.slug
  name: string;           // product.name
  price: number;          // product.price (Decimal -> number)
  desc?: string | null;   // product.desc
  details?: string | null;// product.details
  typeId: Id;      // idtype_fk
  categoryId: Id | null;  // idcategory_fk
  createdAt: string;      // ISO
  updatedAt: string;      // ISO
  published: boolean;
};

export type ProductColorImage = {
  id: Id;                // product_color_image.id
  productId: Id;         // idprod_fk
  colorId: Id;           // idcolor_fk
  imageUrl: string;     // image_url (Base64 o URL)
};

export type StockColorSizeRow = {
  id: Id;                // stock_color_size.id_stock_color_size
  productId: Id;         // id_prod_fk
  colorId: Id;           // id_color_fk
  sizeId: Id;            // id_size_fk
  stock: number;         // stock
};

export type ProductVariantRow = {
  id: Id;                // productvariant.idvariant
  productId: Id;         // idprod_fk
  colorId: Id;           // idcolor_fk
  sizeId: Id;            // idsize_fk
  stockColorSizeId: Id;  // id_stock_color_size
};

/**
 * Producto enriquecido con sus relaciones listas para la UI.
 * Ideal para vistas de detalle o el admin (future-proof).
 */
export type ProductWithRelations = ProductBase & {
  category?: Category | null;
  productType?: ProductType | null;
  colors?: Color[];                    // colores disponibles
  sizes?: Size[];                      // tallas disponibles (según tipo)
  colorImages?: ProductColorImage[];   // imágenes por color
  stockRows?: StockColorSizeRow[];     // filas de stock por color+talla
  variants?: ProductVariantRow[];      // mapeo explícito de variantes
};

/************************************************************
 * VARIANTES & STOCK (CAPA DE NEGOCIO / STOCK ENGINE)
 ************************************************************/

/**
 * Variante de stock ya "resuelta" para la UI:
 * - conecta stock_color_size + color + size + imagen.
 * - esto es lo que usará el motor de stock y el carrito.
 */
export type VariantStockItem = {
  stockRowId: Id;          // stock_color_size.id_stock_color_size
  productId: Id;
  colorId: Id | null;
  sizeId: Id | null;
  stock: number;

  // Datos de conveniencia para la UI:
  colorName?: string | null;
  sizeLabel?: string | null;
  imageData?: string | null; // imagen principal para esa variante (si aplica)
};

/**
 * Información agregada de stock por producto,
 * útil para el motor de stock o pantallas de admin.
 */
export type ProductStockSummary = {
  productId: Id;
  totalStock: number;
  variants: VariantStockItem[];
};

/************************************************************
 * CARRITO Y CHECKOUT (NUEVO MODELO)
 * ----------------------------------------------------------
 * El carrito ahora trabaja con:
 *  - productId numérico
 *  - colorId / sizeId opcionales
 *  - stockRowId (id_stock_color_size) para saber exactamente
 *    qué combinación se está comprando.
 ************************************************************/

export type CartItem = {
  // id interno del carrito (ej: "prod:3:color:1:size:2")
  id: string;

  // referencia a la BD
  productId: Id;
  stockRowId: Id;           // stock_color_size.id_stock_color_size

  // info de presentación
  slug: string;
  name: string;
  price: number;
  qty: number;
  image?: string;

  // variante
  colorId?: Id | null;
  sizeId?: Id | null;
  colorName?: string | null;
  sizeLabel?: string | null;

  // por si queremos mostrar stock restante
  availableStock?: number;
};

/************************************************************
 * VENTAS / PEDIDOS (ALINEADO A orders / order_items)
 ************************************************************/

export type CustomerInfo = {
  fullName: string;
  country: string;
  address: string;
  city: string;
  zip: string;
  phone: string;
  email: string;
};

export type OrderItemDTO = {
  orderItemId?: Id;   // opcional si ya existe en BD
  productId: Id;
  stockRowId: Id;
  qty: number;
  price: number;
  colorId?: Id | null;
  sizeId?: Id | null;
};

export type OrderDTO = {
  id: Id;
  userId?: Id | null;
  total: number;
  status: string;
  createdAt: string; // ISO
  items: OrderItemDTO[];
  customer?: Partial<CustomerInfo>;
};




/************************************************************
 * ADMIN / API RESPONSES
 ************************************************************/

export type ProductsApiResponse = {
  products: ProductWithRelations[];
};

export type SingleProductApiResponse = {
  product: ProductWithRelations | null;
};

export type OrdersApiResponse = {
  orders: OrderDTO[];
};

/*
export type ProductFilters = {
  search: string;
  categoryId: number | null;
  typeId: number | null;
  sort: string;            // price_asc | price_desc | newest | oldest
  page: number;
  limit: number;
  minPrice: number;
}; */