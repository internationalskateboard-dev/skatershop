"use client";

import { useState } from "react";
import { useProductWizardState } from "@/hooks/admin/useProductWizardState";
import { ProductBaseStep } from "@/components/admin/products/wizard/steps/ProductBaseStep";
import { ProductImagesStep } from "@/components/admin/products/ProductImagesStep";
import { ProductVariantStep } from "@/components/admin/products/wizard/steps/ProductVariantStep";
import { ProductSummaryStep } from "@/components/admin/products/wizard/steps/ProductSummaryStep";
import { useColors } from "@/hooks/admin/useColors";
import { WizardPanel } from "@/components/admin/products/wizard/WizardPanel";

export default function ProductWizard() {
  const {
    step,
    setStep,
    baseData,
    updateBaseData,
    setBaseFromServer,
    variants,
    setVariants,
  } = useProductWizardState();

  const [savingBase, setSavingBase] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const { colors, loading: loadingColors } = useColors();

  async function handleSubmitBase() {
    setSavingBase(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/products/base", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: baseData.name,
          slug: baseData.slug,
          price: Number(baseData.price),
          desc: baseData.desc,
          details: baseData.details,
          productTypeId: baseData.productTypeId,
          categoryId: baseData.categoryId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data?.error || "No se pudo crear el producto.");
        return;
      }

      if (data.product?.id) {
        setBaseFromServer({
          id: data.product.id,
          name: data.product.name,
          slug: data.product.slug,
        });

        setMessage("Producto creado correctamente. Paso 1 completado ✅");
        setStep(2);
      }
    } catch (err) {
      console.error(err);
      setMessage("Error inesperado al crear el producto.");
    } finally {
      setSavingBase(false);
      setTimeout(() => setMessage(null), 4000);
    }
  }

  return (
    <div className="space-y-6">

      {/* PANEL: PASO 1 */}
      <WizardPanel
        step={1}
        current={step}
        title="Datos base"
        description="Nombre, slug, categoría y tipo de producto"
      >
        <ProductBaseStep
          value={baseData}
          onChange={updateBaseData}
          onSubmit={handleSubmitBase}
          saving={savingBase}
        />
      </WizardPanel>

      {/* PANEL: PASO 2 */}
      {baseData.productId && (
        <WizardPanel
          step={2}
          current={step}
          title="Imágenes"
          description="Imagen principal y por color"
          onClick={() => step > 2 && setStep(2)}
        >
          {step >= 2 && (
            <ProductImagesStep
              productId={baseData.productId}
              productName={baseData.name}
              colors={colors.map((c) => ({ id: c.id, name: c.name }))}
              onCompleted={() => {
                setMessage("Imágenes guardadas correctamente. Paso 2 completado ✅");
                setStep(3);
              }}
            />
          )}
        </WizardPanel>
      )}

      {/* PANEL: PASO 3 */}
      {baseData.productId && (
        <WizardPanel
          step={3}
          current={step}
          title="Variantes"
          description="Colores, tallas y stock por combinación"
          onClick={() => step > 3 && setStep(3)}
        >
          {step >= 3 && (
            <ProductVariantStep
              productId={baseData.productId}
              productTypeId={baseData.productTypeId}
              variants={variants}
              setVariants={setVariants}
              onCompleted={() => {
                setMessage("Variantes guardadas. Paso 3 completado ✅");
                setStep(4);
              }}
            />
          )}
        </WizardPanel>
      )}

      {/* PANEL: PASO 4 */}
      {baseData.productId && (
        <WizardPanel
          step={4}
          current={step}
          title="Resumen"
          description="Revisión final del producto"
        >
          {step === 4 && <ProductSummaryStep productId={baseData.productId} />}
        </WizardPanel>
      )}

      {/* Mensaje inferior */}
      {message && (
        <div className="text-xs text-neutral-300 px-1">{message}</div>
      )}
    </div>
  );
}
