// app/api/sales/route.ts
import { NextResponse } from "next/server";
import type { SaleRecord, SalesApiResponse } from "@/lib/types";
import { salesBase } from "@/lib/salesBase";
import {
  addSaleToMemory,
  listSalesFromMemory,
} from "@/lib/server/salesMemory";
import { prisma } from "@/lib/server/prisma";
import {
  mapDbSaleToSaleRecord,
  mapSaleRecordToDbData,
} from "@/lib/server/mappers";

// GET /api/sales
// Opcional: ?source=db | local
export async function GET(req: Request) {
  const url = new URL(req.url);
  const forcedSource = url.searchParams.get("source"); // "db" | "local" | null

  // 1) Forzado a DB
  if (forcedSource === "db") {
    const dbSales = await prisma.sale.findMany({
      orderBy: { createdAt: "desc" },
    });
    const sales: SaleRecord[] = dbSales.map(mapDbSaleToSaleRecord);
    return NextResponse.json({ sales } satisfies SalesApiResponse);
  }

  // 2) Forzado a local
  if (forcedSource === "local") {
    const localSales = [...listSalesFromMemory(), ...salesBase];
    return NextResponse.json({ sales: localSales } satisfies SalesApiResponse);
  }

  // 3) Auto: DB primero, fallback a local
  try {
    const dbSales = await prisma.sale.findMany({
      orderBy: { createdAt: "desc" },
    });

    if (dbSales.length > 0) {
      const sales: SaleRecord[] = dbSales.map(mapDbSaleToSaleRecord);
      return NextResponse.json({ sales } satisfies SalesApiResponse);
    }
  } catch (err) {
    console.error("[GET /api/sales] Error leyendo DB", err);
  }

  const localSales = [...listSalesFromMemory(), ...salesBase];
  return NextResponse.json({ sales: localSales } satisfies SalesApiResponse);
}







// POST /api/sales
// Registra una nueva venta en DB + memoria
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Omit<SaleRecord, "id" | "createdAt">;

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: "La venta debe contener al menos un ítem" },
        { status: 400 }
      );
    }

    // Guardar en DB
    const data = mapSaleRecordToDbData(body);

    const created = await prisma.sale.create({
      // 👇 le decimos a TS que confíe en el shape de data
      data: data as any,
    });

    const saleRecord = mapDbSaleToSaleRecord(created);

    // Opcional: seguir usando memoria por compatibilidad
    addSaleToMemory({
      items: saleRecord.items,
      total: saleRecord.total,
      customer: saleRecord.customer,
    });

    return NextResponse.json(saleRecord, { status: 201 });
  } catch (err) {
    console.error("[POST /api/sales] Error", err);
    return NextResponse.json(
      { error: "Error interno registrando venta" },
      { status: 500 }
    );
  }
}