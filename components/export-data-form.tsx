'use client'

import { useForm } from 'react-hook-form'
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
} from '@/components/ui/command'

import { Check, ChevronsUpDown, Download, FileSpreadsheet } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

import {
  useAvailableClasses,
  useAvailableDepartments,
  useExportData,
} from '@/lib/api-hooks'

import { useToastNotify } from '@/lib/use-toast-notify'
import * as XLSX from 'xlsx'

export function ExportDataForm() {
  const form = useForm({
    defaultValues: {
      classId: '',
      departmentId: '',
      attendanceDate: '',
    },
  })

  const { classes, loading: classesLoading } = useAvailableClasses()
  const { departments } = useAvailableDepartments()
  const { exportToExcel, loading: exportLoading } = useExportData()

  const toast = useToastNotify()

  const isLoading = classesLoading || exportLoading

  async function onSubmit(values: any) {
    if (!values.classId && !values.departmentId && !values.attendanceDate) {
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
        values.attendanceDate || new Date().toISOString().split('T')[0]

      XLSX.writeFile(workbook, `Attendance_${filenameDate}.xlsx`)

      toast.success(
        'Export Successful',
        `Exported ${result.data.length} records`
      )

      form.reset()
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

              {/* 🔥 SEARCHABLE CLASS */}
              <FormField
                control={form.control}
                name="classId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class (Optional)</FormLabel>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between h-11"
                        >
                          {field.value
                            ? classes.find(c => c.id === field.value)?.name
                            : 'All Classes'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent className="p-0 w-full">
                        <Command>
                          <CommandInput placeholder="Search class..." />

                          <CommandList>
                            <CommandEmpty>No class found</CommandEmpty>

                            {classes.map((cls) => (
                              <CommandItem
                                key={cls.id}
                                value={cls.name}
                                onSelect={() => field.onChange(cls.id)}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    field.value === cls.id
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  }`}
                                />
                                {cls.name}
                              </CommandItem>
                            ))}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
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
                      <select
                        {...field}
                        className="w-full h-11 border rounded-md px-3"
                      >
                        <option value="">All Departments</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* DATE */}
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
              disabled={isLoading}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
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
