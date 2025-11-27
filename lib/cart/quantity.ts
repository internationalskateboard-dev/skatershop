// lib/cart/quantity.ts
export function getSafeQuantity(item: any, delta: number) {
  
  const stock = item.stock ?? 1;
  const next = item.qty + delta;

  const safe = Math.min(stock, Math.max(1, next));
  return safe;
}

