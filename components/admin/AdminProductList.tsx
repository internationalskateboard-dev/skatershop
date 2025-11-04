// components/admin/AdminProductList.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import useProductStore from "@/store/productStore";
import useSalesStore from "@/store/salesStore";
import { PRODUCT_PLACEHOLDER_IMAGE } from "@/lib/constants";
import type { Product } from "@/lib/types";
import { useAdminDataSource } from "./AdminDataSourceContext";
import { downloadProductsCsv } from "@/lib/admin/exportProductsCsv";

type AdminProductListProps = {
  onEdit?: (p: Product) => void;
  onClone?: (p: Product) => void;
  /**
   * Fuente que queremos usar en esta vista.
   * - "api"   → fuerza /api/products?source=api
   * - "local" → fuerza /api/products?source=local
   * - "auto" o undefined → /api/products (que decida el backend)
   */
  source?: "api" | "local" | "auto";
};

export default function AdminProductList({
  onEdit,
  onClone,
  source = "auto",
}: AdminProductListProps) {
  const {
    products: localProducts,
    removeProduct: removeLocalProduct,
  } = useProductStore();
  const getSoldQty = useSalesStore((s) => s.getSoldQty);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const {
    setSource,
    setLastError,
    reportApiSuccess,
    reportApiError,
    // ojo: tu contexto NO tiene "mode" aquí, solo setters
  } = useAdminDataSource();

  // cargar productos al montar y cuando cambie la fuente pedida
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLastError(null);
      try {
        const qs =
          source === "auto"
            ? ""
            : source === "api"
            ? "?source=api"
            : "?source=local";

        const res = await fetch(`/api/products${qs}`, { method: "GET" });
        if (!res.ok) throw new Error("No se pudo leer /api/products");
        const data = await res.json();
        const apiProducts = (data.products || []) as Product[];
        if (!cancelled) {
          setProducts(apiProducts);
          // avisamos al contexto qué fuente terminó usándose
          setSource(source === "auto" ? "api" : source);
          reportApiSuccess();
        }
      } catch (err: unknown) {
        console.warn("[AdminProductList] usando productos locales:", err);
        if (!cancelled) {
          // si falla la API siempre tendremos los locales
          setProducts(localProducts);
          setSource("local");
          const msg = "No se pudo leer productos desde la API.";
          setLastError(msg);
          reportApiError(msg);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [
    localProducts,
    setSource,
    setLastError,
    reportApiError,
    reportApiSuccess,
    source, // 👈 importante: recargar al cambiar fuente
  ]);

  // filtro por texto (sin cambios)
  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      return (
        (p.id && p.id.toLowerCase().includes(q)) ||
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.desc && p.desc.toLowerCase().includes(q))
      );
    });
  }, [products, search]);

  async function handleDelete(p: Product) {
    const soldQty = getSoldQty(p.id);
    if (soldQty > 0) {
      alert("No puedes borrar un producto que ya tiene ventas.");
      return;
    }

    // intentamos borrar en API primero
    try {
      const res = await fetch(`/api/products/${p.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("DELETE API falló");
      }
      setProducts((prev) => prev.filter((x) => x.id !== p.id));
      removeLocalProduct(p.id);
      reportApiSuccess();
    } catch (err) {
      console.warn("[AdminProductList] DELETE API falló, borrando local:", err);
      removeLocalProduct(p.id);
      setProducts((prev) => prev.filter((x) => x.id !== p.id));
      setSource("local");
      const msg = "No se pudo borrar en API, se borró localmente.";
      setLastError(msg);
      reportApiError(msg);
    }
  }

  function handleExportCsv() {
    downloadProductsCsv(filteredProducts, "inventario-filtrado.csv");
  }

  return (
    <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">Productos</h2>
          <p className="text-xs text-neutral-500">
            Filtra por ID, nombre o descripción. Exporta solo lo filtrado.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto…"
            className="bg-neutral-950 border border-neutral-700 rounded-md px-3 py-2 text-sm text-white outline-none focus:border-yellow-400"
          />
          <button
            onClick={handleExportCsv}
            className="bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-lg text-[11px] font-semibold py-2 px-3 hover:border-yellow-400 hover:text-yellow-400 transition"
          >
            Exportar CSV
          </button>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <p className="text-neutral-500 text-sm">
          {loading
            ? "Cargando productos..."
            : "No hay productos que coincidan con el filtro."}
        </p>
      ) : (
        <ul className="space-y-4">
          {filteredProducts.map((p) => {
            const soldQty = getSoldQty(p.id);
            const locked = soldQty > 0;

            const isTruncated =
              typeof p.image === "string" && p.image.includes("...truncated");
            const imageToShow =
              !p.image || isTruncated ? PRODUCT_PLACEHOLDER_IMAGE : p.image;

            return (
              <li
                key={p.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-neutral-800 pb-4 gap-3"
              >
                <div className="text-sm">
                  <p className="font-semibold text-white flex items-center gap-2 flex-wrap">
                    <span>{p.name}</span>
                    <span className="text-[10px] text-neutral-500">({p.id})</span>
                    {locked && (
                      <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/40 rounded px-2 py-[2px] font-bold uppercase tracking-wide">
                        LOCKED
                      </span>
                    )}
                  </p>

                  <p className="text-yellow-400 font-bold">
                    €{Number(p.price ?? 0).toFixed(2)}
                  </p>

                  <p className="text-neutral-400 text-xs">
                    Stock: {typeof p.stock === "number" ? p.stock : "sin definir"}
                  </p>

                  <p className="text-neutral-400 text-xs">
                    Tallas:{" "}
                    {Array.isArray(p.sizes) && p.sizes.length
                      ? p.sizes.join(", ")
                      : "—"}
                  </p>

                  {p.colors?.length ? (
                    <p className="text-neutral-400 text-xs">
                      Colores: {p.colors.map((c) => c.name).join(", ")}
                    </p>
                  ) : null}

                  {p.sizeGuide ? (
                    <p className="text-[11px] text-neutral-500 mt-2 whitespace-pre-line">
                      {p.sizeGuide}
                    </p>
                  ) : null}

                  <p className="text-neutral-500 text-[11px] leading-snug mt-1">
                    {p.desc}
                  </p>

                  <div className="mt-2">
                    <Image
                      src={imageToShow}
                      alt={p.name ?? "producto"}
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover rounded-lg border border-neutral-800 bg-neutral-950"
                    />
                    {isTruncated && (
                      <p className="text-[10px] text-yellow-400 mt-1">
                        imagen recortada en local
                      </p>
                    )}
                  </div>

                  <p className="text-[10px] text-neutral-500 mt-2">
                    Vendido: {soldQty} unidad{soldQty === 1 ? "" : "es"}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleDelete(p)}
                    className="self-start md:self-auto bg-red-500/20 text-red-400 border border-red-500/40 rounded-lg text-[11px] font-semibold py-2 px-3 hover:bg-red-500/30 hover:text-red-300 transition"
                  >
                    Borrar
                  </button>

                  {!locked && onEdit ? (
                    <button
                      onClick={() => onEdit(p)}
                      className="self-start md:self-auto bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-lg text-[11px] font-semibold py-2 px-3 hover:border-yellow-400 hover:text-yellow-400 transition"
                    >
                      Editar
                    </button>
                  ) : null}

                  {locked && onClone ? (
                    <button
                      onClick={() => onClone(p)}
                      className="self-start md:self-auto bg-yellow-400 text-black rounded-lg text-[11px] font-bold py-2 px-3 hover:bg-yellow-300 active:scale-95 transition"
                    >
                      Clonar como nuevo
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
