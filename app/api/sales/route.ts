// app/api/sales/route.ts
import { NextResponse } from "next/server";
import type { SaleRecord } from "@/lib/admin/types";
import {
  salesMemory,
  addSaleToMemory,
} from "@/lib/server/salesMemory";

// GET /api/sales
export async function GET() {
  // aquí podrías en el futuro mezclar sales reales + memoria
  return NextResponse.json(salesMemory satisfies SaleRecord[]);
}

// POST /api/sales
export async function POST(req: Request) {
  const body = (await req.json()) as Omit<SaleRecord, "id" | "createdAt">;
  const created = addSaleToMemory(body);
  return NextResponse.json(created, { status: 201 });
}
