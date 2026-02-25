import { ApiError, ApiResponse } from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>
}

export async function apiCall<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T> | ApiError> {
  try {
    const url = `${API_URL}${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    // Add auth token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'An error occurred',
        code: data.code,
      }
    }

    return data
  } catch (error) {
    console.error('[v0] API Error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error',
    }
  }
}

// Token API calls
export const tokenAPI = {
  getAll: () => apiCall('/tokens'),
  getOne: (id: string) => apiCall(`/tokens/${id}`),
  create: (payload: {
    validityHours: number
  }) =>
    apiCall('/tokens', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  delete: (id: string) =>
    apiCall(`/tokens/${id}`, {
      method: 'DELETE',
    }),
  update: (id: string, payload: Record<string, any>) =>
    apiCall(`/tokens/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
}

// Attendance API calls
export const attendanceAPI = {
  getStats: () => apiCall('/attendance/stats'),
  getChart: (days: number = 30) =>
    apiCall(`/attendance/chart?days=${days}`),
  getRecent: (limit: number = 10) =>
    apiCall(`/attendance/recent?limit=${limit}`),
}
