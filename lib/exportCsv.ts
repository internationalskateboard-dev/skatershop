// lib/exportCsv.ts
export function downloadCsvFromSales(sales: any[], filename = "ventas.csv") {
  const headers = ["id", "createdAt", "total", "items"];
  const rows = sales.map((s) => {
    const items = (s.items || [])
      .map((it: any) => `${it.productId || ""} x${it.qty}${it.size ? ` (${it.size})` : ""}`)
      .join(" | ");
    return [s.id, s.createdAt, s.total, items];
  });

  const csv =
    headers.join(",") +
    "\n" +
    rows.map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.click();
  URL.revokeObjectURL(url);
}
