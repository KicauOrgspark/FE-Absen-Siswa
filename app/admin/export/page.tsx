'use client'

import { motion } from 'framer-motion'
import { ExportDataForm } from '@/components/export-data-form'

export default function ExportDataPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <ExportDataForm />
    </motion.div>
  )
}
