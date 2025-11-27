// app/api/admin/products/list/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const rows = await prisma.product.findMany({
      include: {
        category: true,
        type: true,
        images: {
          orderBy: { id: "asc" }, // primera imagen por color = primero
        },
        stockItems: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const products = rows.map((p) => ({
      id: Number(p.id),
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      category: p.category ? p.category.name : null,
      productType: p.type ? p.type.name : null,
      createdAt: p.createdAt.toISOString(),

      // primera imagen disponible
      thumbnail:
        p.images.length > 0 ? p.images[0].imageUrl : null,

      // suma total stock
      stockTotal: p.stockItems.reduce((acc, row) => acc + row.stock, 0),
    }));

    return NextResponse.json({ products });
  } catch (err) {
    console.error("[GET /api/admin/products/list] error:", err);
    return NextResponse.json(
      { error: "Error cargando productos" },
      { status: 500 }
    );
  }
}
