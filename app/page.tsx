/**
 * HomePage
 * ------------------------------------------------------------
 * Landing principal de la tienda.
 * - Hero con claim de marca
 * - Sección de highlights / ventajas
 * - Showcase del próximo drop
 * - Categorías rápidas
 * - Bloque de comunidad / redes
 * - Footer simple
 *
 * Mantiene la estética negra + amarillo, full responsive.
 */

"use client";

import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  const year = new Date().getFullYear();

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Glow de fondo */}
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -top-40 -left-32 h-72 w-72 rounded-full bg-yellow-400/20 blur-3xl" />
          <div className="absolute -bottom-40 -right-32 h-72 w-72 rounded-full bg-yellow-500/15 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-14 md:pt-20 md:pb-20">
          <div className="flex flex-col lg:flex-row gap-10 lg:items-center">
            {/* Columna texto */}
            <div className="flex-1 space-y-6">
              <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-yellow-300 bg-yellow-400/10 border border-yellow-400/30 rounded-full px-3 py-1 font-semibold">
                <span className="text-sm">🛹</span> streetwear · skate · drops
                limitados
              </p>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-display leading-tight tracking-tight">
                Skater Shop
                <span className="block text-yellow-400">
                  ropa para vivir en la calle.
                </span>
              </h1>

              <p className="text-neutral-300 text-sm md:text-base max-w-xl leading-relaxed">
                Sudaderas pesadas, tees oversize y accesorios pensados para
                patinar, caer, levantarte y seguir rodando. Pocas unidades por
                drop, cero re-stock.
              </p>

              {/* CTA principal */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center rounded-full bg-yellow-400 text-black font-semibold text-sm px-6 py-3 shadow-lg shadow-yellow-400/30 hover:bg-yellow-300 active:scale-[0.98] transition"
                >
                  Ver colección actual
                  <span className="ml-2 text-lg">→</span>
                </Link>

                <Link
                  href="#proximo-drop"
                  className="inline-flex items-center justify-center rounded-full border border-neutral-700 bg-neutral-950/70 text-neutral-200 text-xs sm:text-sm px-5 py-3 hover:border-yellow-400 hover:text-yellow-300 transition"
                >
                  Ver próximo drop
                </Link>
              </div>

              {/* Mini stats */}
              <div className="flex flex-wrap gap-6 pt-4 text-[11px] md:text-xs text-neutral-400">
                <div>
                  <p className="font-semibold text-neutral-200">
                    Ediciones limitadas
                  </p>
                  <p>Sin reposiciones, piezas pensadas para durar.</p>
                </div>
                <div>
                  <p className="font-semibold text-neutral-200">
                    Pensado para patinar
                  </p>
                  <p>Fits cómodos, tejidos resistentes y detalles útiles.</p>
                </div>
              </div>
            </div>

            {/* Columna “mock” de producto destacado */}
            <div className="flex-1 lg:max-w-sm">
              <div className="relative rounded-3xl border border-neutral-800 bg-gradient-to-b from-neutral-900/90 to-neutral-950/90 p-5 md:p-6 shadow-[0_0_40px_rgba(0,0,0,0.6)] group">
                <div className="absolute inset-x-6 -top-3 h-10 bg-yellow-400/10 blur-2xl rounded-full pointer-events-none" />

                <div className="text-[11px] mb-2 flex items-center justify-between text-neutral-400">
                  <span className="uppercase tracking-[0.18em]">
                    Articulo Destacado
                  </span>
                  <span className="text-yellow-400/80">limited</span>
                </div>

                {/* Imagen del deck destacado */}
                <div className="perspective-1000">
                  <div
                    className="
                            relative aspect-[4/3] w-full rounded-2xl
                            bg-[radial-gradient(circle_at_0%_0%,#facc15_0,#171717_45%,#020617_100%)]
                            border border-yellow-400/20 overflow-hidden
                            transform-gpu preserve-3d animate-float-3d
                            transition-transform duration-700
                            group-hover:-translate-y-1 group-hover:rotate-[3deg]
                          "
                  >
                    <Image
                      src="/images/zulia.png"
                      alt="Deck edición limitada Zulia"
                      fill
                      className="object-contain md:object-cover select-none pointer-events-none"
                      priority
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">
                      Deck edición limitada “Zulia”
                    </p>
                    <p className="text-yellow-400 font-bold text-sm">€55.90</p>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Tabla con arte inspirado en calles latinas, tirada corta y
                    numerada. Ideal para colgar o patinarla hasta destruirla.
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between text-[11px] text-neutral-400">
                  <div className="flex -space-x-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-neutral-800 text-[10px] border border-neutral-700">
                      8.0
                    </span>
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-neutral-800 text-[10px] border border-neutral-700">
                      8.25
                    </span>
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-neutral-800 text-[10px] border border-neutral-700">
                      8.5
                    </span>
                  </div>

                  <p className="text-yellow-400/80">
                    <Link
                      href={`/products/patineta-zulia`}
                      className="inline-flex flex-1 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900/70 px-4 py-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-neutral-200 hover:border-yellow-400 hover:text-yellow-300 transition"
                    >
                      Disponible en la tienda →
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights / por qué esta tienda */}
      <section className="border-t border-neutral-900 bg-neutral-950/40">
        <div className="max-w-6xl mx-auto px-6 py-10 md:py-14">
          <div className="grid gap-6 md:grid-cols-3">
            <HighlightCard
              title="Hecho para skaters"
              emoji="🛹"
              text="No somos una marca random: cada prenda está pensada para moverte, caerte y seguir fluyendo en el spot."
            />
            <HighlightCard
              title="Drops limitados"
              emoji="⚡"
              text="Pocas unidades, sin reposición. Lo que ves hoy puede no volver. Perfecto para diferenciarte en la plaza."
            />
            <HighlightCard
              title="Calidad primero"
              emoji="🧵"
              text="Gramajes altos, serigrafías resistentes y detalles que no se descosen a la primera caída."
            />
          </div>
        </div>
      </section>

      {/* Próximo drop */}
      <section
        id="proximo-drop"
        className="border-t border-neutral-900 bg-neutral-950"
      >
        <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
          <div className="flex flex-col md:flex-row gap-8 md:items-center">
            <div className="flex-1 space-y-4">
              <p className="text-xs uppercase tracking-[0.18em] text-yellow-400">
                próximo drop
              </p>
              <h2 className="text-2xl md:text-3xl font-bold">
                Drop nocturno{" "}
                <span className="text-yellow-400">“Midnight Lines”</span>
              </h2>
              <p className="text-sm md:text-base text-neutral-300 leading-relaxed">
                Hoodies pesadas, tees oversize y beanies listos para sesiones
                nocturnas. Inspirado en spots urbanos, barandas brillando y
                luces de ciudad.
              </p>
              <ul className="text-xs text-neutral-400 space-y-1">
                <li>• Colores: negro carbón, gris concreto, burdeos oscuro</li>
                <li>• Fit amplio, cómodo para patinar con capas</li>
                <li>• Cantidad limitada por talla</li>
              </ul>

              <div className="pt-3 flex flex-wrap gap-3 text-xs">
                <span className="rounded-full border border-yellow-400/40 bg-neutral-900 px-3 py-1 text-yellow-300">
                  Lanzamiento pronto
                </span>
                <span className="rounded-full border border-neutral-700 bg-neutral-950 px-3 py-1 text-neutral-300">
                  Suscríbete para enterarte primero
                </span>
              </div>
            </div>

            <div className="flex-1">
              <div className="rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-900 to-black p-5 md:p-6 space-y-4">
                <p className="text-xs text-neutral-400">
                  Deja tu correo y te avisamos cuando el próximo drop esté
                  online. Nada de spam, solo noticias de la tienda.
                </p>
                <form
                  className="flex flex-col sm:flex-row gap-3"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    className="w-full rounded-full bg-neutral-950 border border-neutral-700 px-4 py-2.5 text-sm text-white outline-none focus:border-yellow-400"
                  />
                  <button
                    type="submit"
                    className="w-full sm:w-auto rounded-full bg-yellow-400 text-black text-xs font-semibold px-5 py-2.5 hover:bg-yellow-300 transition"
                  >
                    Avisarme del drop
                  </button>
                </form>
                <p className="text-[10px] text-neutral-500">
                  * Funcionalidad demo. Más adelante puedes conectar esto a tu
                  backend o proveedor de newsletters.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías / navegación rápida */}
      <section className="border-t border-neutral-900 bg-black">
        <div className="max-w-6xl mx-auto px-6 py-10 md:py-14">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
            <div>
              <h2 className="text-xl md:text-2xl font-bold">
                Explora por vibra 🖤
              </h2>
              <p className="text-sm text-neutral-400">
                Encuentra rápido lo que buscas dentro de la tienda.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-full border border-neutral-700 bg-neutral-950 px-4 py-2 text-xs text-neutral-200 hover:border-yellow-400 hover:text-yellow-300 transition"
            >
              Ir al catálogo completo
              <span className="ml-2 text-sm">↗</span>
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <CategoryCard
              title="Hoodies & crews"
              pill="Abrigo para el spot"
              desc="Sudaderas pesadas, cómodas, con detalles pensados para skaters."
            />
            <CategoryCard
              title="Tees & longsleeves"
              pill="Capas ligeras"
              desc="Camisetas oversize y manga larga con gráficos inspirados en la calle."
            />
            <CategoryCard
              title="Accesorios"
              pill="Detalles que cierran el fit"
              desc="Beanies, gorras, calcetines y más para completar tu setup."
            />
          </div>
        </div>
      </section>

      {/* Comunidad / redes */}
      <section className="border-t border-neutral-900 bg-neutral-950/60">
        <div className="max-w-6xl mx-auto px-6 py-10 md:py-14">
          <div className="flex flex-col md:flex-row gap-8 md:items-center">
            <div className="flex-1 space-y-4">
              <h2 className="text-xl md:text-2xl font-bold">
                Más que ropa, comunidad.
              </h2>
              <p className="text-sm md:text-base text-neutral-300 leading-relaxed">
                Skater Shop nace de spots compartidos, trucos fallados y noches
                enteras probando la misma línea. Queremos construir una
                comunidad donde la ropa acompañe tus sesiones, no que te limite.
              </p>
              <p className="text-xs text-neutral-400">
                Comparte tus fotos con{" "}
                <span className="text-yellow-300 font-semibold">
                  #SkaterShop
                </span>{" "}
                y etiqueta la tienda para aparecer en futuros drops.
              </p>
              <div className="flex flex-wrap gap-3 text-xs">
                <span className="rounded-full border border-neutral-700 bg-neutral-950 px-3 py-1 text-neutral-300">
                  IG / TikTok / Clips de sesión
                </span>
                <span className="rounded-full border border-neutral-700 bg-neutral-950 px-3 py-1 text-neutral-300">
                  Colaboraciones con crews locales
                </span>
              </div>
            </div>

            <div className="flex-1">
              <div className="grid grid-cols-3 gap-2">
                
                
                <div className="col-span-2 aspect-square rounded-2xl border border-yellow-400/30 relative overflow-hidden">
                  <Image
                    src="/images/unnamed3.jpeg"
                    alt="Comunidad"
                    fill
                    className="object-cover select-none pointer-events-none"
                  />
                </div>

                <div className="aspect-square rounded-2xl bg-neutral-900 border border-neutral-800 relative overflow-hidden">
                  <Image
                    src="/images/unnamed2.jpeg"
                    alt="Comunidad"
                    fill
                    className="object-cover select-none pointer-events-none"
                  />
                </div>

                <div className="aspect-square rounded-2xl bg-neutral-900 border border-neutral-800 relative overflow-hidden">
                  <Image
                    src="/images/unnamed.jpg"
                    alt="Comunidad"
                    fill
                    className="object-contain select-none pointer-events-none"
                  />
                </div>

                <div className="col-span-2 aspect-[5/2] rounded-2xl bg-neutral-900 border border-neutral-800 relative overflow-hidden">
                  <Image
                    src="/images/unnamed6.jpeg"
                    alt="Comunidad"
                    fill
                    className="object-cover select-none pointer-events-none"
                  />
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-black">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-neutral-500">
          <p>© {year} Skater Shop. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <Link
              href="/shop"
              className="hover:text-yellow-300 transition-colors"
            >
              Tienda
            </Link>
            <Link
              href="/admin"
              className="hover:text-yellow-300 transition-colors"
            >
              Panel admin
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* Subcomponentes pequeños para mantener el archivo limpio */

type HighlightProps = {
  title: string;
  emoji: string;
  text: string;
};

function HighlightCard({ title, emoji, text }: HighlightProps) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4 sm:p-5 space-y-2">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 border border-neutral-700 text-lg">
        {emoji}
      </span>
      <h3 className="text-sm font-semibold text-neutral-50">{title}</h3>
      <p className="text-xs text-neutral-400 leading-relaxed">{text}</p>
    </div>
  );
}

type CategoryProps = {
  title: string;
  pill: string;
  desc: string;
};

function CategoryCard({ title, pill, desc }: CategoryProps) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4 sm:p-5 flex flex-col justify-between gap-3">
      <div className="space-y-2">
        <p className="text-[11px] text-yellow-300 uppercase tracking-[0.18em]">
          categoría
        </p>
        <h3 className="text-sm font-semibold text-neutral-50">{title}</h3>
        <p className="inline-flex items-center text-[11px] text-neutral-300 bg-neutral-900 border border-neutral-700 rounded-full px-3 py-1">
          {pill}
        </p>
        <p className="text-xs text-neutral-400 leading-relaxed mt-1">{desc}</p>
      </div>
      <span className="text-[11px] text-neutral-500">
        Encuéntralo dentro de la tienda →
      </span>
    </div>
  );
}
