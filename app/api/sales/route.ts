// app/api/sales/route.ts
import { NextResponse } from "next/server";
import type { SaleRecord, SalesApiResponse } from "@/lib/types";
import { salesMemory, addSaleToMemory } from "@/lib/server/salesMemory";

// GET /api/sales
export async function GET() {
  const payload: SalesApiResponse = {
    sales: salesMemory,
  };
  return NextResponse.json(payload);
}

// POST /api/sales
export async function POST(req: Request) {
  const body = (await req.json()) as Omit<SaleRecord, "id" | "createdAt">;
  const created = addSaleToMemory(body);
  return NextResponse.json(created, { status: 201 });
}
