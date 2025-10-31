/**
ClientOnly
- Evita hidratación incorrecta.
- Renderiza children solo después del montaje en el cliente.
- Útil para Zustand con localStorage.
*/

'use client'

import { useEffect, useState, ReactNode } from 'react'

export default function ClientOnly({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // devolvemos null en SSR y en el primer render del cliente.
    // esto evita hydration mismatch completamente.
    return null
  }

  return <>{children}</>
}
