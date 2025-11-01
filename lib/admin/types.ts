// lib/admin/types.ts

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
