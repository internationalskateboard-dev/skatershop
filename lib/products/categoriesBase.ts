// lib/products/categoriesBase.ts
export type ProductCategoryOption = {
  id: number;
  name: string;
};

export const productCategoriesBase: ProductCategoryOption[] = [
  { id: 1, name: "Ropa" },
  { id: 2, name: "Skate" },
  { id: 3, name: "Arte" },
  { id: 4, name: "Hogar" },
  { id: 5, name: "Colecciones" },
  { id: 6, name: "Higiene" },
  { id: 7, name: "Accesorios" },
];

// Cache en memoria (Option C: memoria + fallback al archivo)
let productCategoriesCache: ProductCategoryOption[] | null = null;

export function getProductCategoriesFromCache(): ProductCategoryOption[] {
  return productCategoriesCache ?? productCategoriesBase;
}

export function setProductCategoriesCache(data: ProductCategoryOption[]) {
  productCategoriesCache = data;
}
