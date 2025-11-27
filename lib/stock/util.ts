// lib/stock/util.ts
// Para Convertir todo los Valores string en Minuscula
export function normalize(value: string | null | undefined): string {
  if (!value) return "";
  return value.trim().toLowerCase();
}
