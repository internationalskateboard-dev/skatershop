import { NextResponse } from "next/server";
import type { SaleItem } from "@/lib/types";
import useSalesStore from "@/store/salesStore";

// GET /api/sales
// Devuelve el historial de ventas
export async function GET() {
  const state = useSalesStore.getState();
  return NextResponse.json(
    {
      ok: true,
      sales: state.sales,
      count: state.sales.length,
    },
    { status: 200 }
  );
}

// POST /api/sales
// Registra una venta "manual" (misma forma que usa checkout)
// Body: { items: SaleItem[], customer?: {...}, total?: number }
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

    const salesStore = useSalesStore.getState();
    salesStore.addSaleBatch(items, {
      total: body.total,
      customer: body.customer,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("POST /api/sales error:", err);
    return NextResponse.json(
      { ok: false, message: "Error al registrar venta" },
      { status: 500 }
    );
  }
}