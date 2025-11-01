// app/api/sales/[id]/route.ts
import { NextResponse } from "next/server";
import {
  salesMemory,
  removeSaleFromMemory,
} from "@/lib/server/salesMemory";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const sale = salesMemory.find((s) => s.id === id);
  if (!sale) {
    return NextResponse.json(
      { error: "Venta no encontrada" },
      { status: 404 }
    );
  }

  return NextResponse.json({ sale }, { status: 200 });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const removed = removeSaleFromMemory(id);

  // aunque no esté en memoria, devolvemos 200 para no romper el admin
  if (!removed) {
    return NextResponse.json(
      {
        ok: true,
        note: "La venta no estaba en memoria (posible origen local / zustand)",
      },
      { status: 200 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
