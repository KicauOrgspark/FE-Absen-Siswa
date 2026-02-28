'use client'

import { useState, useEffect } from 'react'
import { tokenAPI, attendanceAPI } from './api-client'
import {
  Token,
  AttendanceStats,
  ChartDataPoint,
  TokenRequest,
  ApiResponse,
} from './types'

export function useTokens() {
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTokens = async () => {
      setLoading(true)
      const result = await tokenAPI.getAll()
      if ('data' in result && result.success) {
        setTokens(result.data || [])
      } else {
        setError(result.message || 'Failed to fetch tokens')
      }
      setLoading(false)
    }

    fetchTokens()
  }, [])

  return { tokens, loading, error, refetch: () => {} }
}

export function useGenerateToken() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedToken, setGeneratedToken] = useState<Token | null>(null)

const generate = async (
  payload: TokenRequest
): Promise<Token | null> => {
  setLoading(true)
  setError(null)

  try {
    const result = await tokenAPI.create(payload)

    console.log("API RESULT:", result)

    // Karena backend kirim { data: {...}, message: ... }
    if ('data' in result && result.data) {
      setGeneratedToken(result.data)
      return result.data
    }

    setError(result.message || 'Failed to generate token')
    return null
  } catch (err) {
    setError('Something went wrong')
    return null
  } finally {
    setLoading(false)
  }
}

  const reset = () => {
    setGeneratedToken(null)
    setError(null)
  }

  return { generate, loading, error, generatedToken, reset }
}

export function useAttendanceStats() {
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      const result = await attendanceAPI.getStats()
      if ('data' in result && result.success) {
        setStats(result.data || null)
      } else {
        setError(result.message || 'Failed to fetch stats')
      }
      setLoading(false)
    }

    fetchStats()
  }, [])

  return { stats, loading, error }
}

export function useAttendanceChart(days: number = 30) {
  const [data, setData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true)
      const result = await attendanceAPI.getChart(days)
      if ('data' in result && result.success) {
        setData(result.data || [])
      } else {
        setError(result.message || 'Failed to fetch chart data')
      }
      setLoading(false)
    }

    fetchChartData()
  }, [days])

  return { data, loading, error }
}

export function usePaginatedTokens(pageSize: number = 10) {
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchTokens = async () => {
      setLoading(true)
      const result = await tokenAPI.getAll()
      if ('data' in result && result.success) {
        const allTokens = (result.data || []) as Token[]
        setTotalPages(Math.ceil(allTokens.length / pageSize))
        const start = (page - 1) * pageSize
        setTokens(allTokens.slice(start, start + pageSize))
      } else {
        setError(result.message || 'Failed to fetch tokens')
      }
      setLoading(false)
    }

    fetchTokens()
  }, [page, pageSize])

  return {
    tokens,
    loading,
    error,
    page,
    setPage,
    totalPages,
  }
}

export function useAvailableClasses() {
  const classes = [
    { id: "X-RPL-1", name: "X RPL 1" },
    { id: "X-RPL-2", name: "X RPL 2" },
    { id: "XI-RPL-1", name: "XI RPL 1" },
    { id: "XI-RPL-2", name: "XI RPL 2" },
    { id: "XII-RPL-1", name: "XII RPL 1" },

    { id: "X-TKJ-1", name: "X TKJ 1" },
    { id: "XI-TKJ-1", name: "XI TKJ 1" },

    { id: "X-MM-1", name: "X MM 1" },
  ]

  return {
    classes,
    loading: false,
    error: null,
  }
}


export function useExportData() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const exportToExcel = async (filters: {
    classId?: string
    departmentId?: string
    attendanceDate?: string
  }) => {
    setLoading(true)
    setError(null)

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api/v1'

      const params = new URLSearchParams()

      // 🔥 SAMAKAN DENGAN BACKEND
      if (filters.classId) params.append('kelas', filters.classId)
      if (filters.departmentId) params.append('jurusan', filters.departmentId)
      if (filters.attendanceDate) params.append('tanggal', filters.attendanceDate)

      const url = `${baseUrl}/export/attendance?${params.toString()}`

      const response = await fetch(url)

      if (!response.ok) throw new Error('Failed to export')

      // 🔥 ambil file excel
      const blob = await response.blob()

      const downloadUrl = window.URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `Attendance_${filters.attendanceDate || 'data'}.xlsx`
      a.click()

      window.URL.revokeObjectURL(downloadUrl)

      return { success: true }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Export failed'

      setError(message)

      return { success: false }
    } finally {
      setLoading(false)
    }
  }

  return { exportToExcel, loading, error }
}

export function useAvailableDepartments() {
  const departments = [
    { id: "RPL", name: "RPL" },
    { id: "DKV", name: "DKV" },
    { id: "LPB", name: "LPB" },
    { id: "MM", name: "MM" },
    { id: "PKM", name: "PKM" },
    { id: "TKJ", name: "TKJ" },
    { id: "TOI", name: "TOI" },
  ]

  return {
    departments,
    loading: false,
    error: null,
  }
}
