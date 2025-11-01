// app/api/sales/route.ts
import { NextResponse } from "next/server";
import { salesMemory, addSaleToMemory } from "@/lib/server/salesMemory";

export async function GET() {
  return NextResponse.json(
    {
      sales: salesMemory,
      from: "memory",
    },
    { status: 200 }
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body || !Array.isArray(body.items)) {
      return NextResponse.json(
        { error: "Formato de venta inválido" },
        { status: 400 }
      );
    }

    const saved = addSaleToMemory(body);

    return NextResponse.json(
      {
        ok: true,
        sale: saved,
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Error al procesar la venta" },
      { status: 500 }
    );
  }
}
