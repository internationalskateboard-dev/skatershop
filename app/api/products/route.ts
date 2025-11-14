// app/api/products/route.ts
import { NextResponse } from "next/server";
import type { Product, ProductsApiResponse } from "@/lib/types";
import { productsBase } from "@/lib/productsBase";
import {
  productsMemory,
  upsertProductInMemory,
} from "@/lib/server/productsMemory";
import { prisma } from "@/lib/server/prisma";
import { mapDbProductToProduct, mapProductToDbData } from "@/lib/server/mappers";

// GET /api/products
// Opcional: ?source=db | local | memory
export async function GET(req: Request) {
  const url = new URL(req.url);
  const forcedSource = url.searchParams.get("source"); // "db" | "local" | "memory" | null

  // --- 1) Forzado a DB ---
  if (forcedSource === "db") {
    const dbProducts = await prisma.product.findMany();
    const products: Product[] = dbProducts.map(mapDbProductToProduct);
    return NextResponse.json({ products } satisfies ProductsApiResponse);
  }

  // --- 2) Forzado a local (memoria + base) ---
  if (forcedSource === "local") {
    const localProducts = [...productsMemory, ...productsBase];
    return NextResponse.json({
      products: localProducts,
    } satisfies ProductsApiResponse);
  }

  // --- 3) Auto (modo producción recomendado) ---
  try {
    const dbProducts = await prisma.product.findMany();

    if (dbProducts.length > 0) {
      const products: Product[] = dbProducts.map(mapDbProductToProduct);
      return NextResponse.json({ products } satisfies ProductsApiResponse);
    }
  } catch (err) {
    console.error("[GET /api/products] Error leyendo DB", err);
    // seguimos abajo con fallback local
  }

  // Fallback: memoria + hardcoded
  const fallbackProducts = [...productsMemory, ...productsBase];
  return NextResponse.json({
    products: fallbackProducts,
  } satisfies ProductsApiResponse);
}

// POST /api/products
// Crea o actualiza producto en DB + memoria
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Product;

    if (!body.id) {
      return NextResponse.json(
        { error: "id es requerido" },
        { status: 400 }
      );
    }

    // Guardar en DB
    const data = mapProductToDbData(body);

    await prisma.product.upsert({
      where: { id: body.id },
      // 👇 aquí el cambio importante: data as any
      create: data as any,
      update: data as any,
    });

    // Mantener comportamiento actual en memoria (por compatibilidad)
    const saved = upsertProductInMemory(body);

    return NextResponse.json(saved, { status: 201 });
  } catch (err) {
    console.error("[POST /api/products] Error", err);
    return NextResponse.json(
      { error: "Error interno creando producto" },
      { status: 500 }
    );
  }
}
