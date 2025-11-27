// app/api/admin/products/base/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Body:
 * {
 *   name: string;
 *   slug: string;
 *   price: number;
 *   desc?: string;
 *   details?: string;
 *   productTypeId: number;
 *   categoryId?: number | null;
 * }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = String(body.name ?? "").trim();
    const slug = String(body.slug ?? "").trim();
    const price = Number(body.price);
    const productTypeId = Number(body.productTypeId);
    const categoryId =
      body.categoryId === null || body.categoryId === undefined
        ? null
        : Number(body.categoryId);

    if (!name || !slug || Number.isNaN(price) || !productTypeId) {
      return NextResponse.json(
        { error: "name, slug, price y productTypeId son obligatorios" },
        { status: 400 }
      );
    }

    const existingSlug = await prisma.product.findUnique({
      where: { slug },
    });
    if (existingSlug) {
      return NextResponse.json(
        { error: "Ya existe un producto con ese slug" },
        { status: 409 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        price: String(price),
        desc: body.desc ?? null,
        details: body.details ?? null,
        typeId: BigInt(productTypeId),
        categoryId: categoryId !== null ? BigInt(categoryId) : null,
      },
    });

    return NextResponse.json({
      product: {
        id: Number(product.id),
        slug: product.slug,
        name: product.name,
      },
    });
  } catch (err) {
    console.error("[POST /api/admin/products/base] error:", err);
    return NextResponse.json(
      { error: "Error interno al crear el producto" },
      { status: 500 }
    );
  }
}
