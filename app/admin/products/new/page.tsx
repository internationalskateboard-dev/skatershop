// app/admin/products/new/page.tsx
"use client";

import ProductWizard from "@/components/admin/products/wizard/ProductWizard";

export default function AdminNewProductPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Crear producto</h2>
      <ProductWizard />
    </div>
  );
}
