// app/api/admin/categories/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Category } from "@/lib/types";

function mapCategory(row: any): Category {
  return {
    id: Number(row.id),
    name: row.name,
  };
}

export async function GET() {
  try {
    const rows = await prisma.category.findMany({
      orderBy: { id: "asc" },
    });

    const categories: Category[] = rows.map(mapCategory);

    return NextResponse.json({ categories });
  } catch (err) {
    console.error("[GET /api/admin/categories] error:", err);
    return NextResponse.json(
      { error: "No se pudieron cargar las categorías" },
      { status: 500 }
    );
  }
}
