// app/api/admin/source/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    productsUrl: process.env.SKATERSHOP_PRODUCTS_URL || null,
    salesUrl: process.env.SKATERSHOP_SALES_URL || null,
    salesPostUrl: process.env.SKATERSHOP_SALES_URL_POST || null,
  });
}
