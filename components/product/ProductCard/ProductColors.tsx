import { cssColorFromName } from "@/lib/utils/product/colors";
import type { Product, ProductColor } from "@/lib/types";

type Props = {
  product: Product;
  selectedColor: string | null;
  selectedSize: string | null;
  onSelect: (color: string) => void;
};

export function ProductColors({ product, selectedColor, onSelect }: Props) {
  if (!product.colors) return null;

  return (
    <div className="mb-1 flex items-center gap-2">
      <span className="text-xs text-neutral-300 uppercase tracking-wide">
        Colores:
      </span>

      <div className="flex items-center gap-1.5">
        {product.colors.map((c: ProductColor) => {
          const active = selectedColor === c.name;

          return (
            <button
              key={c.name}
              onClick={() => onSelect(c.name)}
              className={`w-4 h-4 rounded-full border ring-1 transition ${
                active
                  ? "border-yellow-400 ring-yellow-400 scale-110"
                  : "border-neutral-700 ring-black/40"
              }`}
              style={{ backgroundColor: cssColorFromName(c.name) }}
            />
          );
        })}
      </div>
    </div>
  );
}
