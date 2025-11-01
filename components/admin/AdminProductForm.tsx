"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import useProductStore from "@/store/productStore";
import useSalesStore from "@/store/salesStore";
import { PRODUCT_PLACEHOLDER_IMAGE } from "@/lib/constants";
import type { Product } from "@/lib/admin/types";
import { useAdminDataSource } from "@/components/admin/AdminDataSourceContext";

const DEFAULT_SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "ONE SIZE"];

type ColorImage = {
  name: string;
  image: string;
};

type AdminProductFormProps = {
  initialData?: Product | null;
  onSaved?: () => void;
};

export default function AdminProductForm({
  initialData,
  onSaved,
}: AdminProductFormProps) {
  const {
    products: localProducts,
    addProduct,
    updateProduct,
  } = useProductStore();
  const getSoldQty = useSalesStore((s) => s.getSoldQty);

  // del contexto: para saber si el admin está forzando local/API
  const { mode, source } = useAdminDataSource();

  const [form, setForm] = useState({
    id: "",
    name: "",
    price: "",
    imageData: "",
    desc: "",
    details: "",
    selectedSizes: ["S", "M", "L", "XL"] as string[],
    stock: "1",
    colorsText: "Negro,Blanco",
    sizeGuide: "",
  });

  const [preview, setPreview] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [colorImages, setColorImages] = useState<ColorImage[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // cargar datos cuando venimos de “editar” o “clonar”
  useEffect(() => {
    if (!initialData) return;

    const isTruncated =
      typeof initialData.image === "string" &&
      initialData.image.includes("...truncated");

    setForm({
      id: initialData.id ?? "",
      name: initialData.name ?? "",
      price:
        typeof initialData.price === "number"
          ? String(initialData.price)
          : (initialData.price as unknown as string) ?? "",
      imageData: !isTruncated && initialData.image ? initialData.image : "",
      desc: initialData.desc ?? "",
      details: initialData.details ?? "",
      selectedSizes:
        Array.isArray(initialData.sizes) && initialData.sizes.length
          ? initialData.sizes
          : ["S", "M", "L", "XL"],
      stock:
        typeof initialData.stock === "number"
          ? String(initialData.stock)
          : initialData.stock
          ? String(initialData.stock)
          : "1",
      colorsText: initialData.colors?.length
        ? initialData.colors.map((c) => c.name).join(",")
        : "Negro,Blanco",
      sizeGuide: initialData.sizeGuide ?? "",
    });

    if (initialData.colors?.length) {
      setColorImages(
        initialData.colors.map((c) => ({
          name: c.name,
          image:
            c.image && !c.image.includes("...truncated") ? c.image : "",
        }))
      );
    } else {
      setColorImages([]);
    }

    setPreview(!isTruncated && initialData.image ? initialData.image : "");
  }, [initialData]);

  function handleChangeTextField(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // imagen principal
  function handleFileSelected(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setForm((prev) => ({ ...prev, imageData: result }));
      setPreview(result);
    };
    reader.readAsDataURL(file);
  }

  function onFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileSelected(file);
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function onDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelected(file);
  }

  // imagen para un color concreto
  function handleColorImageUpload(colorName: string, file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setColorImages((prev) => {
        const exists = prev.find((c) => c.name === colorName);
        if (exists) {
          return prev.map((c) =>
            c.name === colorName ? { ...c, image: result } : c
          );
        }
        return [...prev, { name: colorName, image: result }];
      });
    };
    reader.readAsDataURL(file);
  }

  // tallas
  function toggleSize(size: string) {
    setForm((prev) => {
      const already = prev.selectedSizes.includes(size);
      if (size === "ONE SIZE") {
        return { ...prev, selectedSizes: ["ONE SIZE"] };
      }
      if (already) {
        return {
          ...prev,
          selectedSizes: prev.selectedSizes.filter((s) => s !== size),
        };
      }
      const withoutOneSize = prev.selectedSizes.filter(
        (s) => s !== "ONE SIZE"
      );
      return {
        ...prev,
        selectedSizes: [...withoutOneSize, size],
      };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.id || !form.name || !form.price) {
      alert("ID, nombre y precio son obligatorios");
      return;
    }

    // si ya tiene ventas, no lo dejo editar
    const soldAlready = getSoldQty(form.id.trim());
    if (soldAlready > 0) {
      alert("Este producto ya tiene ventas y no puede ser modificado.");
      return;
    }

    const colorNames = form.colorsText
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    const colors =
      colorNames.length > 0
        ? colorNames.map((name) => {
            const found = colorImages.find((c) => c.name === name);
            return {
              name,
              image: found ? found.image : "",
            };
          })
        : [];

    const newProduct: Product = {
      id: form.id.trim(),
      name: form.name.trim(),
      price: parseFloat(form.price),
      image: form.imageData || PRODUCT_PLACEHOLDER_IMAGE,
      desc: form.desc.trim(),
      details: form.details.trim(),
      sizes: form.selectedSizes,
      stock: parseInt(form.stock || "0", 10),
      colors,
      sizeGuide: form.sizeGuide.trim(),
    };

    setSaving(true);
    setSaveMessage(null);

    const shouldCallApi = mode !== "force" || (mode === "force" && source === "api");

    try {
      if (shouldCallApi) {
        const res = await fetch("/api/products", {
          method: "POST",
          body: JSON.stringify(newProduct),
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("API no disponible");
        // si la API guardó, sincronizamos el store
        updateProduct(newProduct.id, newProduct);
        setSaveMessage("Producto guardado en API ✅");
      } else {
        // modo forzado: solo local
        const exists = localProducts.find((p: any) => p.id === newProduct.id);
        if (exists) {
          updateProduct(newProduct.id, newProduct);
        } else {
          addProduct(newProduct);
        }
        setSaveMessage("Producto guardado LOCALMENTE (modo forzado) ⚠️");
      }
    } catch (err) {
      // fallback local
      const exists = localProducts.find((p: any) => p.id === newProduct.id);
      if (exists) {
        updateProduct(newProduct.id, newProduct);
      } else {
        addProduct(newProduct);
      }
      setSaveMessage("Producto guardado LOCALMENTE ⚠️");
    } finally {
      setSaving(false);
      onSaved?.();
      // reset
      setForm({
        id: "",
        name: "",
        price: "",
        imageData: "",
        desc: "",
        details: "",
        selectedSizes: ["S", "M", "L", "XL"],
        stock: "1",
        colorsText: "Negro,Blanco",
        sizeGuide: "",
      });
      setPreview("");
      setColorImages([]);
      setTimeout(() => setSaveMessage(null), 3500);
    }
  }

  return (
    <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
      <h2 className="text-xl font-display font-bold mb-4">
        {initialData ? "Editar producto" : "Crear / Actualizar producto"}
      </h2>

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <InputField
          label="ID (slug único, ej: hoodie-black)"
          name="id"
          value={form.id}
          onChange={handleChangeTextField}
          placeholder="hoodie-black"
        />

        <InputField
          label="Nombre"
          name="name"
          value={form.name}
          onChange={handleChangeTextField}
          placeholder="Hoodie Black"
        />

        <InputField
          label="Precio (€)"
          name="price"
          value={form.price}
          onChange={handleChangeTextField}
          type="number"
          placeholder="17.99"
        />

        <InputField
          label="Stock disponible"
          name="stock"
          value={form.stock}
          onChange={handleChangeTextField}
          type="number"
          placeholder="10"
        />

        <ImageDropField
          label="Imagen del producto"
          hint="Arrastra una imagen aquí o haz click para seleccionar"
          preview={preview || form.imageData}
          isDragging={isDragging}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onPickFile={() => fileInputRef.current?.click()}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileInputChange}
        />

        <TextareaField
          label="Descripción corta"
          name="desc"
          value={form.desc}
          onChange={handleChangeTextField}
          placeholder="Hoodie oversize negro con logo bordado."
        />

        <TextareaField
          label="Detalles largos"
          name="details"
          value={form.details}
          onChange={handleChangeTextField}
          placeholder="Fit relajado, algodón pesado, 450gsm..."
        />

        <div className="md:col-span-2">
          <span className="text-neutral-300 text-sm block mb-2">
            Tallas disponibles
          </span>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_SIZE_OPTIONS.map((size) => {
              const active = form.selectedSizes.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`px-3 py-1 rounded-lg text-sm font-semibold border transition ${
                    active
                      ? "bg-yellow-400 text-black border-yellow-400"
                      : "border-neutral-700 text-neutral-300 hover:border-yellow-400 hover:text-yellow-400"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-neutral-500 mt-2">
            Si seleccionas <strong>ONE SIZE</strong>, se desactivarán todas las
            demás.
          </p>
        </div>

        <TextareaField
          label="Guía / Medidas por talla (opcional)"
          name="sizeGuide"
          value={form.sizeGuide}
          onChange={handleChangeTextField}
          placeholder={`S: pecho 50cm, largo 70cm\nM: pecho 52cm, largo 72cm\nL: pecho 54cm, largo 74cm`}
        />

        <InputField
          label="Colores (separados por coma)"
          name="colorsText"
          value={form.colorsText}
          onChange={handleChangeTextField}
          placeholder="Negro,Blanco,Rojo"
          className="md:col-span-2"
        />

        {form.colorsText
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean)
          .map((colorName) => (
            <ColorUploadField
              key={colorName}
              colorName={colorName}
              currentImage={
                colorImages.find((c) => c.name === colorName)?.image || ""
              }
              onSelectFile={(file: File) =>
                handleColorImageUpload(colorName, file)
              }
            />
          ))}

        <div className="md:col-span-2 flex justify-end gap-3 items-center">
          <button
            type="submit"
            className="bg-yellow-400 text-black font-bold text-xs py-3 px-5 rounded-lg hover:bg-yellow-300 active:scale-95 transition uppercase tracking-wide"
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar producto"}
          </button>
          {saveMessage && (
            <p className="text-xs text-neutral-300">{saveMessage}</p>
          )}
        </div>
      </form>
    </section>
  );
}

/* helpers UI */
function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required = true,
  className = "",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="text-neutral-300">{label}</span>
      <input
        required={required}
        type={type}
        className="mt-1 w-full rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2 text-white outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-sm"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </label>
  );
}

function TextareaField({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm md:col-span-2">
      <span className="text-neutral-300">{label}</span>
      <textarea
        required={required}
        className="mt-1 w-full rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2 text-white outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-sm min-h-[70px] whitespace-pre-line"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </label>
  );
}

function ImageDropField({
  label,
  hint,
  preview,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onPickFile,
}: {
  label: string;
  hint: string;
  preview: string;
  isDragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onPickFile: () => void;
}) {
  return (
    <div className="md:col-span-2 text-sm">
      <span className="text-neutral-300">{label}</span>
      <div
        onClick={onPickFile}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={[
          "mt-1 w-full rounded-lg border-2 border-dashed px-4 py-6 text-center cursor-pointer transition text-neutral-400 bg-neutral-900",
          isDragging
            ? "border-yellow-400 text-yellow-400"
            : "border-neutral-700 hover:border-yellow-400 hover:text-yellow-400",
        ].join(" ")}
      >
        {preview ? (
          <div className="flex flex-col items-center gap-3">
            <Image
              src={preview}
              alt="Preview producto"
              width={96}
              height={96}
              className="w-24 h-24 object-cover rounded-lg border border-neutral-800 bg-neutral-950"
            />
            <p className="text-[11px] text-neutral-400">
              Imagen cargada. Haz click para reemplazar.
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide">
              {hint}
            </p>
            <p className="text-[11px] text-neutral-500 mt-2">
              .jpg .png .webp — se guarda localmente
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function ColorUploadField({
  colorName,
  currentImage,
  onSelectFile,
}: {
  colorName: string;
  currentImage: string;
  onSelectFile: (file: File) => void;
}) {
  return (
    <div className="md:col-span-2 border border-neutral-800 rounded-lg p-3 flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-semibold text-white">{colorName}</p>
        <p className="text-[11px] text-neutral-500">
          Imagen específica para este color
        </p>
      </div>
      <div className="flex items-center gap-2">
        {currentImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentImage}
            alt={colorName}
            className="w-10 h-10 rounded-md border border-neutral-700 object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-md border border-dashed border-neutral-700 flex items-center justify-center text-[10px] text-neutral-500">
            -
          </div>
        )}

        <label className="text-xs bg-neutral-800 px-3 py-1 rounded-md border border-neutral-700 cursor-pointer hover:border-yellow-400 hover:text-yellow-400 transition">
          Cambiar
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onSelectFile(f);
            }}
          />
        </label>
      </div>
    </div>
  );
}
