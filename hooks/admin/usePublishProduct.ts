// hooks/admin/usePublishProduct.ts
"use client";

import { useState } from "react";
import type { ProductWithRelations } from "@/lib/types";

export function usePublishProduct() {
  const [loadingId, setLoadingId] = useState<number | null>(null);

  async function togglePublish(p: ProductWithRelations, reload: () => void) {
    setLoadingId(p.id);

    try {
      const res = await fetch(`/api/admin/products/publish/${p.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Si la respuesta no es JSON → error seguro
      const text = await res.text();
      let data: any = null;

      try {
        data = JSON.parse(text);
      } catch {
        console.error("Respuesta no-JSON:", text);
        throw new Error("Respuesta inválida del servidor.");
      }

      if (!res.ok) throw new Error(data?.error || "Error en servidor");

      // Todo ok
      reload();
    } catch (err) {
      console.error("togglePublish error:", err);
      alert("No se pudo actualizar published.");
    } finally {
      setLoadingId(null);
    }
  }

  return { togglePublish, loadingId };
}
