// app/api/admin/products/route.ts
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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // Params
    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || "12");

    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId");
    const typeId = searchParams.get("typeId");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const published = searchParams.get("published");
    const sort = searchParams.get("sort") || "newest";

    const skip = (page - 1) * limit;

    // WHERE dinámico
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    if (categoryId) where.categoryId = BigInt(categoryId);
    if (typeId) where.typeId = BigInt(typeId);

    if (minPrice)
      where.price = { ...(where.price || {}), gte: Number(minPrice) };
    if (maxPrice)
      where.price = { ...(where.price || {}), lte: Number(maxPrice) };

    if (published === "yes") where.published = true;
    if (published === "no") where.published = false;

    // ORDER BY
    let orderBy: any = { id: "desc" };
    if (sort === "price_asc") orderBy = { price: "asc" };
    if (sort === "price_desc") orderBy = { price: "desc" };
    if (sort === "oldest") orderBy = { createdAt: "asc" };
    if (sort === "newest") orderBy = { createdAt: "desc" };

    // Consulta final
    const dbProducts = await prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy,
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

    const total = await prisma.product.count({ where });

    // Tallas
    const allSizes = await prisma.size.findMany({
      orderBy: { id: "asc" },
    });

    // Transformación final
    const products: ProductWithRelations[] = dbProducts.map((p) => {
      const category: Category | null = p.category
        ? { id: Number(p.category.id), name: p.category.name }
        : null;

      const productType: ProductType | null = p.type
        ? { id: Number(p.type.id), name: p.type.name }
        : null;

      const colorMap = new Map<number, Color>();
      for (const img of p.images) {
        const cid = Number(img.colorId);
        if (!colorMap.has(cid)) {
          colorMap.set(cid, { id: cid, name: img.color.name });
        }
      }

      const colors = Array.from(colorMap.values());

      const sizes: Size[] = allSizes
        .filter((s) => Number(s.typeId) === Number(p.typeId))
        .map((s) => ({
          id: Number(s.id),
          label: s.label,
          productTypeId: Number(s.typeId),
        }));

      const colorImages: ProductColorImage[] = p.images.map((img) => ({
        id: Number(img.id),
        productId: Number(img.productId),
        colorId: Number(img.colorId),
        imageUrl: img.imageUrl,
      }));

      const stockRows: StockColorSizeRow[] = p.stockItems.map((row) => ({
        id: Number(row.id),
        productId: Number(row.productId),
        colorId: Number(row.colorId),
        sizeId: Number(row.sizeId),
        stock: row.stock,
      }));

      const variants: ProductVariantRow[] = p.variants.map((v) => ({
        id: Number(v.id),
        productId: Number(v.productId),
        colorId: Number(v.colorId),
        sizeId: Number(v.sizeId),
        stockColorSizeId: Number(v.stockColorSizeId),
      }));

      return {
        id: Number(p.id),
        slug: p.slug,
        name: p.name,
        price: Number(p.price),
        desc: p.desc,
        details: p.details,
        typeId: Number(p.typeId),
        categoryId: p.categoryId ? Number(p.categoryId) : null,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        published: p.published,

        category,
        productType,
        colors,
        sizes,
        colorImages,
        stockRows,
        variants,
      };
    });

    return NextResponse.json({
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      products,
    });
  } catch (err) {
    console.error("[GET /api/admin/products] error:", err);
    return NextResponse.json(
      { error: "No se pudieron cargar los productos." },
      { status: 500 }
    );
  }
}
