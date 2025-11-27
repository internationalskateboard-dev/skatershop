// app/api/admin/products/color-images/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const productId = Number(id);

    if (Number.isNaN(productId)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    const rows = await prisma.productColorImage.findMany({
      where: { productId: BigInt(productId) },
      include: {
        color: true,
      },
      orderBy: { colorId: "asc" },
    });

    const colorImages = rows.map((r) => ({
      colorId: Number(r.colorId),
      colorName: r.color.name,
      imageUrl: r.imageUrl,
    }));

    return NextResponse.json({ colorImages });
  } catch (err) {
    console.error("[GET /api/admin/products/color-images/[id]] error:", err);
    return NextResponse.json(
      { error: "No se pudieron cargar imágenes del producto" },
      { status: 500 }
    );
  }
}
