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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useAvailableClasses, useExportData } from '@/lib/api-hooks'
import { useToastNotify } from '@/lib/use-toast-notify'
import { Download, FileSpreadsheet } from 'lucide-react'
import * as XLSX from 'xlsx'

export function ExportDataForm() {
  const form = useForm({
    defaultValues: {
      classId: '',
    },
  })

  const { classes, loading: classesLoading } = useAvailableClasses()
  const { exportToExcel, loading: exportLoading } = useExportData()
  const toast = useToastNotify()

  const isLoading = classesLoading || exportLoading

  async function onSubmit(values: { classId: string }) {
    if (!values.classId) {
      toast.warning('Selection Required', 'Please select a class to export')
      return
    }

    const selectedClass = classes.find((c) => c.id === values.classId)
    const className = selectedClass?.name || 'Export'

    const result = await exportToExcel(values.classId, className)

    if (result.success && result.data) {
      // Create workbook and worksheet
      const worksheet = XLSX.utils.json_to_sheet(result.data)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance')

      // Set column widths
      const columnWidths = [
        { wch: 15 }, // ID
        { wch: 20 }, // Name
        { wch: 15 }, // Date
        { wch: 10 }, // Status
        { wch: 25 }, // Notes
      ]
      worksheet['!cols'] = columnWidths

      // Generate filename with date
      const now = new Date()
      const dateStr = now.toISOString().split('T')[0]
      const filename = `${className}_Attendance_${dateStr}.xlsx`

      // Write file
      XLSX.writeFile(workbook, filename)

      toast.success(
        'Export Successful',
        `Data from ${className} has been exported to Excel`
      )
      form.reset()
    } else {
      toast.error(
        'Export Failed',
        'Failed to export data. Please try again.'
      )
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-4"
      >
        <div className="p-3 bg-blue-100 rounded-lg">
          <FileSpreadsheet className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Export Data</h1>
          <p className="text-slate-600 mt-1">
            Export attendance records to Excel format
          </p>
        </div>
      </motion.div>

      {/* Main Card */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="p-8 shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Class Selection */}
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  Select Class
                </h2>

                <FormField
                  control={form.control}
                  name="classId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={classesLoading}
                        >
                          <SelectTrigger className="w-full h-11">
                            <SelectValue placeholder="Choose a class to export" />
                          </SelectTrigger>
                          <SelectContent>
                            {classes.map((cls) => (
                              <SelectItem key={cls.id} value={cls.id}>
                                {cls.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>
                        Select which class's attendance records you want to export
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex gap-3 pt-4"
              >
                <Button
                  type="submit"
                  className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="sm" variant="dots" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Download size={18} />
                      <span>Export to Excel</span>
                    </div>
                  )}
                </Button>
              </motion.div>
            </form>
          </Form>
        </Card>
      </motion.div>

      {/* Info Cards */}
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
              delayChildren: 0.4,
            },
          },
        }}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
      </motion.div>
    </div>
  )
}
