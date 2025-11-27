// components/admin/AdminProductForm.tsx
"use client";

import { useState, useMemo } from "react";
import useSalesStore from "@/store/salesStore";
import useProductStore from "@/store/productStore";
import type { Product } from "@/lib/types";
import { BaseProductForm, type BaseProductFormValue } from "@/components/admin/products/BaseProductForm";
import { slugifyStreet } from "@/lib/products/slugify";

type AdminProductFormProps = {
  initialData?: Product | null;
  onSaved?: () => void;
};

/**
 * Wizard de creación/edición de producto.
 * De momento solo implementa el PASO 1 (datos base).
 * Próximos pasos: imágenes, variantes, stock, publicación.
 */
export default function AdminProductForm({
  initialData,
  onSaved,
}: AdminProductFormProps) {
  const { updateProduct, addProduct, products: localProducts } =
    useProductStore();
  const getSoldQty = useSalesStore((s) => s.getSoldQty);

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const isEditing = Boolean(initialData);

  const baseInitialValue: Partial<BaseProductFormValue> | null = useMemo(() => {
    if (!initialData) return null;

    const price =
      typeof initialData.price === "number"
        ? String(initialData.price)
        : (initialData.price as any as string) ?? "";

    // Intentar usar slug si existe, si no, el id, y si no, generarlo desde name.
    const slugFromData: string =
      (initialData as any).slug ||
      (initialData as any).id ||
      slugifyStreet(initialData.name ?? "");

    return {
      name: initialData.name ?? "",
      slug: slugFromData,
      price,
      desc: (initialData as any).desc ?? "",
      details: (initialData as any).details ?? "",
      // Estos dos de momento no están realmente en Product,
      // pero quedarán listos para cuando conectemos con la BD.
      productTypeId: (initialData as any).idtype_fk ?? null,
      categoryId: (initialData as any).idcategory_fk ?? null,
    };
  }, [initialData]);

  async function handleSubmitBase(values: BaseProductFormValue) {
    const { name, slug, price, desc, details, productTypeId, categoryId } =
      values;

    const finalSlug = slug.trim() || slugifyStreet(name);
    const idForLocal = finalSlug; // mientras no haya id numérico de BD, usamos el slug como id string

    // Si estamos editando y el producto ya tiene ventas, no permitimos modificarlo
    const soldAlready = getSoldQty(isEditing ? (initialData as any)?.id ?? idForLocal : idForLocal);
    if (isEditing && soldAlready > 0) {
      alert("Este producto ya tiene ventas y no puede ser modificado.");
      return;
    }

    const priceNumber = parseFloat(price);
    if (Number.isNaN(priceNumber) || priceNumber < 0) {
      alert("El precio no es válido.");
      return;
    }

    const baseProductPayload: any = {
      id: idForLocal,
      slug: finalSlug,
      name: name.trim(),
      price: priceNumber,
      desc: desc.trim(),
      details: details.trim(),
      idtype_fk: productTypeId,
      idcategory_fk: categoryId,
      // Campos antiguos del sistema local que ahora podemos dejar como opcionales:
      // sizes, colors, stock, sizeGuide, isClothing, variantStock, image...
    };

    setSaving(true);
    setSaveMessage(null);

    try {
      // Mantener compatibilidad con la API / sistema local actual.
      const res = await fetch("/api/products", {
        method: "POST",
        body: JSON.stringify(baseProductPayload),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error("API /api/products no disponible");
      }

      // Actualizar store local
      const exists = localProducts.find((p: any) => p.id === idForLocal);
      if (exists) {
        updateProduct(idForLocal, baseProductPayload);
      } else {
        addProduct(baseProductPayload);
      }

      setSaveMessage("Producto guardado en API ✅");
    } catch (err) {
      console.warn("[AdminProductForm] /api/products falló, guardando local:", err);
      const exists = localProducts.find((p: any) => p.id === idForLocal);
      if (exists) {
        updateProduct(idForLocal, baseProductPayload);
      } else {
        addProduct(baseProductPayload);
      }
      setSaveMessage("Producto guardado LOCALMENTE ⚠️");
    } finally {
      setSaving(false);
      onSaved?.();

      // Para un nuevo producto, reseteamos el mensaje después de unos segundos.
      setTimeout(() => setSaveMessage(null), 3500);
    }
  }

  return (
    <div className="space-y-3">
      <BaseProductForm
        initialValue={baseInitialValue}
        onSubmit={handleSubmitBase}
        saving={saving}
      />
      {saveMessage && (
        <p className="text-xs text-neutral-400 px-1">{saveMessage}</p>
      )}
    </div>
  );
}
