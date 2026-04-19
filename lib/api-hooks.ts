'use client'

import { useState, useEffect } from 'react'
import { tokenAPI, dashboardAPI } from './api-client'
import {
  Token,
  AttendanceStats,
  ChartDataPoint,
  TokenRequest,
} from './types'

/* =========================================================
   TOKENS
========================================================= */

export function useTokens() {
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refetch = async () => {
    try {
      setLoading(true)
      const result = await tokenAPI.getAll()

      if ('data' in result && result.data) {
        setTokens(result.data as Token[])
      } else {
        setError(result.message || 'Failed to fetch tokens')
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refetch()
  }, [])

  return { tokens, loading, error, refetch }
}

/* =========================================================
   GENERATE TOKEN
========================================================= */

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

      if ('data' in result && result.data) {
        const token = result.data as Token
        setGeneratedToken(token)
        return token
      }

      setError(result.message || 'Failed to generate token')
      return null
    } catch {
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

/* =========================================================
   DASHBOARD STATS
========================================================= */

function mapDashboardResponse(data: any): AttendanceStats {
  return {
    totalTokens: data.total_token,
    todayAttendance: data.total_absen_hari_ini,
    activeTokens: data.token_aktif,
    totalAttendance: data.token_hari_ini,
  }
}

export function useAttendanceStats() {
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const result = await dashboardAPI.getStats()

        if ('data' in result && result.data) {
          const mapped = mapDashboardResponse(result.data)
          setStats(mapped)
        } else {
          setError(result.message || 'Failed to fetch stats')
        }
      } catch {
        setError('Failed to fetch stats')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading, error }
}

/* =========================================================
   ATTENDANCE CHART
========================================================= */

export function useAttendanceChart() {
  const [data, setData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchChart = async () => {
      try {
        setLoading(true)

        const result = await dashboardAPI.getChart()

        // ✅ cek apakah ini success response
        if ('data' in result) {
          setData(result.data as ChartDataPoint[])
        } else {
          setError(result.message || 'Failed to fetch chart')
        }

      } catch (err) {
        setError('Failed to fetch chart')
      } finally {
        setLoading(false)
      }
    }

    fetchChart()
  }, [])

  return { data, loading, error }
}

/* =========================================================
   PAGINATED TOKENS
========================================================= */

export function usePaginatedTokens() {
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const result = await tokenAPI.getPaginated(page)

        if ('data' in result && result.data) {
          setTokens(result.data.tokens)
          setTotalPages(result.data.totalPages)
        } else {
          setError(result.message || 'Failed to fetch tokens')
        }
      } catch {
        setError('Failed to fetch tokens')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [page])

  return {
    tokens,
    loading,
    error,
    page,
    setPage,
    totalPages,
  }
}

/* =========================================================
   STATIC DATA
========================================================= */

export function useAvailableClasses() {
  const [classes] = useState([
    { id: 'XI-RPL-1', name: 'XI RPL 1' },
    { id: 'XI-RPL-2', name: 'XI RPL 2' },
    { id: 'XI-TKJ-1', name: 'XI TKJ 1' },
    { id: 'XI-MM-1', name: 'XI MM 1' },
  ])

  return { classes, loading: false, error: null }
}

export function useAvailableDepartments() {
  const [departments] = useState([
    { id: 'RPL', name: 'RPL' },
    { id: 'TKJ', name: 'TKJ' },
    { id: 'MM', name: 'Multimedia' },
  ])

  return { departments, loading: false, error: null }
}

/* =========================================================
   EXPORT DATA
========================================================= */

export function useExportData() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const exportToExcel = async (filters: {
    exportType?: string
    classId?: string
    departmentId?: string
    startDate?: string
  }) => {
    setLoading(true)
    setError(null)

    try {
      const searchParams = new URLSearchParams()

      if (filters.exportType) searchParams.append('type', filters.exportType)
      if (filters.classId) searchParams.append('kelas', filters.classId)
      if (filters.departmentId) searchParams.append('jurusan', filters.departmentId)
      if (filters.startDate) searchParams.append('tanggal', filters.startDate)

      const url = `/api/v1/export/attendance?${searchParams.toString()}`

      const headers: Record<string, string> = {}
      const token = localStorage.getItem('authToken')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(url, { headers })

      if (!response.ok) {
        throw new Error(`Export failed with status: ${response.status}`)
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = downloadUrl
      const dateStr =
        filters.startDate || new Date().toISOString().split('T')[0]

      link.setAttribute('download', `Rekap_Absensi_${dateStr}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(downloadUrl)

      return { success: true }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Export failed'
      )
      return { success: false }
    } finally {
      setLoading(false)
    }
  }

  return { exportToExcel, loading, error }
}