# 🛠️ SKATERSHOP — Registro de Cambios (Admin & API)

> **Sesión:** 2025-11-01  
> **Autor:** Dev / ChatGPT  
> **Descripción:** Avance integral en panel de administración, backend en memoria y estructura modular de componentes.

---

## 🚀 Resumen General

Se implementó un **backend interno en memoria** usando rutas API de Next.js, junto con la **refactorización del panel de administración** para trabajar de forma híbrida (API ↔ Zustand).

Ahora el admin puede:
- Crear, editar y borrar productos.
- Crear y borrar ventas de prueba.
- Exportar CSV de ventas.
- Trabajar sin conexión al backend real.
- Mostrar de qué fuente provienen los datos (`API` o `Local`).

---

## 🧩 Estructura General

### **Nuevas rutas API**

| Endpoint | Método | Descripción |
|-----------|---------|-------------|
| `/api/products` | `GET` | Lista productos combinando base + memoria |
| `/api/products` | `POST` | Crea o actualiza producto en memoria |
| `/api/products/:id` | `DELETE` | Borra producto de memoria |
| `/api/products/:id` | `GET` | Devuelve producto por ID |
| `/api/sales` | `GET` | Lista ventas registradas en memoria |
| `/api/sales` | `POST` | Añade una nueva venta |
| `/api/sales/:id` | `DELETE` | Borra venta de prueba |
| `/api/sales/:id` | `GET` | Devuelve venta puntual |

---

## 🧱 Archivos clave añadidos o actualizados

### **📁 `/lib/server/productsMemory.ts`**

```ts
export const productsMemory: Product[] = [];

export function upsertProductInMemory(p: Product): Product {
  const idx = productsMemory.findIndex((x) => x.id === p.id);
  if (idx >= 0) {
    productsMemory[idx] = { ...productsMemory[idx], ...p };
    return productsMemory[idx];
  }
  productsMemory.push(p);
  return p;
}

export function removeProductFromMemory(id: string): boolean {
  const idx = productsMemory.findIndex((x) => x.id === id);
  if (idx === -1) return false;
  productsMemory.splice(idx, 1);
  return true;
}
