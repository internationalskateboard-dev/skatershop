/**
Root Layout
- Define HTML shell global.
- Incluye Navbar, estilos globales, etc.
*/

import './globals.css'
import { ReactNode } from 'react'
import Navbar from '@/components/layout/Navbar'
import FloatingCart from '@/components/layout/FloatingCart'
import { Bebas_Neue, Inter } from 'next/font/google'

const bebas = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
})

export const metadata = {
  title: 'Skater Store',
  description: 'Streetwear / skate brand shop',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="es"
      className={`bg-neutral-950 text-white ${bebas.variable} ${inter.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.07)_0%,rgba(0,0,0,0)_60%)] bg-neutral-950 text-white">
        <Navbar />

        <main className="flex-1 max-w-5xl w-full mx-auto p-6">
          {children}
        </main>

        <footer className="border-t border-neutral-800 text-neutral-500 text-xs py-6 text-center tracking-wide uppercase font-display">
          SkaterStore © 2025 — Drop limitado
        </footer>

        <FloatingCart />
      </body>
    </html>
  )
}
