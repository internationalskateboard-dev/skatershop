// app/api/admin/products/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type {
  ProductWithRelations,
  Category,
  ProductType,
  Color,
  Size,
  ProductColorImage,
  StockColorSizeRow,
  ProductVariantRow,
} from "@/lib/types";

// 👇 Importante: usamos `any` en el segundo argumento para evitar
// el conflicto de tipos de Next 15 (RouteContext / Promise<any>)
export async function GET(_req: Request, context: any) {
  try {
    const idParam = context?.params?.id;
    const idNum = Number(idParam);

    if (Number.isNaN(idNum)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const idBig = BigInt(idNum);

    // 1️⃣ Cargamos el producto + relaciones directas
    const dbProduct = await prisma.product.findUnique({
      where: { id: idBig },
      include: {
        category: true,
        type: true,
        images: {
          include: { color: true },
          orderBy: { id: "asc" },
        },
        stockItems: true,
        variants: true,
      },
    });

    if (!dbProduct) {
      return NextResponse.json(
        { error: `Producto con id ${idNum} no existe` },
        { status: 404 }
      );
    }

    // 2️⃣ Cargamos tallas del tipo de producto
    const dbSizes = await prisma.size.findMany({
      where: { typeId: dbProduct.typeId },
      orderBy: { id: "asc" },
    });

    // 3️⃣ Construimos objetos tipados según lib/types.ts

    const category: Category | null = dbProduct.category
      ? {
          id: Number(dbProduct.category.id),
          name: dbProduct.category.name,
        }
      : null;

    const productType: ProductType | null = dbProduct.type
      ? {
          id: Number(dbProduct.type.id),
          name: dbProduct.type.name,
        }
      : null;

    // Colores: los obtenemos de las imágenes por color
    const colorMap = new Map<number, Color>();
    for (const img of dbProduct.images) {
      const cid = Number(img.colorId);
      if (!colorMap.has(cid)) {
        colorMap.set(cid, {
          id: cid,
          name: img.color.name,
        });
      }
    }
    const colors = Array.from(colorMap.values());

    // 👇 aquí usamos `productTypeId` para alinear con tu `Size` de lib/types.ts
    const sizes: Size[] = dbSizes.map((s) => ({
      id: Number(s.id),
      label: s.label,
      productTypeId: Number(s.typeId),
    }));

    const colorImages: ProductColorImage[] = dbProduct.images.map((img) => ({
      id: Number(img.id),
      productId: Number(img.productId),
      colorId: Number(img.colorId),
      imageUrl: img.imageUrl,
    }));

    const stockRows: StockColorSizeRow[] = dbProduct.stockItems.map((row) => ({
      id: Number(row.id),
      productId: Number(row.productId),
      colorId: Number(row.colorId),
      sizeId: Number(row.sizeId),
      stock: row.stock,
    }));

    const variants: ProductVariantRow[] = dbProduct.variants.map((v) => ({
      id: Number(v.id),
      productId: Number(v.productId),
      colorId: Number(v.colorId),
      sizeId: Number(v.sizeId),
      stockColorSizeId: Number(v.stockColorSizeId),
    }));

    const product: ProductWithRelations = {
      id: Number(dbProduct.id),
      slug: dbProduct.slug,
      name: dbProduct.name,
      price: Number(dbProduct.price),
      desc: dbProduct.desc ?? null,
      details: dbProduct.details ?? null,
      typeId: Number(dbProduct.typeId),
      categoryId: dbProduct.categoryId ? Number(dbProduct.categoryId) : null,
      createdAt: dbProduct.createdAt.toISOString(),
      updatedAt: dbProduct.updatedAt.toISOString(),
      published: dbProduct.published,
      category,
      productType,
      colors,
      sizes,
      colorImages,
      stockRows,
      variants,
    };

    return NextResponse.json({ product });
  } catch (err) {
    console.error("[GET /api/admin/products/[id]] error:", err);
    return NextResponse.json(
      { error: "No se pudo cargar el producto" },
      { status: 500 }
    );
  }
}

//
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = Number(params.id);

    await prisma.productColorImage.deleteMany({
      where: { productId },
    });

    await prisma.productVariant.deleteMany({
      where: { productId },
    });

    await prisma.stockColorSize.deleteMany({
      where: { productId },
    });

    await prisma.product.delete({
      where: { id: BigInt(productId) },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /products/[id] ERROR:", err);
    return NextResponse.json(
      { error: "No se pudo eliminar el producto" },
      { status: 500 }
    );
  }
}

