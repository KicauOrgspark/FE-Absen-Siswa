'use client'

import { motion } from 'framer-motion'
import { useSidebar } from '@/context/sidebar-context'

export function MainContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar()

  return (
    <motion.main
      animate={{
        // Mobile: no left margin. Desktop: 80px (collapsed) or 256px (expanded)
        marginLeft: typeof window !== 'undefined' && window.innerWidth >= 1024
          ? collapsed ? 80 : 256
          : 0,
      }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="pt-24 px-4 pb-8 lg:px-8 lg:pb-10 min-h-screen"
    >
      {children}
    </motion.main>
  )
}