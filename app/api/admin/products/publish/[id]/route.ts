import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = Number(params.id);

    if (Number.isNaN(productId)) {
      return NextResponse.json(
        { error: "ID inválido." },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: BigInt(productId) },
      select: { published: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado." },
        { status: 404 }
      );
    }

    const updated = await prisma.product.update({
      where: { id: BigInt(productId) },
      data: { published: !product.published },
      select: { id: true, published: true },
    });

    return NextResponse.json({
      ok: true,
      id: Number(updated.id),
      published: updated.published,
    });
  } catch (err) {
    console.error("[PATCH /publish/[id]] error:", err);
    return NextResponse.json(
      { error: "No se pudo actualizar el estado publicado." },
      { status: 500 }
    );
  }
}
