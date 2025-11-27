// components/admin/products/wizard/steps/ProdutVariantStept.tsx

"use client";

import { useEffect, useState } from "react";
import { useProductColorImages } from "@/hooks/admin/useProductColorImages";
import { useSizes } from "@/hooks/admin/useSizes";
import type { WizardVariantDraft } from "@/hooks/admin/useProductWizardState";
import Image from "next/image";
import { colorToCss } from "@/lib/utils/colorToCss";

type ProductVariantStepProps = {
  productId: number;
  productTypeId: number | null;
  variants: WizardVariantDraft[];
  setVariants: (vs: WizardVariantDraft[]) => void;
  onCompleted?: () => void;
};

export function ProductVariantStep({
  productId,
  productTypeId,
  variants,
  setVariants,
  onCompleted,
}: ProductVariantStepProps) {
  const { colorImages, loading: loadingColorImages } =
    useProductColorImages(productId);

  const { sizes, loading: loadingSizes } = useSizes(productTypeId);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [msgColor, setMsgColor] =
    useState<"red" | "green" | "yellow">("yellow");

  /** Selección independiente por color */
  const [sizeSelections, setSizeSelections] = useState<
    Record<number, number[]>
  >({});

  /** Preconfigurar selección cuando lleguen los colores */
  useEffect(() => {
    if (!loadingColorImages && colorImages.length > 0) {
      const initial: Record<number, number[]> = {};
      for (const c of colorImages) initial[c.colorId] = [];
      setSizeSelections(initial);
    }
  }, [loadingColorImages, colorImages]);

  /** Toggle size */
  function toggleSize(colorId: number, sizeId: number) {
    setSizeSelections((prev) => {
      const current = prev[colorId] || [];
      return {
        ...prev,
        [colorId]: current.includes(sizeId)
          ? current.filter((s) => s !== sizeId)
          : [...current, sizeId],
      };
    });
  }

  /** Reiniciar */
  function resetAll() {
    const initial: Record<number, number[]> = {};
    for (const c of colorImages) initial[c.colorId] = [];
    setSizeSelections(initial);
    setVariants([]);
    setMessage("Selección reiniciada.");
    setMsgColor("yellow");
  }

  /** Generar matriz de variantes */
  function generateMatrix() {
    const next: WizardVariantDraft[] = [];

    for (const c of colorImages) {
      const selectedSizes = sizeSelections[c.colorId] || [];
      for (const sizeId of selectedSizes) {
        const existing = variants.find(
          (v) => v.colorId === c.colorId && v.sizeId === sizeId
        );

        next.push(
          existing ?? {
            colorId: c.colorId,
            sizeId,
            stock: 0,
          }
        );
      }
    }

    setVariants(next);

    if (!next.length) {
      setMessage("Selecciona al menos una talla en algún color.");
      setMsgColor("red");
    } else {
      setMessage("Variantes generadas. Ahora define el stock.");
      setMsgColor("yellow");
    }
  }

  /** Guardar variantes */
  async function handleSave() {
    if (!variants.length) return;

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/products/variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, variants }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error);

      setMsgColor("green");
      setMessage("Variantes guardadas correctamente.");
      onCompleted?.();
    } catch (err) {
      console.error(err);
      setMsgColor("red");
      setMessage("Error al guardar variantes.");
    } finally {
      setSaving(false);
    }
  }

  /** Fallback seguro para Next/Image */
  function safeImage(src?: string | null): string {
    if (!src || src.trim() === "") return "/placeholder-color.png";
    return src;
  }

  return (
    <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-6 mt-4 animate-fadeIn">
      {/* HEADER */}
      <header>
        <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
          Paso 3 de 4
        </p>
        <h3 className="text-lg font-semibold text-white">
          Variantes y stock por talla/color
        </h3>
        <p className="text-xs text-neutral-500 mt-1">
          Selecciona tallas por color, genera la matriz y define stock.
        </p>
      </header>

      {/* COLORS + SIZES */}
      <div className="space-y-6">
        {colorImages.map((c) => {
          const selected = sizeSelections[c.colorId] || [];

          return (
            <div
              key={c.colorId}
              className="border border-neutral-800 rounded-lg p-4 space-y-4 hover:border-yellow-500 transition-all shadow-sm"
            >
              <div className="flex items-center gap-3">
                {/* Imagen con fallback seguro */}
                <div className="w-12 h-12 rounded-md overflow-hidden border border-neutral-700 bg-neutral-900">
                  <Image
                    src={safeImage(c.imageUrl || "/placeholder.png")}
                    alt={c.colorName}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>

                <div>
                  <p className="text-sm text-white font-semibold">
                    {c.colorName}
                  </p>

                  <span
                    className="w-4 h-4 rounded-full border border-neutral-700 mt-1 inline-block"
                    style={{ backgroundColor: colorToCss(c.colorName) }}
                  />
                </div>
              </div>

              {/* Tallas */}
              <div className="flex flex-wrap gap-2 ml-1">
                {sizes.map((s) => {
                  const active = selected.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleSize(c.colorId, s.id)}
                      className={`px-3 py-1 rounded-md text-xs font-semibold border transition-all duration-200 ${
                        active
                          ? "bg-yellow-400 text-black border-yellow-400 shadow"
                          : "bg-neutral-900 text-neutral-300 border-neutral-700 hover:border-yellow-400 hover:text-yellow-300"
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ACCIONES */}
      <div className="flex gap-3">
        <button
          onClick={generateMatrix}
          className="text-[11px] bg-neutral-800 border border-neutral-700 px-3 py-2 rounded-md text-neutral-200 hover:border-yellow-400 hover:text-yellow-300 transition"
        >
          Generar variantes
        </button>

        <button
          onClick={resetAll}
          className="text-[11px] bg-neutral-800 border border-neutral-700 px-3 py-2 rounded-md text-neutral-300 hover:border-red-400 hover:text-red-300 transition"
        >
          Reiniciar selección
        </button>
      </div>

      {/* VARIANT TABLE */}
      {variants.length > 0 && (
        <div className="border border-neutral-800 rounded-lg overflow-hidden animate-fadeInSlow">
          <table className="w-full text-xs">
            <thead className="bg-neutral-950">
              <tr className="text-[11px] uppercase tracking-wide text-neutral-500">
                <th className="px-3 py-2 text-left">Color</th>
                <th className="px-3 py-2 text-left">Talla</th>
                <th className="px-3 py-2 text-center">Stock</th>
              </tr>
            </thead>

            <tbody>
              {variants.map((v, idx) => {
                const color = colorImages.find(
                  (c) => c.colorId === v.colorId
                );
                const size = sizes.find((s) => s.id === v.sizeId);

                return (
                  <tr
                    key={`${v.colorId}-${v.sizeId}-${idx}`}
                    className="border-t border-neutral-800"
                  >
                    <td className="px-3 py-2 text-neutral-300 flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full border border-neutral-700"
                        style={{
                          backgroundColor: colorToCss(
                            color?.colorName || ""
                          ),
                        }}
                      />
                      {color?.colorName}
                    </td>

                    <td className="px-3 py-2 text-neutral-300">
                      {size?.label}
                    </td>

                    <td className="px-3 py-2 text-center">
                      <input
                        type="number"
                        min={0}
                        className="w-20 rounded bg-neutral-900 border border-neutral-700 px-2 py-1 text-right text-white text-xs"
                        value={v.stock}
                        onChange={(e) => {
                          const value = parseInt(
                            e.target.value || "0"
                          );
                          setVariants(
                            variants.map((vv, i) =>
                              i === idx
                                ? { ...vv, stock: value }
                                : vv
                            )
                          );
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* FOOTER */}
      <div className="flex justify-between items-center pt-3 border-t border-neutral-800">
        {message && (
          <span
            className={`text-xs ${
              msgColor === "red"
                ? "text-red-400"
                : msgColor === "green"
                ? "text-green-400"
                : "text-yellow-300"
            }`}
          >
            {message}
          </span>
        )}

        <button
          onClick={handleSave}
          disabled={saving || !variants.length}
          className="bg-yellow-400 text-black font-bold text-xs py-2.5 px-5 rounded-lg hover:bg-yellow-300 active:scale-95 disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar variantes"}
        </button>
      </div>
    </section>
  );
}
