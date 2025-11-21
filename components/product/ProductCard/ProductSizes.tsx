// /components/product/ProductCard/ProductSizes.tsx
import type { Product } from "@/lib/types";
import { soldMap } from "@/lib/utils/product/stock/soldMap";
import { getRealStock } from "@/lib/utils/product/stock/getRealStock";

type Props = {
  product: Product;
  selectedSize: string | null;
  selectedColor: string | null;
  onSelect: (size: string) => void;
};

export function ProductSizes({
  product,
  selectedSize,
  selectedColor,
  onSelect,
}: Props) {
  if (!product.sizes || !selectedColor) return null;

  // --------------------------------------------------------------------
  // 1️⃣ Calcular tallas disponibles PARA ESTE COLOR usando stock real
  // --------------------------------------------------------------------
  const sizesForColor: string[] =
    product.variantStock
      ?.map((v) => {
        if (v.colorName !== selectedColor) return null;

        // 🔑 clave única de ventas
        const key = `${product.id}_${v.colorName}_${v.size}`;
        const sold = soldMap[key] ?? 0;

        // stock real = stock base - vendidos
        const realStock = getRealStock(v.stock ?? 0, sold);

        if (realStock <= 0) return null; // talla sin stock real
        return v.size as string;
      })
      .filter((s): s is string => typeof s === "string") ?? [];

  return (
    <div className="mb-2">
      <div className="text-xs uppercase text-neutral-500 tracking-wide flex gap-2">
        <span>TALLAS:</span>

        <div className="flex flex-wrap gap-2">
          {product.sizes.map((size) => {
            const enabled = sizesForColor.includes(size);
            const active = selectedSize === size;

            return (
              <button
                key={size}
                disabled={!enabled}
                onClick={() => enabled && onSelect(size)}
                className={`
                  relative px-3 py-1.5 rounded-lg font-semibold border transition-all duration-200

                  ${
                    active
                      ? "bg-yellow-400 text-black border-yellow-400 shadow-md"
                      : enabled
                      ? "border-neutral-700 text-neutral-300 hover:border-yellow-400 hover:text-yellow-400 hover:bg-neutral-800/40"
                      : "border-neutral-800 text-neutral-600 opacity-40 cursor-not-allowed line-through"
                  }
                `}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
