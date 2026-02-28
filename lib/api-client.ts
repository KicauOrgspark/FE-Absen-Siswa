import { ApiError, ApiResponse } from './types'

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://127.0.0.1:3000/api/v1'

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

export const tokenAPI = {
  getAll: () => apiCall('/tokens'),
  getOne: (id: string) => apiCall(`/tokens/${id}`),

  create: (payload: {
    duration: number
    late_after: number
  }) =>
    apiCall('/token/create', {
      method: 'POST',
      body: JSON.stringify({
        duration: payload.duration,
        late_after: payload.late_after,
      }),
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
