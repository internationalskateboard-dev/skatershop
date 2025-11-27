// components/admin/products/ProductPagination.tsx
"use client";

type Props = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function ProductPagination({
  page,
  totalPages,
  onPageChange,
}: Props) {
  if (totalPages <= 1) return null;

  function buildPages() {
    const arr: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) arr.push(i);
      return arr;
    }

    if (page <= 3) return [1, 2, 3, 4, "...", totalPages];

    if (page >= totalPages - 2)
      return [
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];

    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  }

  const pages = buildPages();

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="px-3 py-1 text-xs bg-neutral-900 border border-neutral-700 rounded-md text-neutral-300 disabled:opacity-40 hover:border-yellow-400 hover:text-yellow-300"
      >
        ← Anterior
      </button>

      <div className="flex gap-1">
        {pages.map((p, i) =>
          typeof p === "string" ? (
            <span key={i} className="px-2 text-xs text-neutral-500">
              {p}
            </span>
          ) : (
            <button
              key={i}
              onClick={() => onPageChange(p)}
              className={`px-3 py-1 text-xs rounded-md border transition ${
                p === page
                  ? "bg-yellow-400 text-black border-yellow-400 font-bold"
                  : "bg-neutral-900 text-neutral-300 border-neutral-700 hover:border-yellow-400 hover:text-yellow-300"
              }`}
            >
              {p}
            </button>
          )
        )}
      </div>

      <button
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="px-3 py-1 text-xs bg-neutral-900 border border-neutral-700 rounded-md text-neutral-300 disabled:opacity-40 hover:border-yellow-400 hover:text-yellow-300"
      >
        Siguiente →
      </button>
    </div>
  );
}
