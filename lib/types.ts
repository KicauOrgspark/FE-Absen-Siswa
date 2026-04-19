// Token types
export interface Token {
  id: number
  token_code: string
  is_active: boolean
  validUntil: string
  createdAt: string
  created_by: {
    id: number
    full_name: string
  }
}

export interface TokenRequest {
  duration: number
  late_after: number
}

export interface TokenResponse {
  success: boolean
  data?: Token
  message?: string
}

// Attendance types
export interface AttendanceRecord {
  id: string
  userId: string
  userName: string
  tokenId: string
  timestamp: string
  status: 'present' | 'absent'
}

export interface AttendanceStats {
  totalTokens: number
  todayAttendance: number
  activeTokens: number
  totalAttendance: number
}

export interface ChartDataPoint {
  date: string
  attendance: number
}

// API Response types
export interface ApiResponse<T> {
  data: T
  message: string
}

export interface ApiError {
  message: string
}
