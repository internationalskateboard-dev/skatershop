"use client";

import { useEffect, useState } from "react";
import AdminProductForm from "./AdminProductForm";

export default function AdminProductFormWrapper({
  productToEdit,
  onClear,
}: {
  productToEdit: any | null;
  onClear: () => void;
}) {
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (productToEdit) {
      setKey((k) => k + 1);
    }
  }, [productToEdit]);

  return (
    <AdminProductForm
      key={key}
      initialData={productToEdit ?? undefined}
      onSaved={onClear}
    />
  );
}
