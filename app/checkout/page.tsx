"use client";

/**
 * CheckoutPage
 * ------------------------------------------------------------
 * - Formulario de envío y contacto (validación básica).
 * - Resumen con miniaturas, tallas y subtotales.
 * - PayPal sandbox (clientId: "test") activado sólo si el formulario está completo.
 * - Registra ventas y reduce stock al aprobar el pago.
 * - 🔁 NUEVO: además de registrar en stores, envía el checkout a /api/checkout
 *   para ir acostumbrando el frontend a usar el backend.
 */

import { useState } from "react";
import ClientOnly from "@/components/layout/ClientOnly";
import useCartStore from "@/store/cartStore";
import useProductStore from "@/store/productStore";
import useSalesStore from "@/store/salesStore";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import Image from "next/image";
import Link from "next/link";
import { PRODUCT_PLACEHOLDER_IMAGE } from "@/lib/constants";

export default function CheckoutPage() {
  const { cart, clearCart, total } = useCartStore();
  const reduceStockBatch = useProductStore((s) => s.reduceStockBatch);
  const addSaleBatch = useSalesStore((s) => s.addSaleBatch);

  const [paid, setPaid] = useState(false);
  const [shipping, setShipping] = useState({
    fullName: "",
    country: "",
    adresse: "",
    city: "",
    zip: "",
    phone: "",
    email: "",
  });

  // ✅ validación: todos los campos llenos
  const formComplete =
    shipping.fullName.trim() &&
    shipping.country.trim() &&
    shipping.city.trim() &&
    shipping.adresse.trim() &&
    shipping.zip.trim() &&
    shipping.email.trim() &&
    shipping.phone.trim();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  // Totales
  const itemsTotal = cart
    .reduce((acc, it) => acc + it.price * it.qty, 0)
    .toFixed(2);

  const shippingCost = "0.00";
  const discount = "0.00";

  const grandTotal = (
    parseFloat(itemsTotal) +
    parseFloat(shippingCost) -
    parseFloat(discount)
  ).toFixed(2);

  // 🔁 función auxiliar para mandar al backend
  const sendCheckoutToApi = async () => {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        body: JSON.stringify({
          items: cart.map((it) => ({
            productId: it.id,
            qty: it.qty,
            size: it.size,
          })),
          customer: {
            fullName: shipping.fullName,
            email: shipping.email,
            phone: shipping.phone,
            country: shipping.country,
            adresse: shipping.adresse,
            city: shipping.city,
            zip: shipping.zip,
          },
          total: Number(grandTotal),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.status === 409) {
        const data = await res.json();
        alert(
          "No se pudo registrar el pedido en el servidor por falta de stock:\n\n" +
            (data?.details?.join("\n") || "Stock insuficiente")
        );
        // ⚠️ aquí NO devolvemos error duro, porque el pago ya se hizo
        return;
      }

      if (!res.ok) {
        console.warn("[checkout] backend devolvió error genérico");
      }
    } catch (err) {
      console.warn("[checkout] no se pudo contactar /api/checkout:", err);
      // no bloqueamos el flujo del usuario, solo lo informamos por consola
    }
  };

  return (
    <ClientOnly>
      <div className="text-white">
        {/* Header + Vaciar carrito (lo tenías comentado) */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Checkout</h2>
        </div>

        {paid ? (
          <div className="bg-green-700/20 border border-green-600 rounded-xl p-6">
            <h3 className="text-xl font-bold text-green-400">✅ Pago completado</h3>
            <p className="text-neutral-300 text-sm mt-2">
              Gracias por tu compra. Te contactaremos para coordinar el envío.
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                href="/shop"
                className="inline-block bg-neutral-800 border border-neutral-700 text-neutral-200 font-semibold py-3 px-5 rounded-xl hover:border-yellow-400 hover:text-yellow-400 transition"
              >
                Seguir comprando
              </Link>
            </div>
          </div>
        ) : cart.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-neutral-400 mb-6">
              No hay productos en tu pedido.
            </p>
            <Link
              href="/shop"
              className="inline-block bg-yellow-400 text-black font-bold py-3 px-5 rounded-xl hover:bg-yellow-300 transition"
            >
              Ir a la tienda
            </Link>
          </div>
        ) : (
          // Grid principal: formulario + resumen
          <div className="grid md:grid-cols-2 gap-10">
            {/* ------- Envío & Contacto ------- */}
            <section>
              <h3 className="text-2xl font-bold mb-4">Envío & Contacto</h3>

              <div className="space-y-4">
                <InputField
                  label="Nombre completo"
                  name="fullName"
                  value={shipping.fullName}
                  onChange={handleChange}
                />
                <InputField
                  label="País"
                  name="country"
                  value={shipping.country}
                  onChange={handleChange}
                />
                <InputField
                  label="Ciudad"
                  name="city"
                  value={shipping.city}
                  onChange={handleChange}
                />
                <InputField
                  label="Dirección"
                  name="adresse"
                  value={shipping.adresse}
                  onChange={handleChange}
                />
                <InputField
                  label="Código Postal"
                  name="zip"
                  value={shipping.zip}
                  onChange={handleChange}
                />
                <InputField
                  label="Teléfono / WhatsApp"
                  name="phone"
                  value={shipping.phone}
                  onChange={handleChange}
                />
                <InputField
                  label="Correo / Email"
                  name="email"
                  value={shipping.email}
                  onChange={handleChange}
                />
              </div>

              {!formComplete && (
                <p className="text-xs text-red-400 mt-4">
                  Completa todos los campos para habilitar el pago.
                </p>
              )}

              <p className="text-neutral-500 text-xs mt-4">
                Usamos estos datos únicamente para enviar tu pedido y contactarte
                si hiciera falta.
              </p>
            </section>

            {/* ------- Resumen & Pago ------- */}
            <section>
              <h3 className="text-2xl font-bold mb-4">Resumen</h3>

              {/* Lista de items */}
              <ul className="space-y-3 text-sm">
                {cart.map((it) => (
                  <li
                    key={it.id}
                    className="flex items-start justify-between border-b border-neutral-800 pb-3"
                  >
                    <div className="flex items-start gap-3">
                      {/* Miniatura */}
                      <div className="w-14 h-14 rounded-lg border border-neutral-800 bg-neutral-950 flex items-center justify-center overflow-hidden">
                        <Image
                          src={
                            typeof it.image === "string" && it.image.length > 0
                              ? it.image
                              : PRODUCT_PLACEHOLDER_IMAGE
                          }
                          alt={it.name ?? "producto"}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div>
                        <p className="font-semibold text-white leading-snug">
                          {it.name}
                        </p>
                        {it.size && (
                          <p className="text-[12px] text-neutral-400 leading-snug">
                            Talla: {it.size}
                          </p>
                        )}
                        <p className="text-neutral-500 text-[12px] leading-snug">
                          {it.qty} × €{it.price.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right text-yellow-400 font-semibold text-sm">
                      €{(it.price * it.qty).toFixed(2)}
                    </div>
                  </li>
                ))}
              </ul>

              {/* Totales */}
              <div className="mt-4 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Productos</span>
                  <span>€{itemsTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Envío</span>
                  <span>€{shippingCost}</span>
                </div>
                <div className="flex justify-between">
                  <span>Descuento</span>
                  <span>€{discount}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-neutral-800 mt-2">
                  <span>Total</span>
                  <span>€{grandTotal}</span>
                </div>
              </div>

              {/* PayPal o aviso */}
              <div className="mt-6 bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                {formComplete ? (
                  <PayPalScriptProvider
                    options={{
                      clientId: "test", // sandbox
                      currency: "EUR",
                    }}
                  >
                    <PayPalButtons
                      style={{ layout: "vertical" }}
                      createOrder={(data, actions) => {
                        if (!actions?.order) {
                          return Promise.reject("PayPal order no disponible");
                        }

                        // 🔎 Validación de stock local antes de crear la orden
                        const productStore = useProductStore.getState();
                        const outOfStock: string[] = [];
                        cart.forEach((it) => {
                          const p = productStore.products.find(
                            (x) => x.id === it.id
                          );
                          const stock = p?.stock ?? Infinity;
                          if (it.qty > stock) {
                            outOfStock.push(
                              `${it.name} (Stock disponible: ${stock})`
                            );
                          }
                        });

                        if (outOfStock.length > 0) {
                          alert(
                            "No se puede continuar con el pago.\n\nFalta stock en:\n" +
                              outOfStock.join("\n")
                          );
                          throw new Error("Stock insuficiente");
                        }

                        // Items PayPal
                        const items = cart.map((it) => ({
                          name: it.size
                            ? `${it.name} - Talla ${it.size}`
                            : it.name,
                          unit_amount: {
                            currency_code: "EUR",
                            value: it.price.toFixed(2),
                          },
                          quantity: it.qty.toString(),
                        }));

                        return actions.order.create({
                          intent: "CAPTURE",
                          purchase_units: [
                            {
                              amount: {
                                currency_code: "EUR",
                                value: grandTotal,
                                breakdown: {
                                  item_total: {
                                    currency_code: "EUR",
                                    value: itemsTotal,
                                  },
                                  shipping: {
                                    currency_code: "EUR",
                                    value: shippingCost,
                                  },
                                  discount: {
                                    currency_code: "EUR",
                                    value: discount,
                                  },
                                },
                              },
                              items,
                            },
                          ],
                        });
                      }}
                      onApprove={async (data, actions) => {
                        if (!actions?.order) return;
                        try {
                          const details = await actions.order.capture();

                          // 1) Guardar en stores (lo que ya hacías)
                          const batch = cart.map((it) => ({
                            productId: it.id,
                            qty: it.qty,
                          }));

                          addSaleBatch(batch, {
                            total: Number(grandTotal),
                            customer: {
                              fullName: shipping.fullName,
                              email: shipping.email,
                              phone: shipping.phone,
                              country: shipping.country,
                              adresse: shipping.adresse,
                              city: shipping.city,
                              zip: shipping.zip,
                            },
                          });

                          reduceStockBatch(batch);

                          // 2) 🔁 Mandar también al backend
                          await sendCheckoutToApi();

                          // 3) Limpiar carrito y mostrar éxito
                          clearCart();
                          setPaid(true);

                          console.log("ORDER DETAILS:", details, shipping, cart);
                        } catch (err) {
                          console.error("PayPal capture error:", err);
                        }
                      }}
                      onError={(err) => {
                        console.error("PayPal error:", err);
                      }}
                    />
                  </PayPalScriptProvider>
                ) : (
                  <div className="border border-yellow-400/40 bg-neutral-900 rounded-xl p-4 text-sm text-yellow-400 text-center">
                    ⚠️ Completa todos los campos de envío y contacto para habilitar el pago.
                  </div>
                )}
              </div>
            </section>
          </div>
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
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="text-neutral-300">{label}</span>
      <input
        required
        className="mt-1 w-full rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2 text-white outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-sm"
        name={name}
        value={value}
        onChange={onChange}
      />
    </label>
  );
}
