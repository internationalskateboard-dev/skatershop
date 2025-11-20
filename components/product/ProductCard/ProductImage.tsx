import Image from "next/image";

export function ProductImage({ image, name }: { image: string; name: string }) {
  return (
    <div className="relative w-full h-full aspect-[4/5] bg-neutral-950">
      <Image
        src={image}
        alt={name}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
    </div>
  );
}
