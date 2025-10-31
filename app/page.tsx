/**
HomePage
- Página de inicio provisional.
- Espacio para mostrar información de la marca, drops o noticias.
- Estilo consistente con el resto del sitio.
*/

"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white py-20 px-6">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* LOGO O TÍTULO */}
        <h1 className="text-4xl md:text-5xl font-display font-bold text-yellow-400">
          Bienvenido a SkaterStore 🛹
        </h1>

        {/* SUBTÍTULO */}
        <p className="text-neutral-300 text-lg max-w-2xl mx-auto">
          Esta es la página de inicio provisional. Aquí podrás colocar
          información sobre la marca, próximos lanzamientos o promociones
          especiales.
        </p>

        {/* SECCIÓN DE BOTONES */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <Link
            href="/shop"
            className="bg-yellow-400 text-black font-bold py-3 px-6 rounded-lg hover:bg-yellow-300 transition"
          >
            Ver Productos
          </Link>

          <Link
            href="/admin"
            className="bg-neutral-900 border border-neutral-700 text-neutral-300 font-semibold py-3 px-6 rounded-lg hover:border-yellow-400 hover:text-yellow-400 transition"
          >
            Ir al Panel Admin
          </Link>
        </div>

        {/* SECCIÓN DE INFORMACIÓN */}
        <div className="mt-16 bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-left space-y-4">
          <h2 className="text-2xl font-bold text-yellow-400">
            Próximos lanzamientos ⚡
          </h2>
          <p className="text-neutral-300 text-sm leading-relaxed">
            Próximamente tendremos nuevas prendas de edición limitada:
            sudaderas, gorras y sneakers diseñadas especialmente para la cultura
            skater. Suscríbete para no perderte los nuevos drops.
          </p>
        </div>

        {/* FOOTER SIMPLE */}
        <footer className="mt-20 text-neutral-600 text-sm border-t border-neutral-800 pt-6">
          © {new Date().getFullYear()} SkaterStore. Todos los derechos
          reservados.
        </footer>
      </div>
    </main>
  );
}
