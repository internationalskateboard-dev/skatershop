// components/product/ProductCard/ProductQuantity.tsx
type Props = {
  quantity: number;
  onChange: (delta: number) => void;
  max: number; // stock real disponible (variants.stock)
};

export function ProductQuantity({ quantity, onChange, max }: Props) {
  const isMin = quantity <= 1;
  const isMax = quantity >= max;
  const isDisabled = max <= 0;

  return (
    <div
      className={`
        inline-flex items-center justify-center rounded-full px-4 py-2
        border text-xs font-semibold uppercase
        ${isDisabled ? "opacity-40 cursor-not-allowed" : "text-neutral-200 border-neutral-700 bg-neutral-900/70"}
      `}
    >
      <button
        onClick={() => !isDisabled && onChange(-1)}
        disabled={isMin || isDisabled}
        className={`
          w-7 h-7 flex items-center justify-center rounded-full border transition
          ${isMin || isDisabled
            ? "border-neutral-800 text-neutral-600 cursor-not-allowed"
            : "border-neutral-700 hover:border-yellow-400 hover:text-yellow-400"}
        `}
      >
        −
      </button>

      <span className="mx-3 min-w-[1.5rem] text-center">{quantity}</span>

      <button
        onClick={() => !isDisabled && onChange(1)}
        disabled={isMax || isDisabled}
        className={`
          w-7 h-7 flex items-center justify-center rounded-full border transition
          ${isMax || isDisabled
            ? "border-neutral-800 text-neutral-600 cursor-not-allowed"
            : "border-neutral-700 hover:border-yellow-400 hover:text-yellow-400"}
        `}
      >
        +
      </button>
    </div>
  );
}
