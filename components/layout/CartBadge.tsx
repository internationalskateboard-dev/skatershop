/**
CartBadge
- Icono/contador del carrito en la Navbar.
- Lee cantidad total desde cartStore.
- Renderiza solo en cliente.
*/

'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useCartStore from '@/store/cartStore'

export default function CartBadge() {
  const [mounted, setMounted] = useState(false)
  const count = useCartStore((s) => s.countItems())

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <AnimatePresence mode="popLayout">
      <motion.span
        key={count}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 15,
        }}
        className="bg-yellow-400 text-black font-bold text-[10px] px-2 py-0.5 rounded shadow-md"
      >
        {count}
      </motion.span>
    </AnimatePresence>
  )
}
