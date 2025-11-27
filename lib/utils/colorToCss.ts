// lib/utils/colorToCss.ts
export function colorToCss(name: string): string {
  const key = name.trim().toLowerCase();

  switch (key) {
    case "black":
    case "negro":
      return "#000000";
    case "white":
    case "blanco":
      return "#ffffff";
    case "red":
    case "rojo":
      return "#ff3333";
    case "blue":
    case "azul":
      return "#4361ee";
    case "green":
    case "verde":
      return "#00c853";
    case "light-gray":
      return "#d1d5db";
    case "dark-gray": 
      return "#4b5563";

    default:
      // fallback neutro si no conocemos el color
      return "#00000000";
  }
}
