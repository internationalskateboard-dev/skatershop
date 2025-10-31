// app/api/checkout/route.ts
import { NextResponse } from "next/server";
import useProductStore from "@/store/productStore";
import useSalesStore from "@/store/salesStore";
import type { SaleItem } from "@/lib/types";

/**
 * POST /api/checkout
 * ------------------------------------------------------------
 * Body esperado:
 * {
 *   items: [{ productId, qty, size? }, ...],
 *   customer?: { ... },
 *   total?: number
 * }
 *
 * Qué hace:
 * 1. Valida que existan los productos en el store
 * 2. Verifica stock (si el producto no tiene stock definido → lo deja pasar)
 * 3. Si algún producto no tiene stock suficiente → responde 409 con detalles
 * 4. Si todo OK:
 *    - registra la venta en salesStore
 *    - reduce stock en productStore
 *    - devuelve 201
 *
 * ⚠️ Importante:
 * - NO toca ni borra campos extra del producto (colors, sizeGuide, image...)
 * - Todo queda en memoria por ahora (fase sin DB)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const items = body.items as SaleItem[] | undefined;
    const customer = body.customer as
      | {
          fullName?: string;
          email?: string;
          phone?: string;
          country?: string;
          adresse?: string;
          city?: string;
          zip?: string;
        }
      | undefined;
    const total = typeof body.total === "number" ? body.total : undefined;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          message: "items es obligatorio y debe ser un array",
        },
        { status: 400 }
      );
    }

    const productStore = useProductStore.getState();
    const salesStore = useSalesStore.getState();

    // 1) Validar stock
    const outOfStock: string[] = [];

    for (const item of items) {
      const p = productStore.findById(item.productId);

      if (!p) {
        outOfStock.push(`Producto no encontrado: ${item.productId}`);
        continue;
      }

      // si no tiene stock definido → lo dejamos pasar
      const stock = typeof p.stock === "number" ? p.stock : Infinity;

      if (item.qty > stock) {
        outOfStock.push(
          `${p.name} → stock: ${stock}, pedido: ${item.qty}`
        );
      }
    }

    if (outOfStock.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          message: "Stock insuficiente en uno o más productos.",
          details: outOfStock,
        },
        { status: 409 }
      );
    }

    // 2) Registrar venta en memoria
    // el salesStore debe tener un método tipo addSaleBatch(...)
    // que ya está preparado para items + info extra
    salesStore.addSaleBatch(items, {
      total,
      customer,
    });

    // 3) Reducir stock en el store de productos
    productStore.reduceStockBatch(items);

    return NextResponse.json(
      {
        ok: true,
        message: "Checkout registrado",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/checkout error:", err);
    return NextResponse.json(
      {
        ok: false,
        message: "Error interno en checkout",
      },
      { status: 500 }
    );
  }
}
