// components/product/ProductCard/ProductColors.tsx
import type { Product } from "@/lib/types";
import { cssColorFromName } from "@/lib/utils/product/colors";

type Props = {
  product: Product;
  selectedColor: string | null;
  onSelect: (color: string) => void;
  enabledColors: string[];
};

export function ProductColors({
  product,
  selectedColor,
  onSelect,
  enabledColors,
}: Props) {
  if (!product || !Array.isArray(product.colors)) return null;

  const colors = product.colors;
  if (colors.length === 0) return null;

  // Normalizamos colores habilitados
  const enabledNormalized = enabledColors.map((c) => c.toUpperCase());

  return (
    <div className="mb-4">
      <p className="text-xs uppercase tracking-wide text-neutral-400 mb-2">
        Colores
      </p>

      <div className="flex items-center gap-2">
        {colors.map((c) => {
          const normalized = c.name.toUpperCase();

          const enabled = enabledNormalized.includes(normalized);
          const active =
            selectedColor &&
            selectedColor.toUpperCase() === normalized;

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
              style={{
                backgroundColor: cssColorFromName(c.name),
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
