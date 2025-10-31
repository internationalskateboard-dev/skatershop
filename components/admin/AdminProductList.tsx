"use client";

import Image from "next/image";
import { PRODUCT_PLACEHOLDER_IMAGE } from "@/lib/constants";
import useProductStore from "@/store/productStore";
import useSalesStore from "@/store/salesStore";
import { useMemo } from "react";

export type AdminProductListProps = {
  externalProducts?: any[];
  onEdit?: (product: any) => void;
  onClone?: (product: any) => void;
};

export default function AdminProductList({
  externalProducts,
  onEdit,
  onClone,
}: AdminProductListProps) {
  const { products: localProducts, removeProduct } = useProductStore();
  const getSoldQty = useSalesStore((s) => s.getSoldQty);

  const products = useMemo(() => {
    if (Array.isArray(externalProducts) && externalProducts.length > 0) {
      return externalProducts;
    }
    return localProducts;
  }, [externalProducts, localProducts]);

  return (
    <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
      <h2 className="text-xl font-display font-bold mb-4">
        Productos en memoria / API
      </h2>

      {products.length === 0 ? (
        <p className="text-neutral-500 text-sm">No hay productos creados aún.</p>
      ) : (
        <ul className="space-y-4">
          {products.map((p) => {
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
                    Stock:{" "}
                    {typeof p.stock === "number" ? p.stock : "sin definir"}
                  </p>

                  <p className="text-neutral-400 text-xs">
                    Tallas:{" "}
                    {Array.isArray(p.sizes) && p.sizes.length
                      ? p.sizes.join(", ")
                      : "—"}
                  </p>

                  {p.colors?.length ? (
                    <p className="text-neutral-400 text-xs">
                      Colores: {p.colors.map((c: any) => c.name).join(", ")}
                    </p>
                  ) : null}

                  {p.sizeGuide ? (
                    <p className="text-[11px] text-neutral-500 mt-2 whitespace-pre-line">
                      {p.sizeGuide}
                    </p>
                  ) : null}

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
                    Vendido: {soldQty} unidad
                    {soldQty === 1 ? "" : "es"}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => {
                      if (locked) {
                        alert(
                          "No puedes borrar un producto que ya tiene ventas."
                        );
                        return;
                      }
                      removeProduct(p.id);
                    }}
                    className="self-start md:self-auto bg-red-500/20 text-red-400 border border-red-500/40 rounded-lg text-[11px] font-semibold py-2 px-3 hover:bg-red-500/30 hover:text-red-300 transition"
                  >
                    Borrar
                  </button>

                  {!locked && (
                    <button
                      onClick={() => onEdit?.(p)}
                      className="self-start md:self-auto bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-lg text-[11px] font-semibold py-2 px-3 hover:border-yellow-400 hover:text-yellow-400 transition"
                    >
                      Editar
                    </button>
                  )}

                  {locked && (
                    <button
                      onClick={() => onClone?.(p)}
                      className="self-start md:self-auto bg-yellow-400 text-black rounded-lg text-[11px] font-bold py-2 px-3 hover:bg-yellow-300 active:scale-95 transition"
                    >
                      Clonar como nuevo
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
