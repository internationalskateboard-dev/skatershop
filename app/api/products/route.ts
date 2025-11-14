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
export async function GET(req: Request) {
  const url = new URL(req.url);
  const forcedSource = url.searchParams.get("source"); // "db" | "local" | "memory"

  // Forzado a BD
  if (forcedSource === "db") {
    const dbProducts = await prisma.product.findMany();
    return NextResponse.json({
      products: dbProducts.map(mapDbProductToProduct),
    });
  }

  // Forzado a local
  if (forcedSource === "local") {
    return NextResponse.json({
      products: [...productsMemory, ...productsBase],
    });
  }

  // AUTO — siempre intentar BD primero
  try {
    const dbProducts = await prisma.product.findMany();

    // ⚠️ Aunque esté vacío, devolvemos BD
    return NextResponse.json({
      products: dbProducts.map(mapDbProductToProduct),
    });
  } catch (err) {
    console.error("[GET /api/products] Error leyendo BD:", err);
  }

  // Solo si BD falla → fallback
  return NextResponse.json({
    products: [...productsMemory, ...productsBase],
  });
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
