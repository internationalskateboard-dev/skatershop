// components/product/ProductCard/ProductSizes.tsx
import type { Product } from "@/lib/types";

type Props = {
  product: Product;
  selectedSize: string | null;
  onSelect: (size: string) => void;
  enabledSizes: string[];
};

export function ProductSizes({
  product,
  selectedSize,
  onSelect,
  enabledSizes,
}: Props) {
  // Protección contra casos sin tallas
  if (!product || !Array.isArray(product.sizes)) return null;

  const sizes = product.sizes;
  if (sizes.length === 0) return null;

  // Normalizamos tallas para evitar fallos por may/min
  const enabledNormalized = enabledSizes.map((s) => s.toUpperCase());

  return (
    <div className="mb-4">
      <p className="text-xs uppercase tracking-wide text-neutral-400 mb-2">
        Tallas
      </p>

      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const normalized = size.toUpperCase();
          const enabled = enabledNormalized.includes(normalized);
          const active = selectedSize?.toUpperCase() === normalized;

          return (
            <button
              key={size}
              disabled={!enabled}
              onClick={() => enabled && onSelect(size)}
              className={`
                px-3 py-1 text-xs rounded border transition
                ${
                  active
                    ? "border-yellow-400 text-yellow-400"
                    : "border-neutral-600 text-neutral-300"
                }
                ${
                  !enabled
                    ? "opacity-30 cursor-not-allowed"
                    : "hover:border-yellow-400 hover:text-yellow-400"
                }
              `}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
}
