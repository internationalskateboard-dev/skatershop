// /components/product/ProductCard/ProductColors.tsx
import type { Product } from "@/lib/types";
import { cssColorFromName } from "@/lib/utils/product/colors";
import { soldMap } from "@/lib/utils/product/stock/soldMap";
import { getRealStock } from "@/lib/utils/product/stock/getRealStock";

type Props = {
  product: Product;
  selectedSize: string | null;
  selectedColor: string | null;
  onSelect: (color: string) => void;
};

export function ProductColors({ product, selectedColor, onSelect }: Props) {
  if (!product.colors) return null;

  // ------------------------------------------------------------
  // 1️⃣ Calcular stock real por color (sumando todas sus tallas)
  // ------------------------------------------------------------
  const stockByColor: Record<string, number> = {};

  product.variantStock?.forEach((v) => {
    const color = v.colorName ?? "UNKNOWN";

    // clave única para ventas reales
    const key = `${product.id}_${v.colorName}_${v.size}`;
    const soldUnits = soldMap[key] ?? 0;

    const realStock = getRealStock(v.stock ?? 0, soldUnits);

    if (realStock <= 0) return;

    stockByColor[color] = (stockByColor[color] ?? 0) + realStock;
  });

  // ------------------------------------------------------------
  // 2️⃣ Lista de colores que tienen stock real
  // ------------------------------------------------------------
  const colorsEnable = Object.entries(stockByColor)
    .filter(([_, stock]) => stock > 0)
    .map(([color]) => color);

  return (
    <div className="mb-4">
      <p className="text-xs uppercase tracking-wide text-neutral-400 mb-2">
        Colores
      </p>

      <div className="flex items-center gap-2">
        {product.colors.map((c) => {
          const enabled = colorsEnable.includes(c.name);
          const active = selectedColor === c.name;

          return (
            <button
              key={c.name}
              disabled={!enabled}
              onClick={() => enabled && onSelect(c.name)}
              title={enabled ? c.name : `${c.name} · sin stock`}
              className={`
                w-5 h-5 rounded-full border transition-transform
                ${
                  active
                    ? "border-yellow-400 scale-110 shadow-[0_0_8px_rgba(250,204,21,0.5)]"
                    : "border-neutral-600"
                }
                ${
                  !enabled
                    ? "opacity-30 cursor-not-allowed"
                    : "hover:border-yellow-400"
                }
              `}
              style={{ backgroundColor: cssColorFromName(c.name) }}
            />
          );
        })}
      </div>
    </div>
  );
}
