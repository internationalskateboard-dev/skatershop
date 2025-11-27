// hooks/admin/useProductImages.ts
"use client";

import { useState } from "react";

export type ColorImageEntry = {
  colorId: number;
  colorName: string;
  imageData: string; // base64 data URL
};

type UseProductImagesOptions = {
  initialMainImage?: string | null;
  initialColorImages?: ColorImageEntry[];
};

export function useProductImages(options?: UseProductImagesOptions) {
  const [mainImage, setMainImage] = useState<string | null>(
    options?.initialMainImage ?? null
  );

  const [colorImages, setColorImages] = useState<ColorImageEntry[]>(
    options?.initialColorImages ?? []
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function upsertColorImage(entry: Omit<ColorImageEntry, "imageData"> & { imageData: string }) {
    setColorImages((prev) => {
      const idx = prev.findIndex((e) => e.colorId === entry.colorId);
      if (idx === -1) return [...prev, entry];
      const copy = [...prev];
      copy[idx] = entry;
      return copy;
    });
  }

  function removeColorImage(colorId: number) {
    setColorImages((prev) => prev.filter((e) => e.colorId !== colorId));
  }

  function clearAll() {
    setMainImage(null);
    setColorImages([]);
  }

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  async function handleMainImageFile(file: File) {
    const data = await fileToBase64(file);
    setMainImage(data);
  }

  async function handleColorImageFile(colorId: number, colorName: string, file: File) {
    const data = await fileToBase64(file);
    upsertColorImage({ colorId, colorName, imageData: data });
  }

  async function persistColorImagesToApi(productId: number) {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/product-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          images: colorImages.map((entry) => ({
            colorId: entry.colorId,
            imageData: entry.imageData,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error("No se pudo guardar imágenes en la BD");
      }
    } catch (err) {
      console.error("[useProductImages.persist] error:", err);
      setError("No se pudieron guardar las imágenes. Intenta de nuevo.");
      throw err;
    } finally {
      setSaving(false);
    }
  }

  return {
    mainImage,
    colorImages,
    saving,
    error,
    setMainImage,
    handleMainImageFile,
    handleColorImageFile,
    removeColorImage,
    clearAll,
    persistColorImagesToApi,
  };
}
