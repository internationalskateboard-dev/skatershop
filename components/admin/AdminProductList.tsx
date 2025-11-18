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
  source?: "api" | "local" | "auto";
};

export default function AdminProductList({
  onEdit,
  onClone,
  source = "auto",
}: AdminProductListProps) {
  const { products: localProducts, removeProduct: removeLocalProduct } =
    useProductStore();
  const getSoldQty = useSalesStore((s) => s.getSoldQty);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const { setSource, setLastError, reportApiSuccess, reportApiError } =
    useAdminDataSource();

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
          setSource(source === "auto" ? "api" : source);
          reportApiSuccess();
        }
      } catch (err: unknown) {
        console.warn("[AdminProductList] usando productos locales:", err);
        if (!cancelled) {
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
    source,
  ]);

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
      {/* Header + búsqueda */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">Lista de Productos</h2>
          <p className="text-xs text-neutral-500">
            Filtra por ID, nombre o descripción. Exporta solo lo filtrado.
          </p>
        </div>

        <div className="flex w-full md:w-auto flex-col md:flex-row gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto..."
            className="bg-neutral-950 border border-neutral-700 rounded-md px-3 py-2 text-sm text-white outline-none focus:border-yellow-400 w-full md:w-64"
          />
          <button
            onClick={handleExportCsv}
            className="bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-lg text-[11px] font-semibold py-2 px-3 hover:border-yellow-400 hover:text-yellow-400 transition md:self-auto self-stretch whitespace-nowrap"
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
        <div className="mt-2 border border-neutral-800 rounded-lg overflow-hidden">
          {/* Scroll horizontal solo donde haga falta; se desactiva visualmente en desktop */}
          <div className="overflow-x-auto md:overflow-x-visible">
            {/* Scroll vertical: si la tabla es muy grande, hace scroll.
                En pantallas grandes la barra se oculta con scrollbar-hide */}
            <div className="max-h-[60vh] overflow-y-auto md:scrollbar-hide">
              <table className="min-w-full text-sm">
                <thead className="bg-neutral-950 sticky top-0 z-10">
                  <tr className="text-[11px] uppercase tracking-wide text-neutral-500">
                    <th className="px-3 py-2 text-center">Producto</th>
                    <th className="px-3 py-2 text-left hidden md:table-cell">
                      Precio
                    </th>
                    <th className="px-3 py-2 text-left hidden lg:table-cell">
                      Stock
                    </th>
                    <th className="px-3 py-2 text-left hidden lg:table-cell">
                      Tallas
                    </th>
                    <th className="px-3 py-2 text-left hidden xl:table-cell">
                      Colores
                    </th>
                    <th className="px-3 py-2 text-left hidden lg:table-cell">
                      Vendido
                    </th>
                    <th className="px-3 py-2 text-left hidden md:table-cell">
                      Imagen
                    </th>
                    <th className="px-3 py-2 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => {
                    const soldQty = getSoldQty(p.id);
                    const locked = soldQty > 0;

                    const isTruncated =
                      typeof p.image === "string" &&
                      p.image.includes("...truncated");
                    const imageToShow =
                      !p.image || isTruncated
                        ? PRODUCT_PLACEHOLDER_IMAGE
                        : p.image;

                    const price = Number(p.price ?? 0).toFixed(2);

                    return (
                      <tr
                        key={p.id}
                        className="border-t border-neutral-800 hover:bg-neutral-800/40 transition"
                      >
                        {/* Producto + info compacta para mobile */}
                        <td className="align-top px-3 py-3 text-xs text-neutral-200">
                          <div className="flex items-start gap-3">
                            {/* Thumbnail solo en mobile */}
                            <div className="md:hidden flex-shrink-0">
                              <Image
                                src={imageToShow}
                                alt={p.name ?? "producto"}
                                width={56}
                                height={56}
                                className="w-14 h-14 object-cover rounded-md border border-neutral-800 bg-neutral-950"
                              />
                            </div>

                            <div className="flex flex-col gap-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-semibold text-white">
                                  {p.name}
                                </span>
                                <span className="text-[10px] text-neutral-500">
                                  ({p.id})
                                </span>
                                {locked && (
                                  <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/40 rounded px-2 py-[2px] font-bold uppercase tracking-wide">
                                    LOCKED
                                  </span>
                                )}
                              </div>

                              {p.desc && (
                                <p className="text-[11px] text-neutral-500 leading-snug">
                                  {p.desc}
                                </p>
                              )}

                              {p.sizeGuide && (
                                <p className="text-[10px] text-neutral-500 mt-1 whitespace-pre-line hidden md:block">
                                  {p.sizeGuide}
                                </p>
                              )}

                              {/* Meta info compacta SOLO en mobile */}
                              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-neutral-400 md:hidden">
                                <span>€{price}</span>
                                {typeof p.stock === "number" && (
                                  <span>Stock: {p.stock}</span>
                                )}
                                {p.isClothing &&
                                  Array.isArray(p.sizes) &&
                                  p.sizes.length > 0 && (
                                    <span>
                                      Tallas: {p.sizes.slice(0, 3).join(", ")}
                                      {p.sizes.length > 3 && "…"}
                                    </span>
                                  )}
                                {p.colors?.length ? (
                                  <span>
                                    Colores:{" "}
                                    {p.colors
                                      .map((c) => c.name)
                                      .slice(0, 3)
                                      .join(", ")}
                                    {p.colors.length > 3 && "…"}
                                  </span>
                                ) : null}
                                {soldQty > 0 && (
                                  <span>Vendidos: {soldQty}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Precio (solo desde md) */}
                        <td className="items-center text-center px-3 py-3 text-xs text-yellow-400 font-bold hidden md:table-cell whitespace-nowrap">
                          €{price}
                        </td>

                        {/* Stock */}
                        <td className="items-center text-center px-3 py-3 text-xs text-neutral-300 hidden lg:table-cell whitespace-nowrap">
                          {typeof p.stock === "number"
                            ? p.stock
                            : "sin definir"}
                        </td>

                        {/* Tallas */}
                        <td className="items-center text-center px-3 py-3 text-[11px] text-neutral-300 hidden lg:table-cell">
                          {p.isClothing &&
                          Array.isArray(p.sizes) &&
                          p.sizes.length > 0 ? (
                            <span>{p.sizes.join(", ")}</span>
                          ) : (
                            <span className="text-neutral-600">{p.sizes}</span>
                          )}
                        </td>

                        {/* Colores */}
                        <td className="items-center text-center px-3 py-3 text-[11px] text-neutral-300 hidden xl:table-cell">
                          {p.colors?.length ? (
                            <span>
                              {p.colors.map((c) => c.name).join(", ")}
                            </span>
                          ) : (
                            <span className="text-neutral-600">—</span>
                          )}
                        </td>

                        {/* Vendido */}
                        <td className="text-center px-3 py-3 text-[11px] text-neutral-300 hidden lg:table-cell whitespace-nowrap">
                          {soldQty > 0 ? (
                            <span className="text-green-400">
                              {soldQty}
                            </span>
                          ) : (
                            <span className="text-red-500">{soldQty}</span>
                          )}
                        </td>

                        {/* Imagen grande: solo desktop/tablet */}
                        <td className="items-center px-3 py-3 hidden md:table-cell">
                          <div className="flex flex-col items-start gap-1">
                            <Image
                              src={imageToShow}
                              alt={p.name ?? "producto"}
                              width={64}
                              height={64}
                              className="w-16 h-16 object-cover rounded-md border border-neutral-800 bg-neutral-950"
                            />
                            {isTruncated && (
                              <p className="text-[9px] text-yellow-400">
                                imagen recortada en local
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Acciones */}
                        <td className="items-center px-3 py-3">
                          <div className="flex flex-col sm:flex-row gap-2 justify-end">
                            <button
                              onClick={() => handleDelete(p)}
                              className="bg-red-500/20 text-red-400 border border-red-500/40 rounded-lg text-[11px] font-semibold py-1.5 px-3 hover:bg-red-500/30 hover:text-red-300 transition"
                            >
                              Borrar
                            </button>

                            {!locked && onEdit && (
                              <button
                                onClick={() => onEdit(p)}
                                className="bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-lg text-[11px] font-semibold py-1.5 px-3 hover:border-yellow-400 hover:text-yellow-400 transition"
                              >
                                Editar
                              </button>
                            )}

                            {locked && onClone && (
                              <button
                                onClick={() => onClone(p)}
                                className="bg-yellow-400 text-black rounded-lg text-[11px] font-bold py-1.5 px-3 hover:bg-yellow-300 active:scale-95 transition"
                              >
                                Clonar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
