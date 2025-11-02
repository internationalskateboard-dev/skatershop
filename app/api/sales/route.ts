// app/api/sales/route.ts
import { NextResponse } from "next/server";
import type { SaleRecord, SalesApiResponse } from "@/lib/types";
import {
  addSaleToMemory,
  listSalesFromMemory,
} from "@/lib/server/salesMemory";
import { fetchJsonOrNull } from "@/lib/server/dataSource";

// GET /api/sales
export async function GET() {
  const externalUrl = process.env.SKATERSHOP_SALES_URL;
  const external = await fetchJsonOrNull(externalUrl);

  // { sales: [...] }
  if (external && Array.isArray((external as any).sales)) {
    const payload: SalesApiResponse = {
      sales: (external as any).sales as SaleRecord[],
    };
    return NextResponse.json(payload);
  }

  // [ ... ]
  if (external && Array.isArray(external)) {
    const payload: SalesApiResponse = {
      sales: external as SaleRecord[],
    };
    return NextResponse.json(payload);
  }

  // fallback a memoria
  const sales = listSalesFromMemory();
  const payload: SalesApiResponse = { sales };
  return NextResponse.json(payload);
}

// POST /api/sales
export async function POST(req: Request) {
  const body = (await req.json()) as Partial<SaleRecord>;

  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Debe enviar items" }, { status: 400 });
  }

  // armamos venta local
  const base: Omit<SaleRecord, "id" | "createdAt"> = {
    items: body.items,
    total: body.total ?? 0,
    customer: body.customer ?? {},
  };

  // 1) guardamos SIEMPRE en memoria local
  const savedLocal = addSaleToMemory(base);

  // 2) si hay backend para POST, reenviamos (sin romper al admin si falla)
  const externalPostUrl =
    process.env.SKATERSHOP_SALES_URL_POST || process.env.SKATERSHOP_SALES_URL;

  if (externalPostUrl) {
    // no await → no bloqueamos la respuesta al admin
    fetch(externalPostUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // enviamos la venta completa ya con id y createdAt
      body: JSON.stringify(savedLocal),
    }).catch((err) => {
      console.warn(
        "[/api/sales] no se pudo reenviar venta al backend remoto:",
        err
      );
    });
  }

  return NextResponse.json(savedLocal, { status: 201 });
}
