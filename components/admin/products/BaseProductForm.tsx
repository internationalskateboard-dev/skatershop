// components/admin/products/BaseProductForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useProductTypes } from "@/hooks/admin/useProductTypes";
import { useCategories } from "@/hooks/admin/useCategories";
import { slugifyStreet } from "@/lib/products/slugify";

export type BaseProductFormValue = {
  name: string;
  slug: string;
  price: string; // se convierte a number al guardar
  desc: string;
  details: string;
  productTypeId: number | null;
  categoryId: number | null;
};

type BaseProductFormProps = {
  initialValue?: Partial<BaseProductFormValue> | null;
  onSubmit: (value: BaseProductFormValue) => Promise<void> | void;
  saving?: boolean;
};

export function BaseProductForm({
  initialValue,
  onSubmit,
  saving = false,
}: BaseProductFormProps) {
  const { types, loading: loadingTypes } = useProductTypes();
  const { categories, loading: loadingCategories } = useCategories();

  const [form, setForm] = useState<BaseProductFormValue>({
    name: "",
    slug: "",
    price: "",
    desc: "",
    details: "",
    productTypeId: null,
    categoryId: null,
    ...initialValue,
  });

  // Control Shopify-style: si el usuario edita el slug, dejamos de autogenerarlo
  const [slugTouched, setSlugTouched] = useState<boolean>(
    Boolean(initialValue?.slug)
  );

  useEffect(() => {
    if (!initialValue) return;
    setForm((prev) => ({
      ...prev,
      ...initialValue,
      slug: initialValue.slug ?? prev.slug ?? "",
    }));
    if (initialValue.slug) {
      setSlugTouched(true);
    }
  }, [initialValue]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;

    if (name === "name") {
      setForm((prev) => {
        const next = { ...prev, name: value };
        // Autogenerar slug solo si no ha sido tocado y el slug está vacío
        if (!slugTouched && !prev.slug) {
          next.slug = slugifyStreet(value);
        }
        return next;
      });
      return;
    }

    if (name === "price") {
      setForm((prev) => ({ ...prev, price: value }));
      return;
    }

    if (name === "slug") {
      setSlugTouched(true);
      setForm((prev) => ({ ...prev, slug: value.toLowerCase() }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSelectChange(
    e: React.ChangeEvent<HTMLSelectElement>,
    field: "productTypeId" | "categoryId"
  ) {
    const value = e.target.value;
    setForm((prev) => ({
      ...prev,
      [field]: value ? Number(value) : null,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim() || !form.price.trim()) {
      alert("Nombre y precio son obligatorios.");
      return;
    }

    const cleanSlug =
      form.slug.trim() || slugifyStreet(form.name.trim() || "producto");

    await onSubmit({
      ...form,
      name: form.name.trim(),
      slug: cleanSlug,
      price: form.price.trim(),
      desc: form.desc.trim(),
      details: form.details.trim(),
    });
  }

  const isBusy = saving || loadingTypes || loadingCategories;

  return (
    <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            Paso 1 de 4
          </p>
          <h3 className="text-lg font-semibold text-white">
            Información básica del producto
          </h3>
          <p className="text-xs text-neutral-500 mt-1">
            Define el nombre, slug, precio, tipo y categoría. Más adelante
            añadirás imágenes, variantes y stock por talla/color.
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        {/* Nombre */}
        <label className="block text-sm">
          <span className="text-neutral-300">Nombre</span>
          <input
            required
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Hoodie Black"
            className="mt-1 w-full rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2 text-white outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-sm"
          />
        </label>

        {/* Slug (autogenerado, editable) */}
        <label className="block text-sm">
          <span className="text-neutral-300">Slug (URL / ID legible)</span>
          <input
            required
            name="slug"
            value={form.slug}
            onChange={handleChange}
            placeholder="hoodie_black"
            className="mt-1 w-full rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2 text-white outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-sm font-mono"
          />
          <p className="text-[10px] text-neutral-500 mt-1">
            Se genera automáticamente a partir del nombre mientras no lo
            modifiques. Usa solo letras, números y guiones bajos.
          </p>
        </label>

        {/* Precio */}
        <label className="block text-sm">
          <span className="text-neutral-300">Precio (€)</span>
          <input
            required
            type="number"
            step="0.01"
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="39.90"
            className="mt-1 w-full rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2 text-white outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-sm"
          />
        </label>

        {/* Tipo de producto */}
        <label className="block text-sm">
          <span className="text-neutral-300">Tipo de producto</span>
          <select
            value={form.productTypeId ?? ""}
            onChange={(e) => handleSelectChange(e, "productTypeId")}
            className="mt-1 w-full rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2 text-white outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-sm"
          >
            <option value="">
              {loadingTypes ? "Cargando tipos..." : "Selecciona un tipo"}
            </option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>

        {/* Categoría */}
        <label className="block text-sm">
          <span className="text-neutral-300">Categoría</span>
          <select
            value={form.categoryId ?? ""}
            onChange={(e) => handleSelectChange(e, "categoryId")}
            className="mt-1 w-full rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2 text-white outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-sm"
          >
            <option value="">
              {loadingCategories
                ? "Cargando categorías..."
                : "Selecciona una categoría"}
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        {/* Descripción corta */}
        <label className="block text-sm md:col-span-2">
          <span className="text-neutral-300">Descripción corta</span>
          <textarea
            name="desc"
            value={form.desc}
            onChange={handleChange}
            placeholder="Hoodie oversize negro con logo bordado."
            className="mt-1 w-full rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2 text-white outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-sm min-h-[60px]"
          />
        </label>

        {/* Detalles largos */}
        <label className="block text-sm md:col-span-2">
          <span className="text-neutral-300">Detalles largos</span>
          <textarea
            name="details"
            value={form.details}
            onChange={handleChange}
            placeholder="Fit relajado, algodón pesado, 450gsm..."
            className="mt-1 w-full rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2 text-white outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-sm min-h-[80px]"
          />
        </label>

        {/* Botón submit */}
        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={isBusy}
            className="bg-yellow-400 text-black font-bold text-xs py-2.5 px-5 rounded-lg hover:bg-yellow-300 active:scale-95 transition uppercase tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving || isBusy ? "Guardando..." : "Guardar paso 1"}
          </button>
        </div>
      </form>
    </section>
  );
}
