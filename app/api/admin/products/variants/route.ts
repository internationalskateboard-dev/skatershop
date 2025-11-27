// app/api/admin/products/variants/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type VariantPayload = {
  colorId: number;
  sizeId: number;
  stock: number;
};

type BodyPayload = {
  productId: number;
  variants: VariantPayload[];
};

/**
 * POST /api/admin/products/variants
 * Body: { productId, variants: [{colorId,sizeId,stock}, ...] }
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as BodyPayload;

    const productId = Number(body.productId);
    const variants = Array.isArray(body.variants) ? body.variants : [];

    if (!productId || variants.length === 0) {
      return NextResponse.json(
        { error: "productId y variants son obligatorios" },
        { status: 400 }
      );
    }

    for (const v of variants) {
      if (!v.colorId || !v.sizeId || v.stock < 0) {
        return NextResponse.json(
          { error: "Cada variante debe tener colorId, sizeId y stock >= 0" },
          { status: 400 }
        );
      }
    }

    const pid = BigInt(productId);

    // 1) Buscar filas de stock actuales del producto
    const existingStockRows = await prisma.stockColorSize.findMany({
      where: { productId: pid },
      select: { id: true },
    });

    const existingStockIds = existingStockRows.map((r: any) => r.id);

    // 2) Eliminar productvariant que referencie esas filas
    if (existingStockIds.length > 0) {
      await prisma.productVariant.deleteMany({
        where: { stockColorSizeId: { in: existingStockIds } },
      });
    }

    // 3) Eliminar stock_color_size del producto
    await prisma.stockColorSize.deleteMany({
      where: { productId: pid },
    });

    // 4) Crear nuevas filas stock_color_size
    const createdStockRows = await prisma.$transaction(
      variants.map((v) =>
        prisma.stockColorSize.create({
          data: {
            productId: pid,
            colorId: BigInt(v.colorId),
            sizeId: BigInt(v.sizeId),
            stock: v.stock,
          },
        })
      )
    );

    // 5) Crear productvariant para cada fila de stock recién creada
    await prisma.$transaction(
      createdStockRows.map((row, idx) =>
        prisma.productVariant.create({
          data: {
            productId: pid,
            colorId: BigInt(variants[idx].colorId),
            sizeId: BigInt(variants[idx].sizeId),
            stockColorSizeId: row.id,
          },
        })
      )
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/admin/products/variants] error:", err);
    return NextResponse.json(
      { error: "Error interno al guardar variantes" },
      { status: 500 }
    );
  }
}
