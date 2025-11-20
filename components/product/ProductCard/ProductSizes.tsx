import type { Product } from "@/lib/types";

type Props = {
  product: Product;
  selectedSize: string | null;
  selectedColor: string | null;
  onSelect: (size: string) => void;
};

export function ProductSizes({ product, selectedSize, selectedColor, onSelect }: Props) {
  if (!product.sizes || !selectedColor) return null;

  // Tallas disponibles para el color activo
  const sizesForColor =
    product.variantStock
      ?.filter((v) => v.colorName === selectedColor && v.size)
      .map((v) => v.size as string) ?? [];

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
                  relative px-3 py-1 rounded-lg font-semibold border transition-all duration-200
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
