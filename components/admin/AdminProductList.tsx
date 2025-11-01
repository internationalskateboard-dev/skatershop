// components/admin/AdminProductList.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import useProductStore from "@/store/productStore";
import useSalesStore from "@/store/salesStore";
import { PRODUCT_PLACEHOLDER_IMAGE } from "@/lib/constants";
import type { Product } from "@/lib/types";
import { useAdminDataSource } from "./AdminDataSourceContext";

type AdminProductListProps = {
  onEdit?: (p: Product) => void;
  onClone?: (p: Product) => void;
};

export default function AdminProductList({
  onEdit,
  onClone,
}: AdminProductListProps) {
  const {
    products: localProducts,
    removeProduct: removeLocalProduct,
  } = useProductStore();
  const getSoldQty = useSalesStore((s) => s.getSoldQty);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const { setSource, setLastError } = useAdminDataSource();

  // cargar productos al montar
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLastError(null);
      try {
        const res = await fetch("/api/products", { method: "GET" });
        if (!res.ok) throw new Error("No se pudo leer /api/products");
        const data = await res.json();
        const apiProducts = (data.products || []) as Product[];
        if (!cancelled) {
          setProducts(apiProducts);
          setSource("api");
        }
      } catch (err: unknown) {
        console.warn("[AdminProductList] usando productos locales:", err);
        if (!cancelled) {
          setProducts(localProducts);
          setSource("local");
          setLastError("No se pudo leer productos desde la API.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [localProducts, setSource, setLastError]);

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
    } catch (err) {
      console.warn("[AdminProductList] DELETE API falló, borrando local:", err);
      removeLocalProduct(p.id);
      setProducts((prev) => prev.filter((x) => x.id !== p.id));
      setSource("local");
      setLastError("No se pudo borrar en API, se borró localmente.");
    }
  }

  return (
    <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-display font-bold">
          Productos en memoria / API
        </h2>
        {/* El header ya muestra la fuente, aquí no hace falta */}
      </div>

      {products.length === 0 ? (
        <p className="text-neutral-500 text-sm">
          {loading ? "Cargando productos..." : "No hay productos creados aún."}
        </p>
      ) : (
        <ul className="space-y-4">
          {products.map((p) => {
            const soldQty = getSoldQty(p.id);
            const locked = soldQty > 0;

            const isTruncated =
              typeof p.image === "string" &&
              p.image.includes("...truncated");
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
                    <span className="text-[10px] text-neutral-500">
                      ({p.id})
                    </span>
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
