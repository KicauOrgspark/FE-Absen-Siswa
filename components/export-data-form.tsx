'use client'

import { useForm } from 'react-hook-form'
import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
  useAvailableClasses,
  useAvailableDepartments,
  useExportData,
} from '@/lib/api-hooks'
import { useToastNotify } from '@/lib/use-toast-notify'
import { Download, FileSpreadsheet } from 'lucide-react'
import * as XLSX from 'xlsx'

export function ExportDataForm() {
  const form = useForm({
    defaultValues: {
      classId: '',
      departmentId: '',
      attendanceDate: '', // 🔥 cuma 1 tanggal
    },
  })

  const { classes, loading: classesLoading } = useAvailableClasses()
  const { departments } = useAvailableDepartments()
  const { exportToExcel, loading: exportLoading } = useExportData()
  const toast = useToastNotify()

  const [classSearch, setClassSearch] = useState('')

  const isLoading = classesLoading || exportLoading

  const filteredClasses = useMemo(() => {
    if (!classSearch) return classes
    return classes.filter((cls) =>
      cls.name.toLowerCase().includes(classSearch.toLowerCase())
    )
  }, [classSearch, classes])

  async function onSubmit(values: any) {
    if (
      !values.classId &&
      !values.departmentId &&
      !values.attendanceDate
    ) {
      toast.warning(
        'Filter Required',
        'Please select at least one filter before exporting'
      )
      return
    }

    const result = await exportToExcel(values)

    if (result.success && result.data) {
      const worksheet = XLSX.utils.json_to_sheet(result.data)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance')

      worksheet['!cols'] = [
        { wch: 15 },
        { wch: 20 },
        { wch: 15 },
        { wch: 10 },
        { wch: 25 },
      ]

      const filenameDate =
        values.attendanceDate ||
        new Date().toISOString().split('T')[0]

      XLSX.writeFile(
        workbook,
        `Attendance_${filenameDate}.xlsx`
      )

      toast.success(
        'Export Successful',
        `Exported ${result.data.length} records`
      )

      form.reset()
      setClassSearch('')
    } else {
      toast.error('Export Failed', 'Failed to export data.')
    }
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-100 rounded-lg">
          <FileSpreadsheet className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Export Attendance
          </h1>
          <p className="text-slate-600">
            Filter by class, department, or specific date
          </p>
        </div>
      </div>

      <Card className="p-8">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* CLASS + DEPARTMENT */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* CLASS WITH SEARCH */}
              <FormField
                control={form.control}
                name="classId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class (Optional)</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="All Classes" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="p-2">
                            <input
                              type="text"
                              placeholder="Search class..."
                              value={classSearch}
                              onChange={(e) =>
                                setClassSearch(e.target.value)
                              }
                              className="w-full border rounded-md px-2 py-1 text-sm"
                            />
                          </div>

                          {filteredClasses.length > 0 ? (
                            filteredClasses.map((cls) => (
                              <SelectItem
                                key={cls.id}
                                value={cls.id}
                              >
                                {cls.name}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-sm text-gray-500">
                              No class found
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* DEPARTMENT */}
              <FormField
                control={form.control}
                name="departmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department (Optional)</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="All Departments" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem
                              key={dept.id}
                              value={dept.id}
                            >
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* 🔥 SINGLE DATE */}
            <FormField
              control={form.control}
              name="attendanceDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date (Optional)</FormLabel>
                  <FormControl>
                    <input
                      type="date"
                      {...field}
                      className="w-full h-11 border rounded-md px-3"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* SUBMIT */}
            <Button
              type="submit"
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" variant="dots" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Download size={18} />
                  Export to Excel
                </div>
              )}
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  )
}