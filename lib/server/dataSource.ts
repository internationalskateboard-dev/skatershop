// lib/server/dataSource.ts
/**
 * Helper para leer de una fuente externa opcional.
 * Si no hay URL o falla, devolvemos null y dejamos que la ruta haga fallback.
 */
export async function fetchJsonOrNull(url?: string) {
  if (!url) return null;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("[dataSource] fallo leyendo", url, err);
    return null;
  }
}
