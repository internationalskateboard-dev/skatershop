// app/api/products/route.ts
import { NextResponse } from "next/server";
import type { Product, ProductsApiResponse } from "@/lib/types";
import {
  productsMemory,
  upsertProductInMemory,
} from "@/lib/server/productsMemory";

// GET /api/products
export async function GET() {
  const payload: ProductsApiResponse = {
    products: productsMemory,
  };
  return NextResponse.json(payload);
}

// POST /api/products
export async function POST(req: Request) {
  const body = (await req.json()) as Product;
  if (!body.id) {
    return NextResponse.json({ error: "Product id is required" }, { status: 400 });
  }
  const saved = upsertProductInMemory(body);
  return NextResponse.json(saved, { status: 201 });
}
