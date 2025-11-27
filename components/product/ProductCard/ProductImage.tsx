// components/product/ProductCard/ProductImage.tsx
import Image from "next/image";
import { PRODUCT_PLACEHOLDER_IMAGE } from "@/lib/constants";

type Props = {
  image?: string | null;
  name: string;
};

export function ProductImage({ image, name }: Props) {
  // Sanitizar la imagen siempre
  const safeImage =
    image && typeof image === "string" && image.trim().length > 3
      ? image
      : PRODUCT_PLACEHOLDER_IMAGE;

  return (
    <div className="relative w-full h-full aspect-[4/5] bg-neutral-950">
      <Image
        src={safeImage}
        alt={name}
        fill
        unoptimized={safeImage.startsWith("data:")} // ← necesario para base64
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* sombreado inferior */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
    </div>
  );
}
