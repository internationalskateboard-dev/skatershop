/**
AdminPage
- Panel interno para crear/actualizar productos.
- Maneja stock inicial.
- Bloquea edición/borrado si ya hubo ventas (LOCKED).
- Permite clonar producto bloqueado agregando sufijo -v2.
- Autenticación simple por contraseña guardada en sessionStorage.
- Sube imagen arrastrando o seleccionando archivo local y la asocia al producto.
- La imagen se guarda como base64 en el propio objeto del producto.
*/

"use client";

import { useState, useEffect, useRef } from "react";
import ClientOnly from "@/components/layout/ClientOnly";
import useProductStore from "@/store/productStore";
import useSalesStore from "@/store/salesStore";
import Image from "next/image"; //

const ADMIN_PASS = "skateradmin"; // cámbiala en producción

export default function AdminPage() {
  const { products, addProduct, removeProduct } = useProductStore();
  const getSoldQty = useSalesStore((s) => s.getSoldQty);

  // --- auth local ---
  const [authed, setAuthed] = useState(false);
  const [passInput, setPassInput] = useState("");

  // --- formulario del producto nuevo/edición temporal ---
  // imageData: base64 de la imagen subida o "" si no hay.
  const [form, setForm] = useState({
    id: "",
    name: "",
    price: "",
    imageData: "",
    desc: "",
    details: "",
    sizes: "S,M,L,XL",
    stock: "0", // string porque viene de input
  });

  // preview visual en el panel mientras creas/editas
  const [preview, setPreview] = useState<string>("");

  // estado visual del drag&drop
  const [isDragging, setIsDragging] = useState(false);

  // ref al <input type="file" /> escondido
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // recordar sesión admin
  useEffect(() => {
    const ok = sessionStorage.getItem("skater-admin-ok");
    if (ok === "yes") setAuthed(true);
  }, []);

  function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    if (passInput === ADMIN_PASS) {
      setAuthed(true);
      sessionStorage.setItem("skater-admin-ok", "yes");
    } else {
      alert("Clave incorrecta");
    }
  }

  // cambios de campos de texto/textarea
  function handleChangeTextField(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // cuando el admin selecciona/arrastra una imagen
  function handleFileSelected(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // guardamos el base64 en el form
      setForm((prev) => ({ ...prev, imageData: result }));
      // mostramos preview
      setPreview(result);
    };
    reader.readAsDataURL(file);
  }

  // click -> abre file picker
  function onFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelected(file);
    }
  }

  // drag&drop handlers
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
    if (file) {
      handleFileSelected(file);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validaciones mínimas
    if (!form.id || !form.name || !form.price) {
      alert("ID, nombre y precio son obligatorios");
      return;
    }

    // Protección: no editar producto que ya vendió
    const soldAlready = getSoldQty(form.id.trim());
    if (soldAlready > 0) {
      alert("Este producto ya tiene ventas y no puede ser modificado.");
      return;
    }

    // Creamos la estructura final del producto que va al store
    const newProduct = {
      id: form.id.trim(),
      name: form.name.trim(),
      price: parseFloat(form.price),
      /**
       * image:
       * Guardamos el base64 que el admin subió en `imageData`.
       * Si no subió imagen, usamos un fallback.
       *
       * Más adelante, cuando tengamos backend/CDN, este campo
       * pasará a ser una URL remota. Toda la UI seguirá funcionando,
       * no se rompe nada en móvil.
       */
      image: form.imageData || "/images/hoodie-black.jpg",
      desc: form.desc.trim(),
      details: form.details.trim(),
      sizes: form.sizes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      stock: parseInt(form.stock || "0", 10), // guardamos stock como número
    };

    // Guardar producto en store (Zustand persistido en localStorage)
    addProduct(newProduct);

    // Limpiar formulario para el siguiente producto
    setForm({
      id: "",
      name: "",
      price: "",
      imageData: "",
      desc: "",
      details: "",
      sizes: "S,M,L,XL",
      stock: "0",
    });
    setPreview("");
  }

  return (
    <ClientOnly>
      <div className="text-white max-w-3xl mx-auto py-10 space-y-10">
        <h1 className="text-3xl font-display font-bold tracking-tight">
          Admin / SkaterStore
        </h1>

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
            {/* ------- FORMULARIO PRODUCTO NUEVO / EDITAR ------- */}
            <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <h2 className="text-xl font-display font-bold mb-4">
                Crear / Actualizar producto
              </h2>

              <form
                onSubmit={handleSubmit}
                className="grid gap-4 md:grid-cols-2"
              >
                {/* ID */}
                <InputField
                  label="ID (slug único, ej: hoodie-black)"
                  name="id"
                  value={form.id}
                  onChange={handleChangeTextField}
                  placeholder="hoodie-black"
                />

                {/* Nombre */}
                <InputField
                  label="Nombre"
                  name="name"
                  value={form.name}
                  onChange={handleChangeTextField}
                  placeholder="Hoodie Black"
                />

                {/* Precio */}
                <InputField
                  label="Precio (€)"
                  name="price"
                  value={form.price}
                  onChange={handleChangeTextField}
                  type="number"
                  placeholder="59.99"
                />

                {/* Stock */}
                <InputField
                  label="Stock disponible"
                  name="stock"
                  value={form.stock}
                  onChange={handleChangeTextField}
                  type="number"
                  placeholder="10"
                />

                {/* SUBIDA / PREVIEW DE IMAGEN */}
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

                {/* input de archivos oculto: lo disparamos con onPickFile() */}
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
                  placeholder="Fit relajado, algodón pesado, 450gsm, puños reforzados..."
                />

                {/* Tallas */}
                <InputField
                  label="Tallas (separadas por coma)"
                  name="sizes"
                  value={form.sizes}
                  onChange={handleChangeTextField}
                  placeholder="S,M,L,XL"
                />

                {/* Submit */}
                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    className="bg-yellow-400 text-black font-bold text-xs py-3 px-5 rounded-lg hover:bg-yellow-300 active:scale-95 transition uppercase tracking-wide"
                  >
                    Guardar producto
                  </button>
                </div>
              </form>
            </section>

            {/* ------- LISTA DE PRODUCTOS EXISTENTES ------- */}
            <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <h2 className="text-xl font-display font-bold mb-4">
                Productos en memoria
              </h2>

              {products.length === 0 ? (
                <p className="text-neutral-500 text-sm">
                  No hay productos creados aún.
                </p>
              ) : (
                <ul className="space-y-4">
                  {products.map((p) => {
                    const soldQty = getSoldQty(p.id);
                    const locked = soldQty > 0;

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
                            €{p.price.toFixed(2)}
                          </p>

                          <p className="text-neutral-400 text-xs">
                            Stock: {p.stock} unidad
                            {p.stock === 1 ? "" : "es"}
                          </p>

                          <p className="text-neutral-400 text-xs">
                            Tallas: {p.sizes.join(", ")}
                          </p>

                          <p className="text-neutral-500 text-[11px] leading-snug mt-1">
                            {p.desc}
                          </p>

                          {/* Preview mini de la imagen guardada */}
<div className="mt-2">
  {p.image ? (
    <Image
      src={typeof p.image === "string" ? p.image : "/images/placeholder.png"}
      alt={p.name ?? "producto"}
      width={80}
      height={80}
      className="w-20 h-20 object-cover rounded-lg border border-neutral-800 bg-neutral-950"
    />
  ) : (
    <div className="w-20 h-20 flex items-center justify-center text-[10px] text-neutral-600 rounded-lg border border-neutral-800 bg-neutral-950">
      sin imagen
    </div>
  )}
</div>

                          <p className="text-[10px] text-neutral-500 mt-2">
                            Vendido: {soldQty} unidad
                            {soldQty === 1 ? "" : "es"}
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                          {/* Borrar */}
                          <button
                            onClick={() => {
                              if (locked) {
                                alert(
                                  "No puedes borrar un producto que ya tiene ventas."
                                );
                                return;
                              }
                              removeProduct(p.id);
                            }}
                            className="self-start md:self-auto bg-red-500/20 text-red-400 border border-red-500/40 rounded-lg text-[11px] font-semibold py-2 px-3 hover:bg-red-500/30 hover:text-red-300 transition"
                          >
                            Borrar
                          </button>

                          {/* Clonar como nuevo (solo si LOCKED) */}
                          {locked && (
                            <button
                              onClick={() => {
                                // pre-cargar los datos en el formulario
                                // generando un nuevo ID con sufijo -v2
                                setForm({
                                  id: p.id + "-v2",
                                  name: p.name,
                                  price: String(p.price),
                                  imageData: p.image || "",
                                  desc: p.desc,
                                  details: p.details,
                                  sizes: p.sizes.join(","),
                                  stock: String(p.stock ?? 0),
                                });
                                setPreview(p.image || "");
                                window.scrollTo({
                                  top: 0,
                                  behavior: "smooth",
                                });
                              }}
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
 * Campo de input de una sola línea
 * Estilo dark + focus amarillo
 * ----------------------------- */
function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required = true,
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
}) {
  return (
    <label className="block text-sm">
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
 * Igual estilo que InputField pero multilinea
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
        className="mt-1 w-full rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2 text-white outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-sm min-h-[70px]"
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
 * Zona drag & drop + preview para imagen del producto.
 *
 * - El admin puede:
 *   1. Arrastrar y soltar una imagen.
 *   2. Hacer click para abrir el file picker.
 *
 * - Mostramos una vista previa.
 * - Esa imagen queda guardada en `form.imageData` (base64),
 *   y luego se mete en el campo `image` del producto al guardar.
 *
 * Esto no depende de un backend todavía, funciona solo con Zustand/localStorage.
 * Más adelante podemos reemplazar `imageData` por una URL subida a un server/CDN.
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
