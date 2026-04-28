import { useState, useRef, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { useAuth } from "@/context/AuthContext"
import { useGeolocation } from "@/app/hooks/useGeolocation"

import {
  isInsideSchool,
  getDistanceMeters,
  SCHOOL_LOCATION
} from "@/lib/geofence"

/* =========================
 SCHEMA
========================= */

export const loginSchema = z.object({
  nisn: z.string().min(1, "Nomor Induk wajib"),
  password: z.string().min(1, "Password wajib"),
  ingatSaya: z.boolean().optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>

export type Screen =
  | "login"
  | "error"
  | "success"
  | "scan_error"

export type ErrorType =
  | "credentials"
  | "network"
  | "role"
  | "timeout"
  | "unknown"

export interface AppError {
  type: ErrorType
  message: string
}

export interface SuccessTime {
  date: Date
  receiptId: string
}

/* =========================
 CONSTANTS
========================= */

const STORAGE_KEY = "absen_remembered_nisn"
const MAX_QR_ATTEMPTS = 3
const LOGIN_TIMEOUT_MS = 15000
const SCAN_ERROR_REDIRECT_MS = 3000

function generateReceiptId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  return Array.from(
    { length: 8 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("")
}

/* =========================
 HOOK
========================= */

export function useLoginPage() {

  const [currentScreen, setCurrentScreen] = useState<Screen>("login")
  const [showTokenModal, setShowTokenModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [successTime, setSuccessTime] = useState<SuccessTime | null>(null)
  const [appError, setAppError] = useState<AppError | null>(null)
  const [tokenError, setTokenError] = useState("")
  const [tokenAttempts, setTokenAttempts] = useState(0)
  const [tokenBlocked, setTokenBlocked] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const [isSubmittingToken, setIsSubmittingToken] = useState(false)

  const loginTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const scanErrorTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const attemptsRef = useRef(0)

  const { login, submitAbsen } = useAuth()
  const { getLocation } = useGeolocation()

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { nisn: "", password: "", ingatSaya: false }
  })

  /* restore remembered nisn */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        loginForm.setValue("nisn", saved)
        loginForm.setValue("ingatSaya", true)
      }
    } catch { }

    return () => {
      if (loginTimeoutRef.current) clearTimeout(loginTimeoutRef.current)
      if (scanErrorTimeoutRef.current) clearTimeout(scanErrorTimeoutRef.current)
    }
  }, [loginForm])


  /* =========================
   SHARED: tampilkan scan error lalu redirect ke login
   Dipakai oleh geofence check & catch block — DRY
  ========================= */

  const showScanError = useCallback((message: string) => {
    setScanError(message)
    setSuccessTime({ date: new Date(), receiptId: generateReceiptId() })
    setShowTokenModal(false)
    setCurrentScreen("scan_error")

    // clear timeout sebelumnya kalau ada (misal scan cepat 2x)
    if (scanErrorTimeoutRef.current) clearTimeout(scanErrorTimeoutRef.current)
    scanErrorTimeoutRef.current = setTimeout(() => {
      setCurrentScreen("login")
      setScanError(null)
    }, SCAN_ERROR_REDIRECT_MS)
  }, [])


  /* =========================
   LOGIN SUBMIT
  ========================= */

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoggingIn(true)
    setAppError(null)

    try {
      if (data.ingatSaya) {
        localStorage.setItem(STORAGE_KEY, data.nisn)
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch { }

    loginTimeoutRef.current = setTimeout(() => {
      setIsLoggingIn(false)
      setAppError({ type: "timeout", message: "Koneksi timeout" })
      setCurrentScreen("error")
    }, LOGIN_TIMEOUT_MS)

    try {
      const userData = await login({ nisn: data.nisn, password: data.password })

      if (loginTimeoutRef.current) clearTimeout(loginTimeoutRef.current)

      if (userData?.role === "siswa") {
        setShowTokenModal(true)
        setTokenError("")
        attemptsRef.current = 0
        setTokenAttempts(0)
        setTokenBlocked(false)
      } else {
        setAppError({ type: "role", message: "Akses hanya untuk siswa" })
        setCurrentScreen("error")
      }

    } catch (err: any) {
      if (loginTimeoutRef.current) clearTimeout(loginTimeoutRef.current)

      let type: ErrorType = "unknown"
      const msg = (err?.message || "").toLowerCase()

      if (msg.includes("password") || msg.includes("kredensial")) {
        type = "credentials"
      } else if (msg.includes("network") || msg.includes("koneksi")) {
        type = "network"
      } else if (msg.includes("akses") || msg.includes("role")) {
        type = "role"
      }

      setAppError({ type, message: err?.message || "Terjadi kesalahan" })
      setCurrentScreen("error")

    } finally {
      setIsLoggingIn(false)
    }
  }


  /* =========================
   QR SUBMIT
  ========================= */

  const onQRSubmit = useCallback(async (tokenCode: string) => {
    if (tokenBlocked) return

    setIsSubmittingToken(true)
    setTokenError("")

    try {
      const coords = await getLocation()

      console.log(
        "Jarak:",
        getDistanceMeters(
          { latitude: coords.latitude, longitude: coords.longitude },
          SCHOOL_LOCATION
        )
      )

      if (!isInsideSchool({ latitude: coords.latitude, longitude: coords.longitude })) {
        showScanError("Kamu berada di luar area sekolah.")
        return
      }

      await submitAbsen(tokenCode)

      setSuccessTime({ date: new Date(), receiptId: generateReceiptId() })
      setShowTokenModal(false)
      setCurrentScreen("success")

      setTimeout(() => { window.location.href = "/" }, 3000)

    } catch (error: any) {
      attemptsRef.current += 1
      const newAttempts = attemptsRef.current
      setTokenAttempts(newAttempts)

      let message = error?.message || "QR gagal"

      if (newAttempts >= MAX_QR_ATTEMPTS) {
        setTokenBlocked(true)
        message = "Terlalu banyak scan gagal."
      } else {
        message += ` (${MAX_QR_ATTEMPTS - newAttempts} tersisa)`
      }

      showScanError(message)

    } finally {
      setIsSubmittingToken(false)
    }

  }, [tokenBlocked, getLocation, submitAbsen, showScanError])


  /* =========================
   HELPERS
  ========================= */

  const handleRetry = () => {
    setCurrentScreen("login")
    setAppError(null)
    setScanError(null)
  }

  const handleCloseTokenModal = () => {
    setShowTokenModal(false)
    setTokenError("")
    setTokenAttempts(0)
    setTokenBlocked(false)
    attemptsRef.current = 0
  }


  /* =========================
   RETURN
  ========================= */

  return {
    currentScreen,
    showTokenModal,
    showPassword,
    appError,
    tokenError,
    tokenAttempts,
    tokenBlocked,
    isLoggingIn,
    isSubmittingToken,
    successTime,
    scanError,
    loginForm,
    onLoginSubmit,
    onQRSubmit,
    handleRetry,
    handleCloseTokenModal,
    setShowPassword,
  }
}