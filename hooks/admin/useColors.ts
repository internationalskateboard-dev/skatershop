// hooks/admin/useColors.ts
"use client";

import { useEffect, useState } from "react";
import type { Color } from "@/lib/types";

type UseColorsResult = {
  colors: Color[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useColors(): UseColorsResult {
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/colors");
      if (!res.ok) throw new Error("Error HTTP");
      const data = (await res.json()) as { colors?: Color[] };
      setColors(data.colors ?? []);
    } catch (err) {
      console.error("[useColors] error:", err);
      setError("No se pudieron cargar los colores.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return { colors, loading, error, refresh: () => void load() };
}
