// app/api/admin/product-images/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ImagePayload = {
  colorId: number;
  imageData: string; // base64
};

type BodyPayload = {
  productId: number;
  images: ImagePayload[];
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as BodyPayload;
    const productId = body.productId;
    const images = body.images ?? [];

    if (!productId || !Array.isArray(images)) {
      return NextResponse.json(
        { error: "productId e images son obligatorios" },
        { status: 400 }
      );
    }

    // Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id: BigInt(productId) },
    });

    if (!product) {
      return NextResponse.json(
        { error: `Producto con id ${productId} no existe` },
        { status: 404 }
      );
    }

    // Estrategia simple:
    // 1) Borramos todas las imágenes previas del producto
    // 2) Insertamos las nuevas
    await prisma.productColorImage.deleteMany({
      where: { productId: BigInt(productId) },
    });

    if (images.length > 0) {
      await prisma.productColorImage.createMany({
        data: images.map((img) => ({
          productId: BigInt(productId),
          colorId: BigInt(img.colorId),
          imageUrl: img.imageData, // Base64 aquí mismo
        })),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/admin/product-images] error:", err);
    return NextResponse.json(
      { error: "Error interno al guardar imágenes" },
      { status: 500 }
    );
  }
}
