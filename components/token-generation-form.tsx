'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useGenerateToken } from '@/lib/api-hooks'
import { Zap, Copy, Check, Clock, Timer, Sparkles, RefreshCw } from 'lucide-react'

interface TokenGenerationFormProps {
  onTokenGenerated?: (token: string) => void
}

export function TokenGenerationForm({ onTokenGenerated }: TokenGenerationFormProps) {
  const [generatedToken, setGeneratedToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const form = useForm({
    defaultValues: { duration: '20', late_after: '10' },
  })

  const { generate, loading } = useGenerateToken()

  async function onSubmit(values: { duration: string; late_after: string }) {
    setGeneratedToken(null)
    const result = await generate({
      duration: parseInt(values.duration),
      late_after: parseInt(values.late_after),
    })
    if (result) {
      form.reset()
      setGeneratedToken(result.token_code)
      onTokenGenerated?.(result.token_code)
    }
  }

  function handleCopy() {
    if (!generatedToken) return
    navigator.clipboard.writeText(generatedToken)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  function handleReset() {
    setGeneratedToken(null)
    form.reset()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-lg"
    >
      {/* ── Page Header ── */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
          <Zap className="h-6 w-6 text-orange-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Generate Token</h1>
          <p className="text-sm text-slate-500">Buat token absensi harian untuk siswa</p>
        </div>
      </div>

      <AnimatePresence mode="wait">

        {/* ── FORM STATE ── */}
        {!generatedToken && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-xl shadow-black/30 overflow-hidden"
          >
            {/* Top accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-orange-600 via-orange-400 to-amber-400" />

            <div className="p-6 space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

                  {/* ── Two fields side by side ── */}
                  <div className="grid grid-cols-2 gap-4">

                    {/* Duration */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <div className="
                              bg-slate-800/60 border border-slate-700/60 rounded-xl p-4
                              hover:border-slate-600 focus-within:border-orange-500/60
                              transition-all duration-200 group
                            ">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                                  <Clock className="h-3 w-3 text-orange-400" />
                                </div>
                                <span className="text-xs font-medium text-slate-400">Durasi Valid</span>
                              </div>
                              <FormControl>
                                <div className="flex items-baseline gap-1.5">
                                  <Input
                                    type="number"
                                    disabled={loading}
                                    className="
                                      border-0 bg-transparent text-white text-3xl font-bold h-auto p-0
                                      focus-visible:ring-0 focus-visible:ring-offset-0
                                      [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                                      w-full
                                    "
                                    {...field}
                                  />
                                  <span className="text-sm text-slate-500 shrink-0">menit</span>
                                </div>
                              </FormControl>
                            </div>
                            <FormMessage className="text-xs text-red-400 mt-1" />
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    {/* Late After */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.17 }}
                    >
                      <FormField
                        control={form.control}
                        name="late_after"
                        render={({ field }) => (
                          <FormItem>
                            <div className="
                              bg-slate-800/60 border border-slate-700/60 rounded-xl p-4
                              hover:border-slate-600 focus-within:border-orange-500/60
                              transition-all duration-200 group
                            ">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                                  <Timer className="h-3 w-3 text-amber-400" />
                                </div>
                                <span className="text-xs font-medium text-slate-400">Batas Terlambat</span>
                              </div>
                              <FormControl>
                                <div className="flex items-baseline gap-1.5">
                                  <Input
                                    type="number"
                                    disabled={loading}
                                    className="
                                      border-0 bg-transparent text-white text-3xl font-bold h-auto p-0
                                      focus-visible:ring-0 focus-visible:ring-offset-0
                                      [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                                      w-full
                                    "
                                    {...field}
                                  />
                                  <span className="text-sm text-slate-500 shrink-0">menit</span>
                                </div>
                              </FormControl>
                            </div>
                            <FormMessage className="text-xs text-red-400 mt-1" />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  </div>

                  {/* Helper text */}
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
                    className="flex items-center justify-between text-xs text-slate-600"
                  >
                    <span>Token aktif selama <span className="text-slate-400">{form.watch('duration')} menit</span></span>
                    <span>Terlambat jika &gt; <span className="text-slate-400">{form.watch('late_after')} menit</span></span>
                  </motion.div>

                  {/* Submit */}
                  <motion.div
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  >
                    <Button
                      type="submit"
                      disabled={loading}
                      className="
                        w-full h-12 rounded-xl font-semibold text-sm
                        bg-orange-500 hover:bg-orange-400 active:scale-[0.98]
                        transition-all duration-200 shadow-lg shadow-orange-900/40
                        disabled:opacity-60 disabled:cursor-not-allowed
                      "
                    >
                      <AnimatePresence mode="wait">
                        {loading ? (
                          <motion.div key="loading"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex items-center gap-2"
                          >
                            <LoadingSpinner size="sm" />
                            <span>Generating...</span>
                          </motion.div>
                        ) : (
                          <motion.div key="idle"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex items-center gap-2"
                          >
                            <Sparkles className="h-4 w-4" />
                            <span>Generate Token</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Button>
                  </motion.div>

                </form>
              </Form>
            </div>
          </motion.div>
        )}

        {/* ── TOKEN RESULT STATE ── */}
        {generatedToken && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-xl shadow-black/30 overflow-hidden"
          >
            {/* Top accent bar — green when success */}
            <div className="h-1 w-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-teal-400" />

            <div className="p-6 space-y-5">

              {/* Status badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
                    Token Aktif
                  </span>
                </div>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-400 transition-colors"
                >
                  <RefreshCw className="h-3 w-3" />
                  Buat Baru
                </button>
              </div>

              {/* Token Display — the hero element */}
              <div className="
                bg-slate-800/80 border border-slate-700/60 rounded-2xl
                px-6 py-8 text-center relative overflow-hidden
              ">
                {/* subtle glow behind token */}
                <div className="absolute inset-0 bg-orange-500/5 blur-xl pointer-events-none" />

                <p className="text-xs text-slate-500 mb-3 uppercase tracking-widest">Token Hari Ini</p>
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 20 }}
                  className="text-5xl font-black font-mono text-white tracking-[0.25em] relative z-10"
                >
                  {generatedToken}
                </motion.p>
              </div>

              {/* Copy Button */}
              <Button
                onClick={handleCopy}
                className={`
                  w-full h-12 rounded-xl font-semibold text-sm
                  transition-all duration-300 active:scale-[0.98]
                  ${copied
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-900/40'
                    : 'bg-slate-800 hover:bg-slate-700 border border-slate-600/60 text-slate-200'
                  }
                `}
              >
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.div key="copied"
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                      className="flex items-center gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Token Tersalin!
                    </motion.div>
                  ) : (
                    <motion.div key="copy"
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                      className="flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Salin Token
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>

              {/* Footer info */}
              <p className="text-center text-xs text-slate-600">
                Bagikan token ini kepada siswa · Berlaku{' '}
                <span className="text-slate-500">{form.getValues('duration')} menit</span>
                {' '}· Terlambat setelah{' '}
                <span className="text-slate-500">{form.getValues('late_after')} menit</span>
              </p>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  )
}