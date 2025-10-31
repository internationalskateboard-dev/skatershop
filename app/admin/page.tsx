"use client";

/**
 * AdminPage
 * ------------------------------------------------------------
 * Panel interno para crear/actualizar productos de SkaterShop.
 *
 * ✅ Mantiene TUS mejoras:
 * - Stock inicial
 * - Bloqueo por ventas (si hubo ventas → no borrar / no editar)
 * - Clonar producto bloqueado
 * - 📦 Colores + imagen por color
 * - 📏 Guía de tallas / medidas
 * - 🎯 Selector de tallas por botones (incluye ONE SIZE)
 * - 🎣 Drag & drop de imagen principal
 *
 * ✅ Añade las mías:
 * - Intenta leer productos desde /api/products (fuente API)
 * - Si la API falla → usa productos locales del store (Zustand)
 * - Al guardar, intenta POST /api/products
 * - Si la API falla → guarda igual en el store local
 * - Muestra “Fuente: API / Local (Zustand)”
 *
 * ✅ Nuevo:
 * - Sección “Últimas ventas” que lee /api/sales
 */

import { useState } from "react";
import ClientOnly from "@/components/layout/ClientOnly";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminProductForm from "@/components/admin/AdminProductForm";
import AdminProductList from "@/components/admin/AdminProductList";
import SalesExportPanel from "@/components/admin/SalesExportPanel";
import AdminSalesList from "@/components/admin/AdminSalesList";

type AdminTab = "products" | "sales" | "settings";

export default function AdminPage() {
  // qué sección está activa
  const [activeTab, setActiveTab] = useState<AdminTab>("products");
  // producto que viene de la lista para editar / clonar
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  return (
    <ClientOnly>
      <AdminGuard>
        <div className="text-white max-w-5xl mx-auto py-10 space-y-8">
          {/* HEADER */}
          <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold tracking-tight">
                Admin / SkaterStore
              </h1>
              <p className="text-sm text-neutral-500 mt-1">
                Panel local (Zustand) con fallback de API
              </p>
            </div>

            {/* MENÚ / TABS */}
            <nav className="flex gap-2 bg-neutral-900 border border-neutral-800 rounded-xl p-1">
              <TabButton
                active={activeTab === "products"}
                onClick={() => {
                  setActiveTab("products");
                  // al cambiar de pestaña, no queremos dejar un producto “enganchado”
                  setEditingProduct(null);
                }}
              >
                Productos
              </TabButton>
              <TabButton
                active={activeTab === "sales"}
                onClick={() => {
                  setActiveTab("sales");
                  setEditingProduct(null);
                }}
              >
                Ventas
              </TabButton>
              <TabButton
                active={activeTab === "settings"}
                onClick={() => {
                  setActiveTab("settings");
                  setEditingProduct(null);
                }}
              >
                Ajustes
              </TabButton>
            </nav>
          </header>

          {/* CONTENIDO SEGÚN TAB */}
          {activeTab === "products" ? (
            <div className="space-y-8">
              <AdminProductForm
                initialData={editingProduct}
                onSaved={() => setEditingProduct(null)}
              />
              <AdminProductList
                onEdit={(p) => {
                  setEditingProduct(p);
                  // nos aseguramos de estar en la pestaña de productos
                  setActiveTab("products");
                  // subimos al top
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                onClone={(p) => {
                  setEditingProduct({
                    ...p,
                    id: p.id + "-v2",
                  });
                  setActiveTab("products");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </div>
          ) : null}

          {activeTab === "sales" ? (
            <div className="space-y-6">
              <SalesExportPanel />
              <AdminSalesList />
            </div>
          ) : null}

          {activeTab === "settings" ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <h2 className="text-xl font-display font-bold mb-3">
                Ajustes (placeholder)
              </h2>
              <p className="text-sm text-neutral-400">
                Aquí podemos poner más adelante:
              </p>
              <ul className="mt-2 text-sm text-neutral-300 list-disc list-inside space-y-1">
                <li>Configurar endpoint remoto de productos</li>
                <li>Subida de imágenes a S3 / Cloudinary</li>
                <li>Credenciales de PayPal en producción</li>
                <li>Roles de admin</li>
              </ul>
            </div>
          ) : null}
        </div>
      </AdminGuard>
    </ClientOnly>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
        active
          ? "bg-yellow-400 text-black shadow-sm"
          : "text-neutral-300 hover:text-yellow-400"
      }`}
    >
      {children}
    </button>
  );
}
