import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/context/AuthContext";
import { useGeolocation } from "@/app/hooks/useGeolocation";
import { isInsideSchool, getDistanceMeters, SCHOOL_LOCATION } from "@/lib/geofence";

/* ── schemas ── */
export const loginSchema = z.object({
  nisn: z.string().min(1, "Nomor Induk harus diisi"),
  password: z.string().min(1, "Password harus diisi"),
  ingatSaya: z.boolean().optional(),
});

export const tokenSchema = z.object({
  token: z.string().min(1, "Token tidak boleh kosong"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type TokenFormData = z.infer<typeof tokenSchema>;
export type Screen = "login" | "error" | "success";
export type ErrorType = "credentials" | "network" | "role" | "timeout" | "unknown";

export interface AppError {
  type: ErrorType;
  message: string;
}

/* ── constants ── */
export const MAX_TOKEN_ATTEMPTS = 3;
const LOGIN_TIMEOUT_MS = 15000;
const STORAGE_KEY = "absen_remembered_nisn";

/* ── error parsers ── */
export function parseLoginError(error: unknown): AppError {
  if (!(error instanceof Error)) {
    return { type: "unknown", message: "Terjadi kesalahan. Silakan coba lagi." };
  }
  const msg = error.message.toLowerCase();
  if (msg.includes("fetch") || msg.includes("network") || msg.includes("failed to fetch")) {
    return { type: "network", message: "Tidak dapat terhubung ke server. Periksa koneksi internet kamu." };
  }
  if (msg.includes("timeout")) {
    return { type: "timeout", message: "Koneksi terlalu lambat. Silakan coba lagi." };
  }
  if (msg.includes("unauthorized") || msg.includes("invalid") || msg.includes("wrong") || msg.includes("salah")) {
    return { type: "credentials", message: error.message };
  }
  return { type: "unknown", message: error.message || "Terjadi kesalahan. Silakan coba lagi." };
}

export function parseTokenError(error: unknown): string {
  if (!(error instanceof Error)) return "Token tidak valid. Periksa kembali.";
  const msg = error.message.toLowerCase();
  if (msg.includes("expired") || msg.includes("kadaluarsa")) {
    return "Token sudah kadaluarsa. Minta token baru ke guru.";
  }
  if (msg.includes("fetch") || msg.includes("network")) {
    return "Tidak dapat terhubung ke server. Periksa koneksi internet kamu.";
  }
  return error.message || "Token tidak valid. Periksa kembali.";
}

/* ══════════════════════════════════════════
   HOOK
═══════════════════════════════════════════ */
export function useLoginPage() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("login");
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [appError, setAppError] = useState<AppError | null>(null);

  const [tokenError, setTokenError] = useState("");
  const [tokenAttempts, setTokenAttempts] = useState(0);
  const [tokenBlocked, setTokenBlocked] = useState(false);

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSubmittingToken, setIsSubmittingToken] = useState(false);

  const loginTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { login, submitAbsen } = useAuth();
  const { getLocation } = useGeolocation();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { nisn: "", password: "", ingatSaya: false },
  });

  const tokenForm = useForm<TokenFormData>({
    resolver: zodResolver(tokenSchema),
    defaultValues: { token: "" },
  });

  /* restore remembered NISN */
  useEffect(() => {
    try {
      const savedNisn = localStorage.getItem(STORAGE_KEY);
      if (savedNisn) {
        loginForm.setValue("nisn", savedNisn);
        loginForm.setValue("ingatSaya", true);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Login submit ── */
  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoggingIn(true);
    setAppError(null);

    try {
      if (data.ingatSaya) {
        localStorage.setItem(STORAGE_KEY, data.nisn);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {}

    loginTimeoutRef.current = setTimeout(() => {
      setIsLoggingIn(false);
      setAppError({ type: "timeout", message: "Koneksi terlalu lambat. Silakan coba lagi." });
      setCurrentScreen("error");
    }, LOGIN_TIMEOUT_MS);

    try {
      const userData = await login({ nisn: data.nisn, password: data.password });
      clearTimeout(loginTimeoutRef.current!);

      if (userData?.role === "siswa") {
        setShowTokenModal(true);
        setTokenError("");
        setTokenAttempts(0);
        setTokenBlocked(false);
        tokenForm.reset();
      } else {
        setAppError({
          type: "role",
          message: "Akun ini tidak memiliki akses siswa. Hubungi administrator.",
        });
        setCurrentScreen("error");
      }
    } catch (error) {
      clearTimeout(loginTimeoutRef.current!);
      setAppError(parseLoginError(error));
      setCurrentScreen("error");
    } finally {
      setIsLoggingIn(false);
    }
  };

  /* ── Token submit ── */
  const onTokenSubmit = async (data: TokenFormData) => {
    if (tokenBlocked) return;
    setIsSubmittingToken(true);
    setTokenError("");

    try {
      try {
        const coords = await getLocation();

        // 🐛 DEBUG — hapus setelah masalah solved
        console.log("📍 GPS kamu:", coords.latitude, coords.longitude);
        console.log("🏫 Koordinat sekolah:", SCHOOL_LOCATION.latitude, SCHOOL_LOCATION.longitude);
        console.log("📏 Jarak:", getDistanceMeters(
          { latitude: coords.latitude, longitude: coords.longitude },
          SCHOOL_LOCATION
        ), "meter");

        if (!isInsideSchool({ latitude: coords.latitude, longitude: coords.longitude })) {
          setTokenError("Kamu berada di luar area sekolah. Absen hanya bisa dilakukan di lingkungan sekolah.");
          return;
        }
      } catch (gpsError) {
        setTokenError(
          gpsError instanceof Error ? gpsError.message : "Gagal mendapatkan lokasi GPS."
        );
        return;
      }

      await submitAbsen(data.token);
      setShowTokenModal(false);
      setCurrentScreen("success");
      setTimeout(() => { window.location.href = "/"; }, 3000);

    } catch (error) {
      const newAttempts = tokenAttempts + 1;
      setTokenAttempts(newAttempts);
      if (newAttempts >= MAX_TOKEN_ATTEMPTS) {
        setTokenBlocked(true);
        setTokenError("Terlalu banyak percobaan salah. Tutup dan minta token baru ke guru.");
      } else {
        const remaining = MAX_TOKEN_ATTEMPTS - newAttempts;
        setTokenError(`${parseTokenError(error)} (${remaining} percobaan tersisa)`);
      }
    } finally {
      setIsSubmittingToken(false);
    }
  };

  /* ── Retry ── */
  const handleRetry = () => {
    setAppError(null);
    setCurrentScreen("login");
    loginForm.reset();
  };

  /* ── Close token modal ── */
  const handleCloseTokenModal = () => {
    setShowTokenModal(false);
    setTokenError("");
    setTokenAttempts(0);
    setTokenBlocked(false);
    tokenForm.reset();
  };

  return {
    // state
    currentScreen,
    showTokenModal,
    showPassword,
    appError,
    tokenError,
    tokenAttempts,
    tokenBlocked,
    isLoggingIn,
    isSubmittingToken,
    // forms
    loginForm,
    tokenForm,
    // handlers
    onLoginSubmit,
    onTokenSubmit,
    handleRetry,
    handleCloseTokenModal,
    setShowPassword,
  };
}