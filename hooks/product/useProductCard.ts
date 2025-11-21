import { useState, useEffect } from "react";
import type { Product } from "@/lib/types";
import useCartStore from "@/store/cartStore";
import { useToast } from "@/hooks/ui/useToast";
import { getExistingItemQty } from "@/lib/utils/cart/cart";

export function useProductCard(
  product?: Product,
  stock: number = 0, // FUTURO: stock aquí YA vendrá descontado (variantStock - soldMap)
  selectedSize: string | null = null,
  selectedColor: string | null = null,
  currentImage: string = ""
) {
  // Store
  const { cart, addToCart } = useCartStore((s) => ({
    cart: s.cart,
    addToCart: s.addToCart,
  }));

  // Toast
  const { toast, showToast } = useToast();

  // Estados locales
  const [quantity, setQuantity] = useState(1);
  const [alreadyInCartQty, setAlreadyInCartQty] = useState(0);

  // 🔒 SOLO calcular si product existe
  useEffect(() => {
    if (!product) return;

    const qty = getExistingItemQty(product, cart, selectedSize, selectedColor);
    setAlreadyInCartQty(qty || 0);
    setQuantity(1);
  }, [product, cart, selectedSize, selectedColor]);

  // Cambiar cantidad
  const handleQuantityChange = (delta: number) => {
    setQuantity((q) => {
      const next = q + delta;

      const max = Math.max(1, stock - alreadyInCartQty);
      return Math.min(max, Math.max(1, next));
    });
  };

  // Añadir al carrito
  const handleAdd = () => {
    if (!product) return; // ⛔ seguridad

    if (stock < alreadyInCartQty + quantity) {
      setQuantity(1);
      showToast("error", "Ya has añadido todo el stock disponible.");
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      qty: quantity,
      image: currentImage,
      size: selectedSize ?? undefined,
      colorName: selectedColor ?? undefined,
    });
  };

  return {
    quantity,
    handleQuantityChange,
    handleAdd,
    alreadyInCartQty,
    toast,
  };
}
