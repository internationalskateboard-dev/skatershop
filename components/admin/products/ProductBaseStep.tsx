// components/admin/products/ProductBaseStep.tsx
"use client";

import { useEffect, useState } from "react";
import { slugifyStreet } from "@/lib/products/slugify";
import { useProductTypes } from "@/hooks/admin/useProductTypes";
import { useCategories } from "@/hooks/admin/useCategories";
import type { WizardBaseData } from "@/hooks/admin/useProductWizardState";

type ProductBaseStepProps = {
  value: WizardBaseData;
  onChange: (patch: Partial<WizardBaseData>) => void;
  onSubmit: (value: WizardBaseData) => Promise<void> | void;
  saving?: boolean;
};

export function ProductBaseStep({
  value,
  onChange,
  onSubmit,
  saving = false,
}: ProductBaseStepProps) {
  const { types, loading: loadingTypes } = useProductTypes();
  const { categories, loading: loadingCategories } = useCategories();

  const [slugTouched, setSlugTouched] = useState<boolean>(
    Boolean(value.slug)
  );

  useEffect(() => {
    // Si viene con datos precargados (edición), marcamos slug como tocado
    if (value.slug) setSlugTouched(true);
  }, [value.slug]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value: v } = e.target;

    if (name === "name") {
      onChange({ name: v });
      if (!slugTouched && !value.slug) {
        onChange({ slug: slugifyStreet(v) });
      }
      return;
    }

    if (name === "slug") {
      setSlugTouched(true);
      onChange({ slug: v.toLowerCase() });
      return;
    }

    if (name === "price") {
      onChange({ price: v });
      return;
    }

    onChange({ [name]: v } as any);
  }

  function handleSelectChange(
    e: React.ChangeEvent<HTMLSelectElement>,
    field: "productTypeId" | "categoryId"
  ) {
    const v = e.target.value;
    onChange({ [field]: v ? Number(v) : null } as any);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit({
      ...value,
      name: value.name.trim(),
      slug: (value.slug || slugifyStreet(value.name)).trim(),
      price: value.price.trim(),
      desc: value.desc.trim(),
      details: value.details.trim(),
    });
  }

  const isBusy = saving || loadingTypes || loadingCategories;

  // Agrupado estilo C:
  // - Ropa → Camisas, Sueters, Zapatos
  // - Skate → Skateboard
  // - Arte → Art
  // - Accesorios → Accessory
  const groupMap: Record<string, number[]> = {
    "Ropa": [],
    "Skate": [],
    "Arte": [],
    "Accesorios": [],
    "Otros": [],
  };

  types.forEach((t) => {
    const nameNorm = t.name.toLowerCase();
    if (["camisas", "sueters", "zapatos"].includes(nameNorm)) {
      groupMap["Ropa"].push(t.id);
    } else if (nameNorm === "skateboard") {
      groupMap["Skate"].push(t.id);
    } else if (nameNorm === "art") {
      groupMap["Arte"].push(t.id);
    } else if (nameNorm === "accessory") {
      groupMap["Accesorios"].push(t.id);
    } else {
      groupMap["Otros"].push(t.id);
    }
  });

  const groups = Object.entries(groupMap).filter(
    ([, ids]) => ids.length > 0
  );

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
            Define nombre, slug, precio, tipo y categoría. Esto se guarda
            directamente en la tabla <code className="font-mono">product</code>.
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
            value={value.name}
            onChange={handleChange}
            placeholder="Gorra Classic"
            className="mt-1 w-full rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2 text-white outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-sm"
          />
        </label>

        {/* Slug */}
        <label className="block text-sm">
          <span className="text-neutral-300">Slug (ID legible / URL)</span>
          <input
            required
            name="slug"
            value={value.slug}
            onChange={handleChange}
            placeholder="gorra_classic"
            className="mt-1 w-full rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2 text-white outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-sm font-mono"
          />
          <p className="text-[10px] text-neutral-500 mt-1">
            Se autogenera a partir del nombre mientras no lo modifiques.
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
            value={value.price}
            onChange={handleChange}
            placeholder="17.25"
            className="mt-1 w-full rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2 text-white outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-sm"
          />
        </label>

        {/* Tipo de producto (agrupado) */}
        <label className="block text-sm">
          <span className="text-neutral-300">Tipo de producto</span>
          <select
            value={value.productTypeId ?? ""}
            onChange={(e) => handleSelectChange(e, "productTypeId")}
            className="mt-1 w-full rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2 text-white outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-sm"
          >
            <option value="">
              {loadingTypes ? "Cargando tipos..." : "Selecciona un tipo"}
            </option>
            {groups.map(([groupName, ids]) => (
              <optgroup key={groupName} label={groupName}>
                {types
                  .filter((t) => ids.includes(t.id))
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </label>

        {/* Categoría */}
        <label className="block text-sm">
          <span className="text-neutral-300">Categoría</span>
          <select
            value={value.categoryId ?? ""}
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
            value={value.desc}
            onChange={handleChange}
            placeholder="Gorra clásica con logo bordado."
            className="mt-1 w-full rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2 text-white outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-sm min-h-[60px]"
          />
        </label>

        {/* Detalles largos */}
        <label className="block text-sm md:col-span-2">
          <span className="text-neutral-300">Detalles largos</span>
          <textarea
            name="details"
            value={value.details}
            onChange={handleChange}
            placeholder="Ajustable, algodón, cierre metálico..."
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
            {saving || isBusy ? "Guardando..." : "Guardar y continuar"}
          </button>
        </div>
      </form>
    </section>
  );
}