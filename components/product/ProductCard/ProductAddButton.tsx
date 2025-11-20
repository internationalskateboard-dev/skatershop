import { CartIcon } from "@/components/icons/CartIcon";

export function ProductAddButton({ onAdd, qty }: any) {
  return (
    <button
      onClick={onAdd}
      className="flex items-center justify-center gap-2 rounded-full bg-yellow-400 text-black px-5 py-2.5 font-semibold text-sm shadow-lg hover:bg-yellow-300 active:scale-95"
    >
      <CartIcon className="w-5 h-5" />
      <span>Carrito ({qty})</span>
    </button>
  );
}
