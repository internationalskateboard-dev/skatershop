// lib/admin/types.ts

// ----- SALES -----
export interface SaleItem {
  productId: string;
  qty: number;
  size?: string;
}

export interface SaleCustomer {
  fullName?: string;
  email?: string;
}

export interface SaleRecord {
  id: string;
  createdAt: string; // ISO
  items: SaleItem[];
  total: number;
  customer?: SaleCustomer;
}

// ----- PRODUCTS -----
export interface ProductColor {
  name: string;
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  desc?: string;
  details?: string;
  image?: string;
  sizes?: string[];
  colors?: ProductColor[];
  stock?: number;
  sizeGuide?: string;
}
