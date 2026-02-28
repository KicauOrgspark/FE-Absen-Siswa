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
  const [classes, setClasses] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true)
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/classes`
        const response = await fetch(url)
        const result = await response.json()
        
        if (result.success && Array.isArray(result.data)) {
          setClasses(result.data)
        } else {
          // Fallback mock data if API not available
          setClasses([
            { id: 'XI-RPL-2', name: 'XI RPL 2' },
            { id: '2', name: 'Class B' },
            { id: '3', name: 'Class C' },
            { id: '4', name: 'Class D' },
          ])
        }
      } catch (err) {
        // Fallback mock data if API request fails
        setClasses([
          { id: 'XI-RPL-2', name: 'XI RPL 2' },
          { id: '2', name: 'Class B' },
          { id: '3', name: 'Class C' },
          { id: '4', name: 'Class D' },
        ])
      }
      setLoading(false)
    }

    fetchClasses()
  }, [])

  return { classes, loading, error }
}

export function useExportData() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const exportToExcel = async (filters: {
    exportType: string
    classId?: string
    departmentId?: string
    startDate?: string
    endDate?: string
  }) => {
    setLoading(true)
    setError(null)

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

      const params = new URLSearchParams()

      if (filters.exportType) params.append('type', filters.exportType)
      if (filters.classId) params.append('classId', filters.classId)
      if (filters.departmentId)
        params.append('departmentId', filters.departmentId)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)

      const url = `${baseUrl}/api/attendance/export?${params.toString()}`

      const response = await fetch(url)
      const result = await response.json()

      if (result.success && Array.isArray(result.data)) {
        return {
          success: true,
          data: result.data,
        }
      }

      throw new Error(result.message || 'Failed to export data')
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Export failed'
      setError(errorMessage)

      return {
        success: false,
        data: null,
      }
    } finally {
      setLoading(false)
    }
  }

  return { exportToExcel, loading, error }
}
export function useAvailableDepartments() {
  const [departments, setDepartments] = useState<
    Array<{ id: string; name: string }>
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDepartments = async () => {
      setLoading(true)
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/departments`
        const response = await fetch(url)
        const result = await response.json()

        if (result.success && Array.isArray(result.data)) {
          setDepartments(result.data)
        } else {
          setDepartments([
            { id: 'RPL', name: 'RPL' },
            { id: 'TKJ', name: 'TKJ' },
            { id: 'MM', name: 'Multimedia' },
          ])
        }
      } catch {
        setDepartments([
          { id: 'RPL', name: 'RPL' },
          { id: 'TKJ', name: 'TKJ' },
          { id: 'MM', name: 'Multimedia' },
        ])
      }
      setLoading(false)
    }

    fetchDepartments()
  }, [])

  return { departments, loading, error }
}