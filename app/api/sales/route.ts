// app/api/sales/route.ts
import { NextResponse } from "next/server";
import type { SaleRecord, SalesApiResponse } from "@/lib/types";
import {
  addSaleToMemory,
  listSalesFromMemory,
} from "@/lib/server/salesMemory";
import { fetchJsonOrNull } from "@/lib/server/dataSource";
import { salesBase } from "@/lib/salesBase"; // ✅ <-- este es el bueno

export async function GET(req: Request) {
  const url = new URL(req.url);
  const forcedSource = url.searchParams.get("source"); // "api" | "local" | null

  const externalUrl = process.env.SKATERSHOP_SALES_URL;

  // --- 1) FORZADO A API ---
  if (forcedSource === "api") {
    const external = await fetchJsonOrNull(externalUrl);

    if (external && Array.isArray((external as any).sales)) {
      return NextResponse.json({
        sales: (external as any).sales as SaleRecord[],
      } satisfies SalesApiResponse);
    }
    if (external && Array.isArray(external)) {
      return NextResponse.json({
        sales: external as SaleRecord[],
      } satisfies SalesApiResponse);
    }

    // si no hay API pero pidieron API → devolvemos local
    const localSales = [...listSalesFromMemory(), ...salesBase];
    return NextResponse.json({ sales: localSales } satisfies SalesApiResponse);
  }

  // --- 2) FORZADO A LOCAL ---
  if (forcedSource === "local") {
    const localSales = [...listSalesFromMemory(), ...salesBase];
    return NextResponse.json({ sales: localSales } satisfies SalesApiResponse);
  }

  // --- 3) AUTO (el de siempre) ---
  const external = await fetchJsonOrNull(externalUrl);

  if (external && Array.isArray((external as any).sales)) {
    return NextResponse.json({
      sales: (external as any).sales as SaleRecord[],
    } satisfies SalesApiResponse);
  }

  if (external && Array.isArray(external)) {
    return NextResponse.json({
      sales: external as SaleRecord[],
    } satisfies SalesApiResponse);
  }

  // fallback
  const localSales = [...listSalesFromMemory(), ...salesBase];
  return NextResponse.json({ sales: localSales } satisfies SalesApiResponse);
}
