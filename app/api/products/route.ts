// app/api/products/route.ts
import { NextResponse } from "next/server";
import type { Product } from "@/lib/admin/types";
import {
  productsMemory,
  upsertProductInMemory,
} from "@/lib/server/productsMemory";

// GET /api/products
export async function GET() {
  // si tuvieras una "base" real, aquí la mezclarías
  // por ahora devolvemos solo lo que hay en memoria
  return NextResponse.json({
    products: productsMemory satisfies Product[],
  });
}

// POST /api/products
// crea o actualiza en memoria
export async function POST(req: Request) {
  const body = (await req.json()) as Product;

  if (!body.id) {
    return NextResponse.json(
      { error: "Product id is required" },
      { status: 400 }
    );
  }

  const saved = upsertProductInMemory(body);
  return NextResponse.json(saved, { status: 201 });
}
