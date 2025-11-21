type Props = {
  onAdd: () => void;
  qty: number;
};

export function ProductAddButton({ onAdd, qty }: Props) {
  return (
    <button
      onClick={onAdd}
      className="
        w-full flex items-center justify-center gap-2
        rounded-full px-5 py-2.5 text-sm font-semibold
        bg-yellow-400 text-black
        shadow-[0_0_20px_rgba(250,204,21,0.4)]
        hover:bg-yellow-300 active:scale-95 transition
      "
    >
      <span>Cart</span>
      {qty > 0 && (
        <span className="opacity-80">({qty})</span>
      )}
    </button>
  );
}
