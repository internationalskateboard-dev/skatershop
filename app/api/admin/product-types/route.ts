// app/api/admin/product-types/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ProductType } from "@/lib/types";

/** Normalizador */
function mapProductType(row: any): ProductType {
  return {
    id: Number(row.id),
    name: row.name,
  };
}

export async function GET() {
  try {
    const rows = await prisma.productType.findMany({
      orderBy: { id: "asc" },
    });

    const types: ProductType[] = rows.map(mapProductType);

    return NextResponse.json({ types });
  } catch (err) {
    console.error("[GET /api/admin/product-types] error:", err);
    return NextResponse.json(
      { error: "No se pudieron cargar los tipos de producto" },
      { status: 500 }
    );
  }
}
