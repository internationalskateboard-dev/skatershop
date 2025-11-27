// app/api/products/route.ts
import { NextResponse } from "next/server";
import type { Product, ProductsApiResponse } from "@/lib/types";
import { productsBase } from "@/lib/productsBase";
import {
  productsMemory,
  upsertProductInMemory,
} from "@/lib/server/productsMemory";
import { prisma } from "@/lib/server/prisma";
import {
  mapDbProductToProduct,
  mapProductToDbData,
} from "@/lib/server/mappers";
import { sanitizeProductImages } from "@/lib/utils/product/sanitizeProduct";

// GET /api/products
// Opcional: ?source=db | local | memory
export async function GET(req: Request) {
  const url = new URL(req.url);
  const forcedSource = url.searchParams.get("source"); // "db" | "local" | "memory" | null

  // 1) Forzado a BD
  if (forcedSource === "db") {
    const dbProducts = await prisma.product.findMany();
    const products: Product[] = dbProducts.map(mapDbProductToProduct);
    return NextResponse.json({ products } satisfies ProductsApiResponse);
  }

  // 2) Forzado a local (memoria + base)
  if (forcedSource === "local") {
    const localProducts = [...productsMemory, ...productsBase].map(
      sanitizeProductImages
    );

    return NextResponse.json({
      products: localProducts,
    });
  }

  // 3) Auto (producción): siempre intentar BD primero
try {
  const dbProducts = await prisma.product.findMany();
  const products = dbProducts.map(mapDbProductToProduct).map(sanitizeProductImages);

  return NextResponse.json({ products });
} catch {
  // Fallback local
  const fallback = [...productsMemory, ...productsBase].map(sanitizeProductImages);

  return NextResponse.json({ products: fallback });
}

  // 4) Fallback: solo si la BD falla de verdad
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
      return NextResponse.json({ error: "id es requerido" }, { status: 400 });
    }

    // ------------------------------------------------------------------
    // 1) Normalizar variantStock que viene del formulario
    // ------------------------------------------------------------------
    const rawVariantStock = (body as any).variantStock ?? [];
    const variantStock = Array.isArray(rawVariantStock)
      ? rawVariantStock.map((v) => ({
          size:
            v.size === undefined || v.size === "" ? null : (v.size as string),
          colorName:
            v.colorName === undefined || v.colorName === ""
              ? null
              : (v.colorName as string),
          stock: Number.isFinite(Number(v.stock)) ? Number(v.stock) : 0,
        }))
      : [];

    // ------------------------------------------------------------------
    // 2) Calcular stock total según la opción C:
    //    - Si hay variantes → suma de los stock de las variantes
    //    - Si NO hay variantes → usar body.stock (o 0)
    // ------------------------------------------------------------------
    const totalStock =
      variantStock.length > 0
        ? variantStock.reduce((acc, v) => acc + (v.stock || 0), 0)
        : body.stock ?? 0;

    // ------------------------------------------------------------------
    // 3) Mapear Product -> datos para DB (manteniendo tu mapper)
    //    y forzar stock + variantStock en el objeto data
    // ------------------------------------------------------------------
    let data = mapProductToDbData({
      ...body,
      stock: totalStock,
    } as Product);

    data = {
      ...data,
      stock: totalStock,
      variantStock, // 👈 se guarda en la columna Json de Prisma
    };

    // Guardar en DB (upsert)
    await prisma.product.upsert({
      where: { id: body.id },
      create: data as any,
      update: data as any,
    });

    // Mantener comportamiento actual en memoria (por compatibilidad)
    const saved = upsertProductInMemory({
      ...body,
      stock: totalStock,
      variantStock,
    });

    return NextResponse.json(saved, { status: 201 });
  } catch (err) {
    console.error("[POST /api/products] Error", err);
    return NextResponse.json(
      { error: "Error interno creando producto" },
      { status: 500 }
    );
  }
}
