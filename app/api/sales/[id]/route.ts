// app/api/sales/[id]/route.ts
import { NextResponse } from "next/server";
import {
  getSaleFromMemory,
  removeSaleFromMemory,
} from "@/lib/server/salesMemory";
import type { SaleRecord } from "@/lib/types";


// GET /api/sales/:id
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // 👈 importante el await

  // aquí tu lógica actual
  // por ejemplo:
  // const sale = getSaleFromMemory(id);
  // if (!sale) {
  //   return NextResponse.json({ error: "Sale not found" }, { status: 404 });
  // }
  // return NextResponse.json(sale);
const sale = getSaleFromMemory(id);
  if (!sale) {
    return NextResponse.json({ error: "Sale not found" }, { status: 404 });
  }
  return NextResponse.json(sale as SaleRecord);




}











type Params = {
  params: { id: string };
};
/*
export async function GETs(_req: Request, { params }: Params) {
  const { id } = params;
  const sale = getSaleFromMemory(id);
  if (!sale) {
    return NextResponse.json({ error: "Sale not found" }, { status: 404 });
  }
  return NextResponse.json(sale as SaleRecord);
} */
/*
export async function DELETE(_req: Request, { params }: Params) {
  const { id } = params;
  const ok = removeSaleFromMemory(id);
  if (!ok) {
    return NextResponse.json({ error: "Sale not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}*/

// DELETE /api/sales/:id
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // tu lógica actual
   const ok = removeSaleFromMemory(id);
   if (!ok) {
     return NextResponse.json({ error: "Sale not found" }, { status: 404 });
   }
   return NextResponse.json({ ok: true });
}
