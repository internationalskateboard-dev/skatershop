import { NextResponse } from "next/server";
import type { SaleItem } from "@/lib/types";
import useProductStore from "@/store/productStore";
import useSalesStore from "@/store/salesStore";

// POST /api/checkout
// Body esperado:
// {
//   items: [{ productId, qty, size? }, ...],
//   customer?: { ... },
//   total?: number
// }
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const items = body.items as SaleItem[] | undefined;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { ok: false, message: "items es obligatorio" },
        { status: 400 }
      );
    }

    const productStore = useProductStore.getState();
    const salesStore = useSalesStore.getState();

    // 1) Validar stock local
    const outOfStock: string[] = [];
    items.forEach((item) => {
      const p = productStore.products.find((x) => x.id === item.productId);
      if (!p) {
        outOfStock.push(
          `Producto no encontrado: ${item.productId}`
        );
        return;
      }
      const stock = typeof p.stock === "number" ? p.stock : Infinity;
      if (item.qty > stock) {
        outOfStock.push(
          `${p.name} (stock: ${stock}, pedido: ${item.qty})`
        );
      }
    });

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

    // 2) Registrar venta
    salesStore.addSaleBatch(items, {
      total: body.total,
      customer: body.customer,
    });

    // 3) Reducir stock
    productStore.reduceStockBatch(items);

    return NextResponse.json(
      { ok: true, message: "Checkout registrado" },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/checkout error:", err);
    return NextResponse.json(
      { ok: false, message: "Error en checkout" },
      { status: 500 }
    );
  }
}
