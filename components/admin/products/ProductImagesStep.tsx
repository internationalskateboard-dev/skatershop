"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useProductImages } from "@/hooks/admin/useProductImages";
import { colorToCss } from "@/lib/utils/colorToCss";

type ColorOption = {
  id: number;
  name: string;
};

type ProductImagesStepProps = {
  productId: number;
  productName: string;
  colors: ColorOption[];
  onCompleted?: () => void;
};

export function ProductImagesStep({
  productId,
  productName,
  colors,
  onCompleted,
}: ProductImagesStepProps) {
  const {
    mainImage,
    colorImages,
    saving,
    error,
    handleMainImageFile,
    handleColorImageFile,
    removeColorImage,
    persistColorImagesToApi,
  } = useProductImages();

  const [dragOverMain, setDragOverMain] = useState(false);

  // ⭐ MULTI-SELECCIÓN
  const [selectedColorIds, setSelectedColorIds] = useState<number[]>([]);

  const mainInputRef = useRef<HTMLInputElement | null>(null);

  const toggleColor = (id: number) => {
    setSelectedColorIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  async function onDropMain(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOverMain(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await handleMainImageFile(file);
  }

  async function onChangeMain(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) await handleMainImageFile(file);
  }

  async function handleSaveImages() {
    await persistColorImagesToApi(productId);
    onCompleted?.();
  }

  return (
    <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-5 mt-4">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            Paso 2 de 4
          </p>
          <h3 className="text-lg font-semibold text-white">
  Imagenes del producto — <span className="text-yellow-400">{productName}</span>
</h3>
        </div>
      </header>

      {/* Imagen principal */}
      <div className="grid gap-4 md:grid-cols-[2fr,3fr] items-start">
        <div>
          <span className="text-sm text-neutral-300">Imagen principal</span>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverMain(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragOverMain(false);
            }}
            onDrop={onDropMain}
            onClick={() => mainInputRef.current?.click()}
            className={[
              "mt-2 w-full rounded-lg border-2 border-dashed px-4 py-6 text-center cursor-pointer transition text-neutral-400 bg-neutral-900",
              dragOverMain
                ? "border-yellow-400 text-yellow-400"
                : "border-neutral-700 hover:border-yellow-400 hover:text-yellow-400",
            ].join(" ")}
          >
            {mainImage ? (
              <div className="flex flex-col items-center gap-3">
                <Image
                  src={mainImage}
                  width={64}
                    height={64}
                  alt="Imagen principal"
                  className="w-24 h-24 object-cover rounded-lg border border-neutral-800 bg-neutral-950"
                />
                <p className="text-[11px] text-neutral-400">
                  Imagen cargada — haz click para reemplazar.
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide">
                  Arrastra una imagen aquí o haz click
                </p>
                <p className="text-[11px] text-neutral-500 mt-2">
                  .jpg .png .webp — se guardará como Base64
                </p>
              </>
            )}
          </div>

          <input
            ref={mainInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onChangeMain}
          />
        </div>

        <div className="text-xs text-neutral-400 space-y-2">
          Las imágenes por color se guardan en{" "}
          <span className="font-mono">product_color_image</span>.
        </div>
      </div>

      {/* Selector MULTI-COLORES */}
      <div className="mt-4">
        <p className="text-xs text-neutral-400 mb-1">COLORES:</p>

        <div className="flex gap-3 flex-wrap">
          {colors.map((c) => {
            const active = selectedColorIds.includes(c.id);

            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleColor(c.id)}
                className={[
                  "w-7 h-7 rounded-full border-2 transition",
                  active
                    ? "border-yellow-400 scale-110"
                    : "border-neutral-600 opacity-60 hover:opacity-100",
                ].join(" ")}
                style={{ backgroundColor: colorToCss(c.name) }}
                title={c.name}
              />
            );
          })}
        </div>
      </div>

      {/* Tarjetas de carga por color (MULTIPLES) */}
      <div className="space-y-3 mt-4">
        {selectedColorIds.length === 0 && (
          <p className="text-[11px] text-neutral-500 italic">
            Selecciona uno o varios colores para subir sus imágenes.
          </p>
        )}

        {selectedColorIds.map((colorId) => {
          const color = colors.find((c) => c.id === colorId)!;
          const existing = colorImages.find((e) => e.colorId === color.id);

          return (
            <div
              key={color.id}
              className="border border-neutral-800 rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-white">{color.name}</p>
                <p className="text-[11px] text-neutral-500">Imagen para este color</p>
              </div>

              <div className="flex items-center gap-2">
                {existing ? (
                  <Image
                    src={existing.imageData}
                    alt={color.name}
                    width={64}
                    height={64}
                    className="w-12 h-12 rounded-md border border-neutral-700 object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-md border border-dashed border-neutral-700 flex items-center justify-center text-[10px] text-neutral-500">
                    -
                  </div>
                )}

                <label className="text-xs bg-neutral-800 px-3 py-1 rounded-md border border-neutral-700 cursor-pointer hover:border-yellow-400 hover:text-yellow-400 transition">
                  {existing ? "Cambiar" : "Subir"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        await handleColorImageFile(color.id, color.name, file);
                      }
                    }}
                  />
                </label>

                {existing && (
                  <button
                    type="button"
                    onClick={() => removeColorImage(color.id)}
                    className="text-[10px] text-red-400 hover:text-red-300"
                  >
                    Quitar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Guardar */}
      <div className="flex justify-between items-center pt-4 border-t border-neutral-800">
        <div className="text-[11px] text-neutral-500">
          {error ? (
            <span className="text-red-400">{error}</span>
          ) : (
            <span>Las imágenes se guardarán en la BD.</span>
          )}
        </div>

        <button
          type="button"
          onClick={handleSaveImages}
          disabled={saving}
          className="bg-yellow-400 text-black font-bold text-xs py-2.5 px-5 rounded-lg hover:bg-yellow-300 active:scale-95 transition uppercase tracking-wide disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Guardar imágenes"}
        </button>
      </div>
    </section>
  );
}
