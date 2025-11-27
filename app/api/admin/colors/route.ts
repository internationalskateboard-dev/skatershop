// app/api/admin/colors/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Color } from "@/lib/types";

function mapColor(row: any): Color {
  return {
    id: Number(row.id),
    name: row.name,
  };
}

export async function GET() {
  try {
    const rows = await prisma.color.findMany({
      orderBy: { id: "asc" },
    });

    const colors: Color[] = rows.map((r: any) => ({
      id: Number(r.id),
      name: r.name,
    }));

    return NextResponse.json({ colors });
  } catch (err) {
    console.error("[GET /api/admin/colors] error:", err);
    return NextResponse.json(
      { error: "No se pudieron cargar los colores" },
      { status: 500 }
    );
  }
}
