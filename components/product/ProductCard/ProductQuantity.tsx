export function ProductQuantity({ quantity, onChange }: any) {
  return (
    <div className="inline-flex items-center justify-center rounded-full border border-neutral-700 bg-neutral-900/70 px-4 py-2 text-xs font-semibold uppercase text-neutral-200">
      <button onClick={() => onChange(-1)} className="w-7 h-7 border rounded-full">
        −
      </button>
      <span className="mx-3 min-w-[1.5rem] text-center">{quantity}</span>
      <button onClick={() => onChange(1)} className="w-7 h-7 border rounded-full">
        +
      </button>
    </div>
  );
}
