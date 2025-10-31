// app/api/products/[id]/route.ts
import { NextResponse } from "next/server";
import {
  productsMemory,
  removeProductFromMemory,
} from "@/lib/server/productsMemory";
import { productsBase } from "@/lib/productsBase";

// GET opcional por si quieres consultar un producto desde el panel
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // primero buscamos en memoria
  const mem = productsMemory.find((p) => p.id === id);
  if (mem) {
    return NextResponse.json({ product: mem, from: "memory" });
  }

  // luego en base
  const base = productsBase.find((p) => p.id === id);
  if (base) {
    return NextResponse.json({ product: base, from: "base" });
  }

  return NextResponse.json(
    { error: "Producto no encontrado" },
    { status: 404 }
  );
}

// DELETE /api/products/:id
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // intentamos borrar en memoria
  const removed = removeProductFromMemory(id);

  if (!removed) {
    // si no estaba en memoria, igual devolvemos 200 para no romper admin,
    // porque puede ser un producto "base" que no queremos borrar ahí.
    return NextResponse.json(
      { ok: true, note: "No estaba en memoria, probablemente era base" },
      { status: 200 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
