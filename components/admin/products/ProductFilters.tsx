// components/admin/products/ProductFilters.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type Filters = {
  search: string;
  categoryId: number | null;
  typeId: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  published: "all" | "yes" | "no";
  sort: string;
  page: number;
  limit: number;
};

type ProductFiltersProps = {
  filters: Filters;
  updateFilter: (data: Partial<Filters>) => void;
  resetFilters: () => void;
};

export default function ProductFilters({
  filters,
  updateFilter,
  resetFilters,
}: ProductFiltersProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);

  /** Cargar catálogos */
  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));

    fetch("/api/admin/product-types")
      .then((r) => r.json())
      .then((d) => setTypes(d.types || []));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-neutral-800 rounded-xl bg-neutral-900 p-4 space-y-4"
    >
      {/* Buscar */}
      <input
        type="text"
        placeholder="Buscar producto..."
        className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-sm text-neutral-300"
        value={filters.search}
        onChange={(e) => updateFilter({ search: e.target.value, page: 1 })}
      />

      {/* Filas de selects */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Categoría */}
        <select
          className="filter-select"
          value={filters.categoryId ?? ""}
          onChange={(e) =>
            updateFilter({
              categoryId: e.target.value ? Number(e.target.value) : null,
              page: 1,
            })
          }
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Tipo */}
        <select
          className="filter-select"
          value={filters.typeId ?? ""}
          onChange={(e) =>
            updateFilter({
              typeId: e.target.value ? Number(e.target.value) : null,
              page: 1,
            })
          }
        >
          <option value="">Todos los tipos</option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        {/* Publicado */}
        <select
          className="filter-select"
          value={filters.published}
          onChange={(e) =>
            updateFilter({ published: e.target.value as any, page: 1 })
          }
        >
          <option value="all">Todos</option>
          <option value="yes">Publicados</option>
          <option value="no">No publicados</option>
        </select>
      </div>

      {/* Precio */}
      <div className="grid grid-cols-2 gap-4">
        <input
          type="number"
          placeholder="Precio mínimo"
          className="filter-input"
          value={filters.minPrice ?? ""}
          onChange={(e) =>
            updateFilter({
              minPrice: e.target.value ? Number(e.target.value) : null,
              page: 1,
            })
          }
        />

        <input
          type="number"
          placeholder="Precio máximo"
          className="filter-input"
          value={filters.maxPrice ?? ""}
          onChange={(e) =>
            updateFilter({
              maxPrice: e.target.value ? Number(e.target.value) : null,
              page: 1,
            })
          }
        />
      </div>

      {/* Botón reset */}
      <button
        className="w-full text-xs py-2 bg-neutral-800 border border-neutral-600 text-neutral-300 rounded-md hover:border-yellow-400 hover:text-yellow-300 transition"
        onClick={resetFilters}
      >
        Reiniciar filtros
      </button>

      <style jsx>{`
        .filter-select,
        .filter-input {
          background: #1a1a1a;
          border: 1px solid #3a3a3a;
          color: #ddd;
          padding: 0.5rem;
          border-radius: 6px;
          font-size: 0.85rem;
        }
        .filter-select:hover,
        .filter-input:hover {
          border-color: #facc15;
        }
      `}</style>
    </motion.div>
  );
}
