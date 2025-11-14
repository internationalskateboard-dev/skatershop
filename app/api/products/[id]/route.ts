// app/api/products/[id]/route.ts
import { NextResponse } from "next/server";
import type { Product } from "@/lib/types";

import { prisma } from "@/lib/server/prisma";
import {
  getProductFromMemory,
  removeProductFromMemory,
} from "@/lib/server/productsMemory";
import { mapDbProductToProduct } from "@/lib/server/mappers";

// GET /api/products/:id
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // 1) Intentar primero en la BD (Prisma/Postgres)
  try {
    const dbProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (dbProduct) {
      const product: Product = mapDbProductToProduct(dbProduct);
      return NextResponse.json(product);
    }
  } catch (err) {
    console.error("[GET /api/products/:id] Error leyendo BD", err);
    // si algo va mal en la BD, hacemos fallback a memoria
  }

  // 2) Fallback: memoria (comportamiento antiguo)
  const product = getProductFromMemory(id);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product as Product);
}

// DELETE /api/products/:id
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let deletedFromDb = false;

  // 1) Intentar borrar en la BD
  try {
    await prisma.product.delete({
      where: { id },
    });
    deletedFromDb = true;
  } catch (err: any) {
    // P2025 = registro no encontrado en Prisma → lo ignoramos
    if (err.code !== "P2025") {
      console.error("[DELETE /api/products/:id] Error borrando en BD", err);
    }
  }

  // 2) Intentar borrar también de memoria (por compatibilidad)
  const deletedFromMemory = removeProductFromMemory(id);

  // Si no estaba ni en BD ni en memoria
  if (!deletedFromDb && !deletedFromMemory) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
