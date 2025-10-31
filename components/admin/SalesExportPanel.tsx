"use client";

import { useEffect, useState } from "react";

export default function SalesExportPanel() {
  const [downloading, setDownloading] = useState(false);
  const [allSales, setAllSales] = useState<any[] | null>(null);
  const [range, setRange] = useState<"all" | "today" | "7d" | "month">("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/sales");
        if (!res.ok) {
          if (!cancelled) {
            setAllSales([]);
            setLoadError("No se pudo obtener ventas (API no disponible).");
          }
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          setAllSales(Array.isArray(data.sales) ? data.sales : []);
          setLoadError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setAllSales([]);
          setLoadError("No se pudo obtener ventas (error de red).");
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function getFilteredSales(): any[] {
    if (!allSales) return [];
    const now = new Date();

    // manual
    if (from || to) {
      const fromDate = from ? new Date(from) : null;
      const toDate = to ? new Date(to) : null;
      return allSales.filter((s) => {
        if (!s.createdAt) return false;
        const d = new Date(s.createdAt);
        if (fromDate && d < fromDate) return false;
        if (toDate) {
          const toEnd = new Date(toDate);
          toEnd.setHours(23, 59, 59, 999);
          if (d > toEnd) return false;
        }
        return true;
      });
    }

    if (range === "today") {
      const y = now.getFullYear();
      const m = now.getMonth();
      const day = now.getDate();
      return allSales.filter((s) => {
        if (!s.createdAt) return false;
        const d = new Date(s.createdAt);
        return (
          d.getFullYear() === y &&
          d.getMonth() === m &&
          d.getDate() === day
        );
      });
    }

    if (range === "7d") {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return allSales.filter((s) => {
        if (!s.createdAt) return false;
        const d = new Date(s.createdAt);
        return d >= sevenDaysAgo;
      });
    }

    if (range === "month") {
      const y = now.getFullYear();
      const m = now.getMonth();
      return allSales.filter((s) => {
        if (!s.createdAt) return false;
        const d = new Date(s.createdAt);
        return d.getFullYear() === y && d.getMonth() === m;
      });
    }

    return allSales;
  }

  async function handleExport() {
    const sales = getFilteredSales();
    if (!sales || sales.length === 0) {
      alert("No hay ventas en el rango seleccionado.");
      return;
    }

    setDownloading(true);
    try {
      const headers = [
        "id",
        "fecha",
        "total",
        "items",
        "cliente",
        "email",
        "telefono",
        "pais",
        "ciudad",
        "direccion",
        "zip",
      ];

      const rows = sales.map((s: any) => {
        const fecha = s.createdAt
          ? new Date(s.createdAt).toISOString()
          : "";
        const itemsText = (s.items || [])
          .map((it: any) =>
            it.size
              ? `${it.qty}x ${it.productId} (${it.size})`
              : `${it.qty}x ${it.productId}`
          )
          .join(" | ");

        const cliente = s.customer?.fullName ?? "";
        const email = s.customer?.email ?? "";
        const phone = s.customer?.phone ?? "";
        const country = s.customer?.country ?? "";
        const city = s.customer?.city ?? "";
        const adresse = s.customer?.adresse ?? "";
        const zip = s.customer?.zip ?? "";

        return [
          s.id ?? "",
          fecha,
          typeof s.total === "number" ? s.total.toFixed(2) : "",
          itemsText,
          cliente,
          email,
          phone,
          country,
          city,
          adresse,
          zip,
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",");
      });

      const csv = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const now = new Date().toISOString().slice(0, 10);
      a.download = `ventas-skater-${now}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CSV export error:", err);
      alert("No se pudo exportar las ventas.");
    } finally {
      setDownloading(false);
    }
  }

  const filtered = getFilteredSales();
  const filteredCount = filtered.length;
  const totalEUR = filtered.reduce(
    (acc, s: any) => acc + (typeof s.total === "number" ? s.total : 0),
    0
  );

  return (
    <div className="mb-4 bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex flex-wrap gap-3 items-center justify-between">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-neutral-400">Rango:</span>
        <button
          type="button"
          onClick={() => {
            setRange("all");
            setFrom("");
            setTo("");
          }}
          className={`text-xs px-2 py-1 rounded-md border ${
            range === "all"
              ? "bg-yellow-400 text-black border-yellow-400"
              : "border-neutral-700 text-neutral-200 hover:border-yellow-400"
          }`}
        >
          Todo
        </button>
        <button
          type="button"
          onClick={() => {
            setRange("today");
            setFrom("");
            setTo("");
          }}
          className={`text-xs px-2 py-1 rounded-md border ${
            range === "today"
              ? "bg-yellow-400 text-black border-yellow-400"
              : "border-neutral-700 text-neutral-200 hover:border-yellow-400"
          }`}
        >
          Hoy
        </button>
        <button
          type="button"
          onClick={() => {
            setRange("7d");
            setFrom("");
            setTo("");
          }}
          className={`text-xs px-2 py-1 rounded-md border ${
            range === "7d"
              ? "bg-yellow-400 text-black border-yellow-400"
              : "border-neutral-700 text-neutral-200 hover:border-yellow-400"
          }`}
        >
          Últimos 7 días
        </button>
        <button
          type="button"
          onClick={() => {
            setRange("month");
            setFrom("");
            setTo("");
          }}
          className={`text-xs px-2 py-1 rounded-md border ${
            range === "month"
              ? "bg-yellow-400 text-black border-yellow-400"
              : "border-neutral-700 text-neutral-200 hover:border-yellow-400"
          }`}
        >
          Este mes
        </button>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="date"
          value={from}
          onChange={(e) => {
            setFrom(e.target.value);
            setRange("all");
          }}
          className="bg-neutral-950 border border-neutral-700 rounded-md text-xs px-2 py-1 text-neutral-100"
        />
        <span className="text-xs text-neutral-500">→</span>
        <input
          type="date"
          value={to}
          onChange={(e) => {
            setTo(e.target.value);
            setRange("all");
          }}
          className="bg-neutral-950 border border-neutral-700 rounded-md text-xs px-2 py-1 text-neutral-100"
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-[11px] text-neutral-400">
            {filteredCount} venta{filteredCount === 1 ? "" : "s"}
          </p>
          <p className="text-[11px] text-yellow-400 font-semibold">
            Total: €{totalEUR.toFixed(2)}
          </p>
          {loadError ? (
            <p className="text-[10px] text-red-400">{loadError}</p>
          ) : null}
        </div>
        <button
          onClick={handleExport}
          disabled={downloading || allSales === null}
          className="inline-flex items-center gap-2 bg-neutral-800 border border-neutral-700 text-neutral-100 text-xs font-semibold px-3 py-2 rounded-lg hover:border-yellow-400 hover:text-yellow-400 transition disabled:opacity-60"
        >
          {downloading ? "Exportando..." : "⬇️ Exportar CSV"}
        </button>
      </div>
    </div>
  );
}
