// lib/admin/exportProductsCsv.ts
import type { Product } from "@/lib/admin/types";

export function downloadProductsCsv(products: Product[], filename = "inventario.csv") {
  const headers = ["id", "name", "price", "stock", "sizes", "colors", "hasImage"];

  const rows = products.map((p) => {
    const sizes = Array.isArray(p.sizes) ? p.sizes.join("|") : "";
    const colors = Array.isArray(p.colors) ? p.colors.map((c: any) => c.name).join("|") : "";
    const hasImage = p.image ? "yes" : "no";
    return [
      p.id,
      p.name,
      p.price ?? 0,
      typeof p.stock === "number" ? p.stock : "",
      sizes,
      colors,
      hasImage,
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
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
