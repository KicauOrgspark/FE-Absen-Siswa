'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { TokenGenerationForm } from '@/components/token-generation-form'
import { TokenHistoryTable } from '@/components/token-history'
import { useTokens, usePaginatedTokens } from '@/lib/api-hooks'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function TokenGenerationPage() {
  const [generatedToken, setGeneratedToken] = useState<string | null>(null)
  const [generatedTokenName, setGeneratedTokenName] = useState<string>('')
  const [generatedTokenId, setGeneratedTokenId] = useState<string>('')

  const {
    tokens,
    loading: tokensLoading,
    page,
    setPage,
    totalPages,
  } = usePaginatedTokens(10)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  }

  const handleTokenGenerated = (token: string) => {
    setGeneratedToken(token)
    toast.success('Token generated successfully!')
  }

  const handleDelete = async (id: string) => {
    try {
      toast.promise(
        new Promise((resolve) => {
          setTimeout(() => {
            toast.success('Token deleted successfully!')
            resolve(true)
          }, 500)
        }),
        {
          loading: 'Deleting token...',
          success: 'Token deleted',
          error: 'Failed to delete',
        }
      )
    } catch (error) {
      toast.error('Failed to delete token')
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-slate-900">
          Token Generation
        </h1>
        <p className="text-slate-600 mt-2">
          Generate and manage attendance tokens for your system
        </p>
      </motion.div>

      {/* Main Content Grid */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* Left Column - Form */}
        <motion.div variants={itemVariants}>
          <TokenGenerationForm onTokenGenerated={handleTokenGenerated} />
        </motion.div>
      </motion.div>

      {/* Token History */}
      <motion.div variants={itemVariants} className="space-y-4">
        <TokenHistoryTable
          tokens={tokens}
          loading={tokensLoading}
          onDelete={handleDelete}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              <ChevronLeft size={16} />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <Button
                    key={pageNum}
                    variant={pageNum === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                )
              )}
            </div>

            <Button
              variant="outline"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              Next
              <ChevronRight size={16} />
            </Button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
