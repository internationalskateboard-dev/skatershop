// app/api/products/route.ts
import { NextResponse } from "next/server";
import type { Product, ProductsApiResponse } from "@/lib/types";
import {
  productsMemory,
  upsertProductInMemory,
} from "@/lib/server/productsMemory";
import { fetchJsonOrNull } from "@/lib/server/dataSource";

// GET /api/products
export async function GET() {
  // 1) intentar backend externo
  const externalUrl = process.env.SKATERSHOP_PRODUCTS_URL;
  const external = await fetchJsonOrNull(externalUrl);

  // { products: [...] }
  if (external && Array.isArray((external as any).products)) {
    const payload: ProductsApiResponse = {
      products: (external as any).products as Product[],
    };
    return NextResponse.json(payload);
  }

  // [ ... ]
  if (external && Array.isArray(external)) {
    const payload: ProductsApiResponse = {
      products: external as Product[],
    };
    return NextResponse.json(payload);
  }

  // 2) fallback a memoria
  const payload: ProductsApiResponse = {
    products: productsMemory,
  };
  return NextResponse.json(payload);
}

// POST /api/products
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
