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
 * NOTA:
 * - Sigue siendo auth simple en cliente con sessionStorage.
 * - Las imágenes se siguen guardando en base64.
 */

import { useState, useEffect, useRef } from "react";
import ClientOnly from "@/components/layout/ClientOnly";
import useProductStore from "@/store/productStore";
import useSalesStore from "@/store/salesStore";
import Image from "next/image";
import { PRODUCT_PLACEHOLDER_IMAGE } from "@/lib/constants";
import type { Product } from "@/lib/types";

const ADMIN_PASS = "skateradmin"; // cámbiala en producción

// 👇 tallas que mostraremos como botones por defecto
const DEFAULT_SIZE_OPTIONS = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "ONE SIZE", // 👈 aquí la nueva
];

export default function AdminPage() {
  // store local
  const {
    products: localProducts,
    addProduct,
    updateProduct,
    removeProduct,
  } = useProductStore() as {
    products: any[];
    addProduct: (p: any) => void;
    updateProduct: (id: string, data: any) => void;
    removeProduct: (id: string) => void;
  };
  const getSoldQty = useSalesStore((s) => s.getSoldQty);

  // --- auth local ---
  const [authed, setAuthed] = useState(false);
  const [passInput, setPassInput] = useState("");

  // --- fuente de datos (API o local) ---
  const [source, setSource] = useState<"api" | "local">("local");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * --- formulario del producto ---
   * selectedSizes: array interno que vamos a ir marcando con los botones
   */
  const [form, setForm] = useState({
    id: "",
    name: "",
    price: "",
    imageData: "",
    desc: "",
    details: "",
    selectedSizes: ["S", "M", "L", "XL"],
    stock: "1",
    colorsText: "",
    sizeGuide: "",
  });

  // preview visual de la imagen principal
  const [preview, setPreview] = useState<string>("");

  // estado visual del drag&drop de la imagen principal
  const [isDragging, setIsDragging] = useState(false);

  // ref al <input type="file" /> escondido para la imagen principal
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /**
   * aquí guardamos las imágenes específicas de cada color
   * forma: [{ name: "Negro", image: "data:image/..." }]
   */
  const [colorImages, setColorImages] = useState<
    { name: string; image: string }[]
  >([]);

  // recordar sesión admin
  useEffect(() => {
    const ok = sessionStorage.getItem("skater-admin-ok");
    if (ok === "yes") setAuthed(true);
  }, []);

  // cuando se autentica → intentamos leer desde API
  useEffect(() => {
    if (!authed) return;

    let cancelled = false;

    async function loadProducts() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/products", { method: "GET" });
        if (!res.ok) throw new Error("API no disponible");
        const data = await res.json();
        const apiProducts = (data.products || []) as Product[];
        if (!cancelled) {
          setProducts(apiProducts);
          setSource("api");
        }
      } catch (err) {
        console.warn("[Admin] usando productos locales:", err);
        if (!cancelled) {
          setProducts(localProducts);
          setSource("local");
          setError("No se pudo leer desde la API, usando datos locales.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [authed, localProducts]);

  function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    if (passInput === ADMIN_PASS) {
      setAuthed(true);
      sessionStorage.setItem("skater-admin-ok", "yes");
    } else {
      alert("Clave incorrecta");
    }
  }

  // cambios de campos de texto/textarea del form
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

  /**
   * Tallas (botones)
   * - si se pulsa ONE SIZE → queda solo esa
   * - si ONE SIZE está activa y se pulsa otra → quitamos ONE SIZE y activamos la otra
   * - si se pulsa una activa → se desactiva
   */
  function toggleSize(size: string) {
    setForm((prev) => {
      const already = prev.selectedSizes.includes(size);

      // caso especial: ONE SIZE
      if (size === "ONE SIZE") {
        return {
          ...prev,
          selectedSizes: ["ONE SIZE"], // solo esa
        };
      }

      // si ya está activa esa talla normal → la quitamos
      if (already) {
        const next = prev.selectedSizes.filter((s) => s !== size);
        return {
          ...prev,
          selectedSizes: next,
        };
      }

      // si NO está activa y actualmente está ONE SIZE → la quitamos
      const withoutOneSize = prev.selectedSizes.filter(
        (s) => s !== "ONE SIZE"
      );

      return {
        ...prev,
        selectedSizes: [...withoutOneSize, size],
      };
    });
  }

  // guardar producto (API → fallback local) usando TU forma de producto
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.id || !form.name || !form.price) {
      alert("ID, nombre y precio son obligatorios");
      return;
    }

    const soldAlready = getSoldQty(form.id.trim());
    if (soldAlready > 0) {
      alert("Este producto ya tiene ventas y no puede ser modificado.");
      return;
    }

    // ✅ tallas vienen del selector de botones
    const sizes = form.selectedSizes;

    // colores -> array de nombres
    const colorNames = form.colorsText
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    // colores -> array de objetos {name, image}
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

    // producto final en TU shape
    const newProduct: any = {
      id: form.id.trim(),
      name: form.name.trim(),
      price: parseFloat(form.price),
      image: form.imageData || PRODUCT_PLACEHOLDER_IMAGE,
      desc: form.desc.trim(),
      details: form.details.trim(),
      sizes,
      stock: parseInt(form.stock || "0", 10),
      colors,
      sizeGuide: form.sizeGuide?.trim?.() ?? "",
    };

    // 1) intentar guardar en API
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        body: JSON.stringify(newProduct),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("API no disponible");

      setSaveMessage("Producto guardado en API ✅");
      setSource("api");

      // actualizamos listado en pantalla
      setProducts((prev) => {
        const exists = prev.find((p) => p.id === newProduct.id);
        if (exists) {
          return prev.map((p) => (p.id === newProduct.id ? newProduct : p));
        }
        return [...prev, newProduct];
      });

      // sincronizamos local también para que la tienda lo vea
      updateProduct(newProduct.id, newProduct);
    } catch (err) {
      console.warn("[Admin] API no disponible, guardando en local:", err);

      // 2) fallback: Zustand local
      addProduct(newProduct);
      updateProduct(newProduct.id, newProduct);
      setProducts((prev) => {
        const exists = prev.find((p) => p.id === newProduct.id);
        if (exists) {
          return prev.map((p) => (p.id === newProduct.id ? newProduct : p));
        }
        return [...prev, newProduct];
      });
      setSaveMessage("Producto guardado LOCALMENTE (API no disponible) ⚠️");
      setSource("local");
    }

    // reset Limpiar formulario para el siguiente producto
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

    setTimeout(() => setSaveMessage(null), 3000);
  }

  // cargar un producto en el form (para editar / clonar)
  function loadProductToForm(p: any, cloneAsNew = false) {
    const isTruncated =
      typeof p.image === "string" && p.image.includes("...truncated");

    setForm({
      id: cloneAsNew ? p.id + "-v2" : p.id,
      name: p.name ?? "",
      price: p.price ? String(p.price) : "",
      imageData: !isTruncated && p.image ? p.image : "",
      desc: p.desc ?? "",
      details: p.details ?? "",
      selectedSizes: Array.isArray(p.sizes) && p.sizes.length
        ? p.sizes
        : ["S", "M", "L", "XL"],
      stock: p.stock !== undefined ? String(p.stock) : "1",
      colorsText: p.colors?.length
        ? p.colors.map((c: any) => c.name).join(",")
        : "Negro,Blanco",
      sizeGuide: p.sizeGuide ?? "",
    });

    // reconstruir imágenes por color
    if (p.colors?.length) {
      setColorImages(
        p.colors.map((c: any) => ({
          name: c.name,
          image:
            c.image && !c.image.includes("...truncated") ? c.image : "",
        }))
      );
    } else {
      setColorImages([]);
    }

    setPreview(!isTruncated && p.image ? p.image : "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <ClientOnly>
      <div className="text-white max-w-3xl mx-auto py-10 space-y-10">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-display font-bold tracking-tight">
            Admin / SkaterStore
          </h1>
          {authed && (
            <p className="text-xs text-neutral-400">
              Fuente:{" "}
              <span
                className={
                  source === "api"
                    ? "text-green-400 font-semibold"
                    : "text-yellow-400 font-semibold"
                }
              >
                {source === "api" ? "API" : "Local (Zustand)"}
              </span>
              {error ? (
                <span className="ml-2 text-[10px] text-red-400">{error}</span>
              ) : null}
            </p>
          )}
        </div>

        {/* ------- LOGIN ADMIN ------- */}
        {!authed ? (
          <form
            onSubmit={handleAuth}
            className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 max-w-sm space-y-4"
          >
            <label className="block text-sm">
              <span className="text-neutral-300">Clave de administrador</span>
              <input
                type="password"
                className="mt-1 w-full rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2 text-white outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-sm"
                value={passInput}
                onChange={(e) => setPassInput(e.target.value)}
              />
            </label>

            <button
              type="submit"
              className="bg-yellow-400 text-black font-bold text-xs py-2 px-4 rounded-lg hover:bg-yellow-300 active:scale-95 transition uppercase tracking-wide w-full"
            >
              Entrar
            </button>
          </form>
        ) : (
          <>
            {/* ------- FORMULARIO ------- */}
            <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <h2 className="text-xl font-display font-bold mb-4">
                Crear / Actualizar producto
              </h2>

              <form
                onSubmit={handleSubmit}
                className="grid gap-4 md:grid-cols-2"
              >
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

                {/* Imagen principal */}
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

                {/* Descripción corta */}
                <TextareaField
                  label="Descripción corta"
                  name="desc"
                  value={form.desc}
                  onChange={handleChangeTextField}
                  placeholder="Hoodie oversize negro con logo bordado."
                />

                {/* Detalles largos */}
                <TextareaField
                  label="Detalles largos"
                  name="details"
                  value={form.details}
                  onChange={handleChangeTextField}
                  placeholder="Fit relajado, algodón pesado, 450gsm..."
                />

                {/* 🎯 Selector de tallas (con ONE SIZE) */}
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
                    Haz click para activar o desactivar tallas. Si seleccionas{" "}
                    <strong>ONE SIZE</strong>, se desactivarán todas las demás.
                  </p>
                </div>

                {/* 📏 guía de tallas */}
                <TextareaField
                  label="Guía / Medidas por talla (opcional)"
                  name="sizeGuide"
                  value={form.sizeGuide}
                  onChange={handleChangeTextField}
                  placeholder={`S: pecho 50cm, largo 70cm\nM: pecho 52cm, largo 72cm\nL: pecho 54cm, largo 74cm`}
                />

                {/* Colores */}
                <InputField
                  label="Colores (separados por coma)"
                  name="colorsText"
                  value={form.colorsText}
                  onChange={handleChangeTextField}
                  placeholder="Negro,Blanco,Rojo"
                  className="md:col-span-2"
                />

                {/* Subida por color */}
                {form.colorsText
                  .split(",")
                  .map((c) => c.trim())
                  .filter(Boolean)
                  .map((colorName) => (
                    <ColorUploadField
                      key={colorName}
                      colorName={colorName}
                      currentImage={
                        colorImages.find((c) => c.name === colorName)?.image ||
                        ""
                      }
                      onSelectFile={(file) =>
                        handleColorImageUpload(colorName, file)
                      }
                    />
                  ))}

                <div className="md:col-span-2 flex justify-end gap-3 items-center">
                  <button
                    type="submit"
                    className="bg-yellow-400 text-black font-bold text-xs py-3 px-5 rounded-lg hover:bg-yellow-300 active:scale-95 transition uppercase tracking-wide"
                    disabled={loading}
                  >
                    {loading ? "Guardando..." : "Guardar producto"}
                  </button>
                  {saveMessage && (
                    <p className="text-xs text-neutral-300">{saveMessage}</p>
                  )}
                </div>
              </form>
            </section>

            {/* ------- LISTA DE PRODUCTOS ------- */}
            <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <h2 className="text-xl font-display font-bold mb-4">
                Productos en memoria / API
              </h2>

              {products.length === 0 ? (
                <p className="text-neutral-500 text-sm">
                  {loading
                    ? "Cargando productos..."
                    : "No hay productos creados aún."}
                </p>
              ) : (
                <ul className="space-y-4">
                  {products.map((p) => {
                    const soldQty = getSoldQty(p.id);
                    const locked = soldQty > 0;

                    // detectar si imagen viene truncada por el store
                    const isTruncated =
                      typeof p.image === "string" &&
                      p.image.includes("...truncated");
                    const imageToShow =
                      !p.image || isTruncated
                        ? PRODUCT_PLACEHOLDER_IMAGE
                        : p.image;

                    return (
                      <li
                        key={p.id}
                        className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-neutral-800 pb-4 gap-3"
                      >
                        <div className="text-sm">
                          <p className="font-semibold text-white flex items-center gap-2 flex-wrap">
                            <span>{p.name}</span>
                            <span className="text-[10px] text-neutral-500">
                              ({p.id})
                            </span>
                            {locked && (
                              <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/40 rounded px-2 py-[2px] font-bold uppercase tracking-wide">
                                LOCKED
                              </span>
                            )}
                          </p>

                          <p className="text-yellow-400 font-bold">
                            €{Number(p.price ?? 0).toFixed(2)}
                          </p>

                          <p className="text-neutral-400 text-xs">
                            Stock:{" "}
                            {typeof p.stock === "number"
                              ? p.stock
                              : "sin definir"}
                          </p>

                          <p className="text-neutral-400 text-xs">
                            Tallas:{" "}
                            {Array.isArray(p.sizes) && p.sizes.length
                              ? p.sizes.join(", ")
                              : "—"}
                          </p>

                          {p.colors?.length ? (
                            <p className="text-neutral-400 text-xs">
                              Colores: {p.colors.map((c: any) => c.name).join(", ")}
                            </p>
                          ) : null}

                          {p.sizeGuide ? (
                            <p className="text-[11px] text-neutral-500 mt-2 whitespace-pre-line">
                              {p.sizeGuide}
                            </p>
                          ) : null}

                          <p className="text-neutral-500 text-[11px] leading-snug mt-1">
                            {p.desc}
                          </p>

                          <div className="mt-2">
                            <Image
                              src={imageToShow}
                              alt={p.name ?? "producto"}
                              width={80}
                              height={80}
                              className="w-20 h-20 object-cover rounded-lg border border-neutral-800 bg-neutral-950"
                            />
                            {isTruncated && (
                              <p className="text-[10px] text-yellow-400 mt-1">
                                imagen recortada en local
                              </p>
                            )}
                          </div>

                          <p className="text-[10px] text-neutral-500 mt-2">
                            Vendido: {soldQty} unidad
                            {soldQty === 1 ? "" : "es"}
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => {
                              if (locked) {
                                alert(
                                  "No puedes borrar un producto que ya tiene ventas."
                                );
                                return;
                              }
                              // borrado SOLO local en esta fase
                              removeProduct(p.id);
                              setProducts((prev) =>
                                prev.filter((x) => x.id !== p.id)
                              );
                            }}
                            className="self-start md:self-auto bg-red-500/20 text-red-400 border border-red-500/40 rounded-lg text-[11px] font-semibold py-2 px-3 hover:bg-red-500/30 hover:text-red-300 transition"
                          >
                            Borrar
                          </button>

                          {/* editar */}
                          {!locked && (
                            <button
                              onClick={() => loadProductToForm(p, false)}
                              className="self-start md:self-auto bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-lg text-[11px] font-semibold py-2 px-3 hover:border-yellow-400 hover:text-yellow-400 transition"
                            >
                              Editar
                            </button>
                          )}

                          {/* clonar */}
                          {locked && (
                            <button
                              onClick={() => loadProductToForm(p, true)}
                              className="self-start md:self-auto bg-yellow-400 text-black rounded-lg text-[11px] font-bold py-2 px-3 hover:bg-yellow-300 active:scale-95 transition"
                            >
                              Clonar como nuevo
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </ClientOnly>
  );
}

/* -----------------------------
 * InputField
 * ----------------------------- */
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

/* -----------------------------
 * TextareaField
 * ----------------------------- */
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

/* -----------------------------
 * ImageDropField
 * ----------------------------- */
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview producto"
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

/* -----------------------------
 * ColorUploadField
 * ----------------------------- */
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
          /* eslint-disable-next-line @next/next/no-img-element */
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
