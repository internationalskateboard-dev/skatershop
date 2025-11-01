// app/api/sales/[id]/route.ts
import { NextResponse } from "next/server";
import { getSaleFromMemory, removeSaleFromMemory } from "@/lib/server/salesMemory";

type Params = {
  params: { id: string };
};

export async function GET(_req: Request, { params }: Params) {
  const sale = getSaleFromMemory(params.id);
  if (!sale) {
    return NextResponse.json({ error: "Sale not found" }, { status: 404 });
  }
  return NextResponse.json(sale);
}

export async function DELETE(_req: Request, { params }: Params) {
  const ok = removeSaleFromMemory(params.id);
  if (!ok) {
    return NextResponse.json({ error: "Sale not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
