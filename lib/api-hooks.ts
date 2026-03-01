'use client'

import { useState, useEffect } from 'react'
import { tokenAPI, dashboardAPI } from './api-client'
import {
  Token,
  AttendanceStats,
  ChartDataPoint,
  TokenRequest,
} from './types'

export function useTokens() {
  const [tokens] = useState<Token[]>([])
  const [loading] = useState(false)
  const [error] = useState<string | null>(null)

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

export function useAttendanceStats() {
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      const result = await dashboardAPI.getStats()
      if ('data' in result && result.success) {
        setStats((result.data as AttendanceStats) || null)
      } else {
        setError(result.message || 'Failed to fetch stats')
      }
      setLoading(false)
    }

    fetchStats()
  }, [])

  return { stats, loading, error }
}

export function useAttendanceChart() {
  const [data] = useState<ChartDataPoint[]>([])
  const [loading] = useState(false)
  const [error] = useState<string | null>(null)

  return { data, loading, error }
}

export function usePaginatedTokens() {
  const [tokens] = useState<Token[]>([])
  const [loading] = useState(false)
  const [error] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages] = useState(1)

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
  const [classes] = useState([
    { id: 'XI-RPL-1', name: 'XI RPL 1' },
    { id: 'XI-RPL-2', name: 'XI RPL 2' },
    { id: 'XI-TKJ-1', name: 'XI TKJ 1' },
    { id: 'XI-MM-1', name: 'XI MM 1' },
  ])
  const [loading] = useState(false)
  const [error] = useState<string | null>(null)

  return { classes, loading, error }
}

export function useAvailableDepartments() {
  const [departments] = useState([
    { id: 'RPL', name: 'RPL' },
    { id: 'TKJ', name: 'TKJ' },
    { id: 'MM', name: 'Multimedia' },
  ])
  const [loading] = useState(false)
  const [error] = useState<string | null>(null)

  return { departments, loading, error }
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
      
      const dateStr = filters.startDate || new Date().toISOString().split('T')[0]
      link.setAttribute('download', `Rekap_Absensi_${dateStr}.xlsx`)
      
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)

      return { success: true, data: [] }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Export failed'

      return { success: false, data: null }
    } finally {
      setLoading(false)
    }
  }

  return { exportToExcel, loading, error }
}
