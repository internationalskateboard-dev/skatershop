// app/api/admin/sizes/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Size } from "@/lib/types";

function mapSize(row: any): Size {
  return {
    id: Number(row.id),
    label: row.label,
    productTypeId: Number(row.productTypeId),
  };
}

/**
 * GET /api/admin/sizes?productTypeId=1
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productTypeIdParam = searchParams.get("productTypeId");

    if (!productTypeIdParam) {
      return NextResponse.json(
        { error: "productTypeId es obligatorio" },
        { status: 400 }
      );
    }

    const productTypeId = Number(productTypeIdParam);
    if (Number.isNaN(productTypeId)) {
      return NextResponse.json(
        { error: "productTypeId debe ser numérico" },
        { status: 400 }
      );
    }

    // ⚠️ Ajusta `prisma.size` y nombres de campos a tu schema real
    const rows = await prisma.size.findMany({
      where: { typeId: BigInt(productTypeId) },
      orderBy: { id: "asc" },
    });

    const sizes: Size[] = rows.map(mapSize);

    return NextResponse.json({ sizes });
  } catch (err) {
    console.error("[GET /api/admin/sizes] error:", err);
    return NextResponse.json(
      { error: "No se pudieron cargar las tallas" },
      { status: 500 }
    );
  }
}
