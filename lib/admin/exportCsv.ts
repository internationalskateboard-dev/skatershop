// lib/admin/exportCsv.ts
import type { SaleRecord, SaleItem } from "@/lib/admin/types";

export function downloadSalesCsv(sales: SaleRecord[], filename = "ventas.csv") {
  const headers = ["id", "createdAt", "total", "items", "customerName", "customerEmail"];

  const rows = sales.map((s) => {
    const items = (s.items || ([] as SaleItem[]))
      .map((it) => `${it.productId || ""} x${it.qty}${it.size ? ` (${it.size})` : ""}`)
      .join(" | ");

    return [
      s.id,
      s.createdAt,
      s.total ?? "",
      items,
      s.customer?.fullName ?? "",
      s.customer?.email ?? "",
    ];
  });

  const csv =
    headers.join(",") +
    "\n" +
    rows
      .map((r) =>
        r
          .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
