"use client";

import { useEffect, useState } from "react";
import useSalesStore from "@/store/salesStore";

export default function AdminSalesList() {
  const localSales = useSalesStore((s) => s.sales ?? []);
  const [apiSales, setApiSales] = useState<any[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/sales");
        if (!res.ok) {
          if (!cancelled) setApiSales(null);
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          setApiSales(Array.isArray(data.sales) ? data.sales : []);
        }
      } catch (err) {
        if (!cancelled) setApiSales(null);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const sales = apiSales ?? localSales;

  return (
    <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
      <h2 className="text-xl font-display font-bold mb-4">
        Últimas ventas
      </h2>

      {sales.length === 0 ? (
        <p className="text-neutral-500 text-sm">
          Aún no hay ventas registradas.
        </p>
      ) : (
        <ul className="space-y-3 text-sm">
          {sales.map((s: any) => {
            const when = s.createdAt
              ? new Date(s.createdAt).toLocaleString()
              : "—";
            const itemsText = (s.items || [])
              .map((it: any) =>
                it.size
                  ? `${it.qty}x ${it.productId} (${it.size})`
                  : `${it.qty}x ${it.productId}`
              )
              .join(" | ");

            return (
              <li
                key={s.id ?? when}
                className="border-b border-neutral-800 pb-3"
              >
                <p className="text-neutral-200 font-semibold">
                  {s.customer?.fullName ?? "Cliente sin nombre"}
                </p>
                <p className="text-[11px] text-neutral-500">{when}</p>
                <p className="text-[11px] text-neutral-400 mt-1">
                  {itemsText}
                </p>
                <p className="text-[11px] text-yellow-400 font-semibold mt-1">
                  Total: €
                  {typeof s.total === "number"
                    ? s.total.toFixed(2)
                    : "0.00"}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
