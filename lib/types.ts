// Token types
export interface Token {
  id: string
  name: string
  type: 'attendance' | 'event' | 'custom'
  token: string
  createdAt: string
  expiresAt: string
  status: 'active' | 'expired' | 'revoked'
  usageCount?: number
}

export interface TokenRequest {
  validityHours: number
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
  total?: number
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface ApiError {
  success: false
  message: string
  code?: string
}
