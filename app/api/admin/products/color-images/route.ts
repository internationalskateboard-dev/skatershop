// app/api/admin/products/color-images/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productIdParam = searchParams.get("productId");

    if (!productIdParam) {
      return NextResponse.json(
        { error: "productId es obligatorio" },
        { status: 400 }
      );
    }

    const productId = Number(productIdParam);
    if (Number.isNaN(productId)) {
      return NextResponse.json(
        { error: "productId debe ser numérico" },
        { status: 400 }
      );
    }

    const pid = BigInt(productId);

    const rows = await prisma.productColorImage.findMany({
      where: { productId: pid },
      include: {
        color: true,
      },
      orderBy: { id: "asc" },
    });

    const colorImages = rows.map((row) => ({
      colorId: Number(row.colorId),
      colorName: row.color.name,
      imageUrl: row.imageUrl, // lo que guardaste en BD
    }));

    return NextResponse.json({ colorImages });
  } catch (err) {
    console.error("[GET /api/admin/products/color-images] error:", err);
    return NextResponse.json(
      { error: "No se pudieron cargar los colores con imagen" },
      { status: 500 }
    );
  }
}
