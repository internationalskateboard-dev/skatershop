// lib/utils/colors.ts
// esta ruta no se usa pero se puede probar a ver como funciona
export function cssColorFromName(name?: string): string {
  if (!name) return "#666";

  const key = name.toLowerCase().trim().replace(/\s+/g, "-");

  const map: Record<string, string> = {
    black: "#000000",
    white: "#ffffff",
    red: "#ff0000",
    blue: "#0000ff",
    green: "#00ff00",
    yellow: "#facc15",
    gray: "#808080",
    grey: "#808080",
    "light-gray": "#d1d5db",
    "dark-gray": "#4b5563",
  };

  return map[key] ?? "#333";
}
