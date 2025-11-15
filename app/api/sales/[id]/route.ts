// app/api/sales/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { mapDbSaleToSaleRecord } from "@/lib/server/mappers";
import { getSaleFromMemory, removeSaleFromMemory } from "@/lib/server/salesMemory";
import type { SaleRecord } from "@/lib/types";

// GET /api/sales/:id
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const dbSale = await prisma.sale.findUnique({ where: { id } });
    if (dbSale) {
      const sale: SaleRecord = mapDbSaleToSaleRecord(dbSale);
      return NextResponse.json(sale);
    }
  } catch (err) {
    console.error("[GET /api/sales/:id] Error DB", err);
  }

  const fromMemory = getSaleFromMemory(id);
  if (!fromMemory) {
    return NextResponse.json({ error: "Sale not found" }, { status: 404 });
  }

  return NextResponse.json(fromMemory);
}

// DELETE /api/sales/:id
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await prisma.sale.delete({ where: { id } });
  } catch (err) {
    console.error("[DELETE /api/sales/:id] Error DB", err);
    // no devolvemos 500 si no existe para mantener compatibilidad con memoria
  }

  const ok = removeSaleFromMemory(id);
  if (!ok) {
    // si no estaba en memoria tampoco, devolvemos 404 (opcional)
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
