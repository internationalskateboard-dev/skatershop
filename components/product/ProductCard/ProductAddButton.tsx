// 
type Props = {
  onAdd: () => void;
  qtyInCart: number;             // unidades ya en carrito
  stock: number;                 // stock real disponible
  disabled?: boolean;            // opcional
};

export function ProductAddButton({ onAdd, qtyInCart, stock, disabled }: Props) {
  const isOut = stock <= 0;

  return (
    <button
      onClick={onAdd}
      disabled={isOut || disabled}
      className={`
        w-full flex items-center justify-center gap-2
        rounded-full px-5 py-2.5 text-sm font-semibold
        transition active:scale-95
        ${isOut || disabled
          ? "bg-neutral-700 text-neutral-400 cursor-not-allowed"
          : "bg-yellow-400 text-black hover:bg-yellow-300 shadow-[0_0_20px_rgba(250,204,21,0.4)]"
        }
      `}
    >
      {isOut ? (
        <span>Sin stock</span>
      ) : (
        <>
          <span>Añadir al carrito</span>
          {qtyInCart > 0 && (
            <span className="opacity-70">(ya tienes {qtyInCart})</span>
          )}
        </>
      )}
    </button>
  );
}
