// app/api/products/[id]/route.ts
import { NextResponse } from "next/server";
import type { Product } from "@/lib/types";
import {
  getProductFromMemory,
  removeProductFromMemory,
} from "@/lib/server/productsMemory";

// GET /api/products/:id
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Según el tipo que exige Next, params es un Promise
  const { id } = await params;

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

  const ok = removeProductFromMemory(id);
  if (!ok) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
