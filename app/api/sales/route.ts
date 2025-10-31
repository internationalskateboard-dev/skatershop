// app/api/sales/route.ts
import { NextResponse } from "next/server";
import useSalesStore from "@/store/salesStore";
import type { SaleItem, SaleRecord } from "@/lib/types";

/**
 * GET /api/sales
 * ------------------------------------------------------------
 * Devuelve todas las ventas registradas en memoria (Zustand).
 * Más adelante se puede paginar y filtrar por fecha.
 */
export async function GET() {
  const salesState = useSalesStore.getState();
  // en tu store actual suele ser algo como `sales` o `history`
  const sales = (salesState.sales ?? []) as SaleRecord[];

  return NextResponse.json(
    {
      ok: true,
      count: sales.length,
      sales,
    },
    { status: 200 }
  );
}

/**
 * POST /api/sales
 * ------------------------------------------------------------
 * Registra una venta "a mano" (útil si más adelante tienes pagos
 * fuera de PayPal o desde el admin).
 *
 * Body esperado:
 * {
 *   "items": [{ "productId": "hoodie", "qty": 1, "size": "M" }],
 *   "total": 49.99,
 *   "customer": { ... }
 * }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const items = body.items as SaleItem[] | undefined;
    const total = typeof body.total === "number" ? body.total : undefined;
    const customer = body.customer as SaleRecord["customer"] | undefined;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          message: "items es obligatorio y debe ser un array",
        },
        { status: 400 }
      );
    }

    const salesState = useSalesStore.getState();
    // tu store tenía `addSaleBatch(...)`, lo aprovechamos
    salesState.addSaleBatch(items, {
      total,
      customer,
    });

    return NextResponse.json(
      {
        ok: true,
        message: "Venta registrada",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/sales error:", err);
    return NextResponse.json(
      {
        ok: false,
        message: "Error al registrar la venta",
      },
      { status: 500 }
    );
  }
}
