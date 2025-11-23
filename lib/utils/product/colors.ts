
/**  
 🔹helper para convertir el nombre del color en algo que entienda CSS
*/
export function cssColorFromName(name: string) {
  return name.toLowerCase().replace(/\s+/g, "");
}
