// app/api/products/[id]/route.ts
import { NextResponse } from "next/server";
import type { Product } from "@/lib/admin/types";
import {
  getProductFromMemory,
  removeProductFromMemory,
} from "@/lib/server/productsMemory";

type Params = {
  params: {
    id: string;
  };
};

// GET /api/products/:id
export async function GET(_req: Request, { params }: Params) {
  const product = getProductFromMemory(params.id);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json(product satisfies Product);
}

// DELETE /api/products/:id
export async function DELETE(_req: Request, { params }: Params) {
  const ok = removeProductFromMemory(params.id);
  if (!ok) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
