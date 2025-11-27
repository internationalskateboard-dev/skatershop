// lib/products/typesBase.ts
export type ProductTypeOption = {
  id: number;
  name: string;
};

export const productTypesBase: ProductTypeOption[] = [
  { id: 1, name: "Camisas" },
  { id: 2, name: "Sueters" },
  { id: 3, name: "Zapatos" },
  { id: 4, name: "Skateboard" },
  { id: 5, name: "Art" },
  { id: 6, name: "Accessory" },
];

// Cache en memoria (Option C: memoria + fallback al archivo)
let productTypesCache: ProductTypeOption[] | null = null;

export function getProductTypesFromCache(): ProductTypeOption[] {
  return productTypesCache ?? productTypesBase;
}

export function setProductTypesCache(data: ProductTypeOption[]) {
  productTypesCache = data;
}
