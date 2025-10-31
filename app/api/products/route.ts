import { NextResponse } from "next/server";
import type { Product } from "@/lib/types";
import useProductStore from "@/store/productStore"; // lo estás usando en cliente; aquí lo usamos igual de forma simple

// GET /api/products
// Devuelve la lista de productos creados en el admin.
// (Más adelante aquí puedes mezclar productsBase.ts + productos de DB)
export async function GET() {
  // ⚠️ En un Next real de prod no leeríamos Zustand así,
  // pero para tu fase "sin backend" esto es válido.
  const state = useProductStore.getState();
  const products: Product[] = state.products || [];

  return NextResponse.json(
    {
      ok: true,
      count: products.length,
      products,
    },
    { status: 200 }
  );
}

// POST /api/products
// Crea o actualiza un producto (very simple)
// ⚠️ Esto NO está autenticado todavía.
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Product;
    const { id, name, price } = body;

    if (!id || !name || typeof price !== "number") {
      return NextResponse.json(
        { ok: false, message: "id, name y price son obligatorios" },
        { status: 400 }
      );
    }

    const store = useProductStore.getState();
    store.addProduct(body);

    return NextResponse.json({ ok: true, product: body }, { status: 201 });
  } catch (err) {
    console.error("POST /api/products error:", err);
    return NextResponse.json(
      { ok: false, message: "Error al crear producto" },
      { status: 500 }
    );
  }
}
