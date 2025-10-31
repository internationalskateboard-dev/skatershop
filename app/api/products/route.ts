// app/api/products/route.ts
import { NextResponse } from "next/server";
import useProductStore from "@/store/productStore";
import type { Product } from "@/lib/types";

/**
 * GET /api/products
 * ------------------------------------------------------------
 * Devuelve TODOS los productos que hay actualmente en el store
 * (los creados desde admin). Más adelante aquí podemos mezclar
 * los `productsBase` si quieres que también salgan en la API.
 */
export async function GET() {
  // leemos directamente el estado actual del store
  const state = useProductStore.getState();
  const products = state.products ?? [];

  return NextResponse.json(
    {
      ok: true,
      count: products.length,
      products,
    },
    { status: 200 }
  );
}

/**
 * POST /api/products
 * ------------------------------------------------------------
 * Crea o ACTUALIZA un producto.
 * Acepta los campos avanzados del admin:
 * - colors?: { name: string; image?: string }[]
 * - sizeGuide?: string
 *
 * ⚠️ No hay auth todavía → pendiente fase backend.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Product;

    // validaciones mínimas
    if (!body.id || !body.name || typeof body.price !== "number") {
      return NextResponse.json(
        {
          ok: false,
          message: "id, name y price son obligatorios",
        },
        { status: 400 }
      );
    }

    // normalizar campos opcionales para no perderlos
    const payload: Product = {
      id: body.id,
      name: body.name,
      price: body.price,
      desc: body.desc ?? "",
      details: body.details ?? "",
      image: body.image ?? "",
      sizes: Array.isArray(body.sizes) ? body.sizes : [],
      stock: typeof body.stock === "number" ? body.stock : 0,
      locked: body.locked ?? false,
      colors: Array.isArray(body.colors) ? body.colors : [],
      sizeGuide: body.sizeGuide ?? "",
    };

    const store = useProductStore.getState();
    const current = store.findById(payload.id);

    if (current) {
      // si existe → actualizar sin perder los campos nuevos
      store.updateProduct(payload.id, payload);
    } else {
      // si no existe → crear
      store.addProduct(payload);
    }

    return NextResponse.json(
      {
        ok: true,
        product: payload,
      },
      { status: current ? 200 : 201 }
    );
  } catch (err) {
    console.error("POST /api/products error:", err);
    return NextResponse.json(
      {
        ok: false,
        message: "Error al crear/actualizar el producto",
      },
      { status: 500 }
    );
  }
}
