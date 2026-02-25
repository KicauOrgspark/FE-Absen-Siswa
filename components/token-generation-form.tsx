'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useGenerateToken } from '@/lib/api-hooks'
import { Zap } from 'lucide-react'

interface TokenGenerationFormProps {
  onTokenGenerated?: (token: string) => void
}

export function TokenGenerationForm({
  onTokenGenerated,
}: TokenGenerationFormProps) {
  const form = useForm({
    defaultValues: {
      validityHours: '24',
    },
  })

  const { generate, loading } = useGenerateToken()

  async function onSubmit(values: {
    validityHours: string
  }) {
    const result = await generate({
      validityHours: parseInt(values.validityHours),
    })

    if (result) {
      form.reset()
      onTokenGenerated?.(result.token)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Zap className="text-orange-500" size={24} />
          <h2 className="text-2xl font-bold">Generate New Token</h2>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="validityHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Validity Duration (Hours)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="24"
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    How long should this token remain valid?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  <span>Generating...</span>
                </div>
              ) : (
                'Generate Token'
              )}
            </Button>
          </form>
        </Form>
      </Card>
    </motion.div>
  )
}
