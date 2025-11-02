/**
 * salesBase
 * ------------------------------------------------------------
 * Ventas de ejemplo / precargadas.
 * La idea es idéntica a productsBase:
 *
 * - Sirven para que el admin tenga algo que mostrar aunque la API
 *   todavía no tenga ventas reales.
 * - Se pueden mezclar con las ventas que vienen de memoria
 *   (listSalesFromMemory) o las que vengan del backend remoto.
 *
 * IMPORTANTE:
 * Los productId usados aquí deben existir en productsBase.ts
 * o en la fuente real, para que el dashboard pueda calcular totales
 * y match de stock sin errores.
 */

import type { SaleRecord } from "./types";

export const salesBase: SaleRecord[] = [
  {
    id: "sale-seed-1",
    createdAt: "2025/11/02",
    items: [
      {
        // existe en lib/productsBase.ts
        productId: "hoodie-black",
        qty: 1,
      },
    ],
    total: 39.9,
    customer: {
      fullName: "Cliente Demo",
      email: "demo@example.com",
      country: "ES",
      city: "Madrid",
      adresse: "Calle Falsa 123",
      zip: "28001",
      phone: "+34 600 000 000",
    },
  },
  {
    id: "sale-seed-2",
    createdAt: "2025-11-02",
    items: [
      {
        // también existe en lib/productsBase.ts
        productId: "cap-yellow",
        qty: 2,
      },
    ],
    total: 36, // 18 * 2
    customer: {
      fullName: "Walk-in",
      country: "ES",
      city: "Barcelona",
    },
  },
  {
    id: "sale-seed-3",
    createdAt: "2025-11-02",
    items: [
      {
        productId: "hoodie-black",
        qty: 1,
      },
      {
        productId: "cap-yellow",
        qty: 1,
      },
    ],
    // 39.9 + 18
    total: 57.9,
    customer: {
      fullName: "Pedido mixto",
      email: "mix@example.com",
    },
  },
];

/**
 * Si quieres usarlo igual que productsBase desde server/client,
 * expórtalo con una función; esto ayuda si luego quieres inyectar más:
 * 
 * export function getSalesBase(): SaleRecord[] {
  return salesBase;
}
 * 
 */

