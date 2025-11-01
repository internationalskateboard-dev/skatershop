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
- Mostrar todo esto dentro de un **dashboard con sidebar y header**.

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
```

---

### **📁 `/lib/server/salesMemory.ts`**

```ts
export const salesMemory: SaleRecord[] = [];

export function addSaleToMemory(
  sale: Omit<SaleRecord, "id" | "createdAt">
): SaleRecord {
  const full: SaleRecord = {
    id: "mem-" + Date.now().toString(),
    createdAt: new Date().toISOString(),
    ...sale,
  };
  salesMemory.push(full);
  return full;
}

export function removeSaleFromMemory(id: string): boolean {
  const idx = salesMemory.findIndex((s) => s.id === id);
  if (idx === -1) return false;
  salesMemory.splice(idx, 1);
  return true;
}
```

---

### **📁 `/app/api/products/[id]/route.ts`**
- Añadidos `GET` y `DELETE` para productos en memoria.

### **📁 `/app/api/sales/[id]/route.ts`**
- Añadidos `GET` y `DELETE` para ventas.

---

## 🧰 Componentes del panel de administración

| Componente | Rol | Estado |
|-------------|------|--------|
| `AdminProductForm.tsx` | Crear / editar / clonar productos | ✅ |
| `AdminProductList.tsx` | Mostrar / borrar productos (API + local) | ✅ |
| `AdminSalesList.tsx` | Listado de ventas, export CSV, borrar ventas de prueba | ✅ |
| `AdminDashboardLayout.tsx` | Layout con login, sidebar y header | ✅ |
| `AdminSidebar.tsx` | Menú lateral del dashboard | ✅ |
| `AdminHeader.tsx` | Cabecera con indicador de fuente | ✅ |
| `AdminDataSourceContext.tsx` | Contexto compartido de fuente (API/Local) | ✅ |

---

## 🧩 Tipos globales

```ts
export interface Product {
  id: string;
  name: string;
  price: number;
  desc?: string;
  details?: string;
  image?: string;
  sizes?: string[];
  colors?: { name: string; image?: string }[];
  stock?: number;
  sizeGuide?: string;
}

export interface SaleRecord {
  id: string;
  createdAt: string;
  items: { productId: string; qty: number; size?: string }[];
  total: number;
  customer?: { fullName?: string; email?: string };
}
```

---

## 🧱 Constantes

```ts
// lib/constants.ts
export const PRODUCT_PLACEHOLDER_IMAGE = "/images/placeholder.png";
```

---

## 🧭 Rutas de administración (nueva estructura)

```text
app/
├── admin/
│   ├── layout.tsx           ← usa AdminDashboardLayout
│   ├── page.tsx             ← redirige a /admin/products
│   ├── products/
│   │   └── page.tsx         ← formulario + lista
│   ├── sales/
│   │   └── page.tsx         ← listado + borrar + CSV
│   └── settings/
│       └── page.tsx         ← placeholder para ajustes
```

- `/admin` → login → dashboard  
- `/admin/products` → `AdminProductForm` + `AdminProductList`  
- `/admin/sales` → `AdminSalesList`  
- `/admin/settings` → configuración futura

---

## 🧱 Dashboard de administración (v1)

Se creó un **dashboard real** para el admin:

1. **Layout común**: `components/admin/AdminDashboardLayout.tsx`
   - Maneja el login simple (`skateradmin`)
   - Guarda sesión en `sessionStorage`
   - Envuelve a todo en el **provider de fuente** (`AdminDataSourceProvider`)

2. **Sidebar**: `components/admin/AdminSidebar.tsx`
   - Enlaces a:
     - `/admin/products`
     - `/admin/sales`
     - `/admin/settings`
   - Botón “Cerrar sesión”

3. **Header**: `components/admin/AdminHeader.tsx`
   - Muestra:
     - “Panel de administración”
     - **Fuente actual: `API` o `Local (Zustand)`**
     - Último error si el fetch a la API falló

4. **Contexto de datos**: `components/admin/AdminDataSourceContext.tsx`
   - Expone:
     - `source: "api" | "local"`
     - `setSource(...)`
     - `lastError`
     - `setLastError(...)`
   - Lo usan:
     - `AdminProductList.tsx` → si API ok → `setSource("api")`, si no → `setSource("local")`
     - `AdminSalesList.tsx` → igual
   - El header solo **lee**, no decide.

5. **Páginas**
   - `/admin/products` → formulario + lista
   - `/admin/sales` → listado de ventas + CSV
   - `/admin/settings` → ajustes del panel

---

## 🧭 Próximos pasos

1. **Refinar settings**
   - Llevar la clave de admin a un solo sitio  
   - Añadir opción: “forzar local” / “forzar api”

2. **Filtros de ventas**
   - Filtrar por fecha o producto (frontend)  
   - Exportar CSV ya filtrado

3. **Separar las APIs en `/app/api/v1/*`**
   - Para luego migrar a backend real (Node / Supabase / Firestore)

4. **Documentar en README**
   - Diferencia entre “modo tienda” y “modo admin”.

---

### ✅ Estado actual

| Área | Estado | Detalle |
|------|---------|----------|
| Admin básico | ✅ | Login + layout + sidebar |
| Productos | ✅ | CRUD híbrido (API + Zustand) |
| Ventas | ✅ | Lectura + borrado + fallback |
| Indicador de fuente | ✅ | Contexto + header |
| Export CSV | ✅ | Desde admin de ventas |
| Dashboard modular | ✅ | 3 secciones creadas |
| Backend real | 🕓 | siguiente fase |

---

📍 **Punto para retomar mañana:**
> “Continuar desde *Dashboard v1 con indicador de fuente (API / Local)*.  
> Siguiente paso: configuración avanzada (`/admin/settings`) + export CSV filtrado.”

---

**Fin del archivo.**
