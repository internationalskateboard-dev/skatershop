// app/api/products/route.ts
import { NextResponse } from "next/server";
import type { Product, ProductsApiResponse } from "@/lib/types";
import { fetchJsonOrNull } from "@/lib/server/dataSource";
import {
  productsMemory,
  upsertProductInMemory,
} from "@/lib/server/productsMemory";
import { productsBase } from "@/lib/productsBase";

// GET /api/products
export async function GET(req: Request) {
  const url = new URL(req.url);
  const forcedSource = url.searchParams.get("source"); // "api" | "local" | null

  const externalUrl = process.env.SKATERSHOP_PRODUCTS_URL;

  // ---------- 1) FORZADO A API ----------
  if (forcedSource === "api") {
    const external = await fetchJsonOrNull(externalUrl);

    // { products: [...] }
    if (external && Array.isArray((external as any).products)) {
      return NextResponse.json({
        products: (external as any).products as Product[],
      } satisfies ProductsApiResponse);
    }

    // [ ... ]
    if (external && Array.isArray(external)) {
      return NextResponse.json({
        products: external as Product[],
      } satisfies ProductsApiResponse);
    }

    // si pidieron API pero no hay → devolvemos local
    const localProducts = [...productsMemory, ...productsBase];
    return NextResponse.json({
      products: localProducts,
    } satisfies ProductsApiResponse);
  }

  // ---------- 2) FORZADO A LOCAL ----------
  if (forcedSource === "local") {
    const localProducts = [...productsMemory, ...productsBase];
    return NextResponse.json({
      products: localProducts,
    } satisfies ProductsApiResponse);
  }

  // ---------- 3) MODO AUTO (el de siempre) ----------
  const external = await fetchJsonOrNull(externalUrl);

  // { products: [...] }
  if (external && Array.isArray((external as any).products)) {
    return NextResponse.json({
      products: (external as any).products as Product[],
    } satisfies ProductsApiResponse);
  }

  // [ ... ]
  if (external && Array.isArray(external)) {
    return NextResponse.json({
      products: external as Product[],
    } satisfies ProductsApiResponse);
  }

  // fallback → memoria + base
  const localProducts = [...productsMemory, ...productsBase];
  return NextResponse.json({
    products: localProducts,
  } satisfies ProductsApiResponse);
}

// POST /api/products
export async function POST(req: Request) {
  const body = (await req.json()) as Product;

  if (!body.id) {
    return NextResponse.json(
      { error: "id es requerido" },
      { status: 400 }
    );
  }

  // tu memoria usa upsertProductInMemory
  const saved = upsertProductInMemory(body);

  return NextResponse.json(saved, { status: 201 });
}
