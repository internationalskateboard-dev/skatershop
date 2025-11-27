// lib/products/getAllProducts.ts
export type AdminProductListItem = {
  id: number;
  name: string;
  slug: string;
  price: number;
  category: string | null;
  productType: string | null;
  thumbnail: string | null;
  createdAt: string;
  stockTotal: number;
};

export async function getAllProducts(): Promise<AdminProductListItem[]> {
  const res = await fetch("/api/admin/products/list");
  const data = await res.json();
  return data.products ?? [];
}
