// hooks/product/useProductCard.ts
import { useState, useEffect } from "react";
import type { Product, ProductCardVariants } from "@/lib/types";
import useCartStore from "@/store/cartStore";
import { useToast } from "@/hooks/ui/useToast";
import { getExistingItemQty } from "@/lib/cart/cart";


export function useProductCard(
  product?: Product,
  variants?: ProductCardVariants
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

  const effectiveStock = variants?.stock ?? 0;
  const effectiveSize = variants?.selectedSize ?? null;
  const effectiveColor = variants?.selectedColor ?? null;
  const effectiveImage = variants?.currentImage ?? "";

  // 🔒 SOLO calcular si product existe
  useEffect(() => {
    if (!product) return;

    const qty = getExistingItemQty(
      product,
      cart,
      effectiveSize,
      effectiveColor
    );
    setAlreadyInCartQty(qty || 0);
    setQuantity(1);
  }, [product, cart, effectiveSize, effectiveColor]);

  // Cambiar cantidad
  const handleQuantityChange = (delta: number) => {
    setQuantity((q) => {
      const next = q + delta;

      const max = Math.max(1, effectiveStock - alreadyInCartQty);
      return Math.min(max, Math.max(1, next));
    });
  };

  // Añadir al carrito
  const handleAdd = () => {
    if (!product) return; // ⛔ seguridad

    if (effectiveStock < alreadyInCartQty + quantity) {
      setQuantity(1);
      showToast("error", "Ya has añadido todo el stock disponible.");
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      qty: quantity,
      image: effectiveImage,
      size: effectiveSize ?? undefined,
      colorName: effectiveColor ?? undefined,
      stock: effectiveStock,
    });

    showToast("success", "Producto añadido al carrito.");
  };

  return {
    quantity,
    handleQuantityChange,
    handleAdd,
    alreadyInCartQty,
    toast,
  };
}
