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

  const generate = async (payload: TokenRequest) => {
    setLoading(true)
    setError(null)
    const result = await tokenAPI.create(payload)
    if ('data' in result && result.success) {
      setGeneratedToken(result.data || null)
      return result.data
    } else {
      setError(result.message || 'Failed to generate token')
      return null
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
