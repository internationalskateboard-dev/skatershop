// app/api/sales/[id]/route.ts
import { NextResponse } from "next/server";
import {
  getSaleFromMemory,
  removeSaleFromMemory,
} from "@/lib/server/salesMemory";
import type { SaleRecord } from "@/lib/types";

type Params = {
  params: { id: string };
};

export async function GET(_req: Request, { params }: Params) {
  const { id } = params;
  const sale = getSaleFromMemory(id);
  if (!sale) {
    return NextResponse.json({ error: "Sale not found" }, { status: 404 });
  }
  return NextResponse.json(sale as SaleRecord);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = params;
  const ok = removeSaleFromMemory(id);
  if (!ok) {
    return NextResponse.json({ error: "Sale not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
