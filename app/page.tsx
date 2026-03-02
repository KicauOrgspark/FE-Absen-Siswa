"use client";

import { useState, useRef, useEffect } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowRight,
  User,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Fingerprint,
  WifiOff,
  Clock,
  ShieldX,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

/* ── schemas ── */
const loginSchema = z.object({
  nisn: z.string().min(1, "Nomor Induk harus diisi"),
  password: z.string().min(1, "Password harus diisi"),
  ingatSaya: z.boolean().optional(),
});

const tokenSchema = z.object({
  token: z.string().min(1, "Token tidak boleh kosong"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type TokenFormData = z.infer<typeof tokenSchema>;
type Screen = "login" | "error" | "success";

/* ── error type for richer messaging ── */
type ErrorType = "credentials" | "network" | "role" | "timeout" | "unknown";

interface AppError {
  type: ErrorType;
  message: string;
}

/* ── helpers ── */
const MAX_TOKEN_ATTEMPTS = 3;
const LOGIN_TIMEOUT_MS = 15000;

const STORAGE_KEY = "absen_remembered_nisn";

function parseLoginError(error: unknown): AppError {
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

function parseTokenError(error: unknown): string {
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

/* ── error icon map ── */
const errorIconMap: Record<ErrorType, React.ElementType> = {
  credentials: AlertCircle,
  network: WifiOff,
  role: ShieldX,
  timeout: Clock,
  unknown: AlertTriangle,
};

/* ── animation variants ── */
const cardVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0, y: -24, scale: 0.97,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
};

const fieldVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.08 + 0.2, duration: 0.4, ease: "easeOut" },
  }),
};

const errorBannerVariants = {
  hidden: { opacity: 0, height: 0, marginBottom: 0 },
  visible: { opacity: 1, height: "auto", marginBottom: 16, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, height: 0, marginBottom: 0, transition: { duration: 0.25 } },
};

/* ── shared field component ── */
function FormField({
  id, label, type = "text", icon: Icon, placeholder,
  disabled, registration, error, index,
}: {
  id: string; label: string; type?: string; icon: React.ElementType;
  placeholder: string; disabled: boolean; registration: object;
  error?: string; index: number;
}) {
  return (
    <motion.div custom={index} variants={fieldVariants} initial="hidden" animate="visible">
      <Label htmlFor={id} className="text-sm font-medium text-slate-300 mb-1.5 block">
        {label}
      </Label>
      <div className="relative group">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 transition-colors group-focus-within:text-blue-400 z-10" />
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          className="
            pl-10 bg-slate-800/60 border-slate-700/60 text-slate-100
            placeholder:text-slate-600 rounded-xl h-11
            focus-visible:ring-1 focus-visible:ring-blue-500/60 focus-visible:border-blue-500/60
            transition-all duration-200 hover:border-slate-600
            disabled:opacity-50
          "
          {...registration}
        />
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-xs text-red-400 mt-1.5 flex items-center gap-1"
          >
            <AlertCircle className="h-3 w-3" /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ══════════════════════════════════════════
   LOGIN FORM BODY — di luar LoginPage
═══════════════════════════════════════════ */
interface LoginFormBodyProps {
  showError?: boolean;
  appError: AppError | null;
  isLoggingIn: boolean;
  showPassword: boolean;
  onTogglePassword: () => void;
  onRetry: () => void;
  loginForm: UseFormReturn<LoginFormData>;
  onSubmit: (e: React.BaseSyntheticEvent) => void;
}

function LoginFormBody({
  showError,
  appError,
  isLoggingIn,
  showPassword,
  onTogglePassword,
  onRetry,
  loginForm,
  onSubmit,
}: LoginFormBodyProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">

      {/* Error banner */}
      <AnimatePresence>
        {showError && appError && (
          <motion.div variants={errorBannerVariants} initial="hidden" animate="visible" exit="exit">
            <div className="flex items-start gap-3 bg-red-950/60 border border-red-800/50 rounded-xl p-3.5">
              {(() => {
                const Icon = errorIconMap[appError.type];
                return <Icon className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />;
              })()}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-red-300">{appError.message}</p>
                {(appError.type === "network" || appError.type === "timeout") && (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="mt-2 flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    <RefreshCw className="h-3 w-3" /> Coba lagi
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NISN */}
      <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
        <Label htmlFor="nisn" className="text-sm font-medium text-slate-300 mb-1.5 block">
          Nomor Induk Siswa
        </Label>
        <div className="relative group">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 transition-colors group-focus-within:text-blue-400 z-10" />
          <Input
            id="nisn"
            type="text"
            inputMode="numeric"
            placeholder="Masukkan Nomor Induk"
            disabled={isLoggingIn}
            className="
              pl-10 bg-slate-800/60 border-slate-700/60 text-slate-100
              placeholder:text-slate-600 rounded-xl h-11
              focus-visible:ring-1 focus-visible:ring-blue-500/60 focus-visible:border-blue-500/60
              transition-all duration-200 hover:border-slate-600
              disabled:opacity-50
            "
            {...loginForm.register("nisn", {
              onChange: (e) => { e.target.value = e.target.value.replace(/\D/g, ""); },
            })}
          />
        </div>
        <AnimatePresence>
          {loginForm.formState.errors.nisn && (
            <motion.p
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-xs text-red-400 mt-1.5 flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3" /> {loginForm.formState.errors.nisn.message}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Password + eye toggle */}
      <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
        <Label htmlFor="password" className="text-sm font-medium text-slate-300 mb-1.5 block">
          Password
        </Label>
        <div className="relative group">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 transition-colors group-focus-within:text-blue-400 z-10" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Masukkan Password"
            disabled={isLoggingIn}
            className="
              pl-10 pr-11 bg-slate-800/60 border-slate-700/60 text-slate-100
              placeholder:text-slate-600 rounded-xl h-11
              focus-visible:ring-1 focus-visible:ring-blue-500/60 focus-visible:border-blue-500/60
              transition-all duration-200 hover:border-slate-600
              disabled:opacity-50
            "
            {...loginForm.register("password")}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={onTogglePassword}
            disabled={isLoggingIn}
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            className="
              absolute right-3.5 top-1/2 -translate-y-1/2 z-10
              text-slate-500 hover:text-slate-300
              transition-colors duration-200
              disabled:opacity-40 disabled:cursor-not-allowed
              focus:outline-none
            "
          >
            <AnimatePresence mode="wait">
              {showPassword ? (
                <motion.span
                  key="eye-off"
                  initial={{ opacity: 0, scale: 0.6, rotate: -12 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.6, rotate: 12 }}
                  transition={{ duration: 0.15 }}
                  className="block"
                >
                  <EyeOff className="h-4 w-4" />
                </motion.span>
              ) : (
                <motion.span
                  key="eye"
                  initial={{ opacity: 0, scale: 0.6, rotate: 12 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.6, rotate: -12 }}
                  transition={{ duration: 0.15 }}
                  className="block"
                >
                  <Eye className="h-4 w-4" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
        <AnimatePresence>
          {loginForm.formState.errors.password && (
            <motion.p
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-xs text-red-400 mt-1.5 flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3" /> {loginForm.formState.errors.password.message}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Ingat Saya */}
      <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible"
        className="flex items-center gap-2.5"
      >
        <Checkbox
          id="ingatSaya"
          checked={loginForm.watch("ingatSaya")}
          disabled={isLoggingIn}
          onCheckedChange={(c) => loginForm.setValue("ingatSaya", c as boolean)}
          className="border-slate-600 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
        />
        <label
          htmlFor="ingatSaya"
          className="text-sm text-slate-400 cursor-pointer select-none hover:text-slate-300 transition-colors"
        >
          Ingat Saya
          <AnimatePresence>
            {loginForm.watch("ingatSaya") && (
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.2 }}
                className="ml-1.5 text-[10px] text-blue-400/70"
              >
                · NISN tersimpan
              </motion.span>
            )}
          </AnimatePresence>
        </label>
      </motion.div>

      {/* Submit */}
      <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible">
        <Button
          type="submit"
          disabled={isLoggingIn}
          className="
            w-full h-11 rounded-xl font-semibold tracking-wide
            bg-blue-600 hover:bg-blue-500 active:scale-[0.98]
            transition-all duration-200 shadow-lg shadow-blue-900/40
            disabled:opacity-60 disabled:cursor-not-allowed
          "
        >
          {isLoggingIn ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...</>
          ) : (
            <><ArrowRight className="mr-2 h-4 w-4" /> Masuk</>
          )}
        </Button>
      </motion.div>
    </form>
  );
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
export default function LoginPage() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("login");
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /* login error */
  const [appError, setAppError] = useState<AppError | null>(null);

  /* token error + attempt counter */
  const [tokenError, setTokenError] = useState("");
  const [tokenAttempts, setTokenAttempts] = useState(0);
  const [tokenBlocked, setTokenBlocked] = useState(false);

  /* loading */
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSubmittingToken, setIsSubmittingToken] = useState(false);

  /* timeout ref */
  const loginTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { login, submitAbsen } = useAuth();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { nisn: "", password: "", ingatSaya: false },
  });

  const tokenForm = useForm<TokenFormData>({
    resolver: zodResolver(tokenSchema),
    defaultValues: { token: "" },
  });

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

    /* start timeout watchdog */
    loginTimeoutRef.current = setTimeout(() => {
      setIsLoggingIn(false);
      setAppError({ type: "timeout", message: "Koneksi terlalu lambat. Silakan coba lagi." });
      setCurrentScreen("error");
    }, LOGIN_TIMEOUT_MS);

    try {
      const userData = await login({ nisn: data.nisn, password: data.password });

      clearTimeout(loginTimeoutRef.current!);

      if (userData?.role === "siswa") {
        /* ✅ Valid siswa — show token modal */
        setShowTokenModal(true);
        setTokenError("");
        setTokenAttempts(0);
        setTokenBlocked(false);
        tokenForm.reset();
      } else {
        /* ❌ Role bukan siswa */
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
      await submitAbsen(data.token);
      setShowTokenModal(false);
      setCurrentScreen("success");
      setTimeout(() => { window.location.href = "/"; }, 3000);
    } catch (error) {
      const newAttempts = tokenAttempts + 1;
      setTokenAttempts(newAttempts);

      if (newAttempts >= MAX_TOKEN_ATTEMPTS) {
        /* 🔒 Too many wrong attempts */
        setTokenBlocked(true);
        setTokenError(`Terlalu banyak percobaan salah. Tutup dan minta token baru ke guru.`);
      } else {
        const remaining = MAX_TOKEN_ATTEMPTS - newAttempts;
        const baseError = parseTokenError(error);
        setTokenError(`${baseError} (${remaining} percobaan tersisa)`);
      }
    } finally {
      setIsSubmittingToken(false);
    }
  };

  /* ── Retry: reset to login screen ── */
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

  /* ══ RENDER ══ */
  return (
    <>
      {/* Background */}
      <div className="fixed inset-0 bg-[#0a0f1e] overflow-hidden -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm">

          {/* Top badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <div className="flex items-center gap-2 bg-blue-950/60 border border-blue-800/40 rounded-full px-4 py-1.5 text-blue-300 text-xs font-medium backdrop-blur-sm">
              <ShieldCheck className="h-3.5 w-3.5" />
              Sistem Absensi Digital
            </div>
          </motion.div>

          <AnimatePresence mode="wait">

            {/* ── LOGIN / ERROR card ── */}
            {(currentScreen === "login" || currentScreen === "error") && (
              <motion.div
                key="login-card"
                variants={cardVariants} initial="hidden" animate="visible" exit="exit"
                className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden"
              >
                {/* Card header */}
                <div className="px-6 pt-8 pb-6 text-center border-b border-slate-800/60">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.4, ease: "backOut" }}
                    className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-4"
                  >
                    <Fingerprint className="h-7 w-7 text-blue-400" />
                  </motion.div>
                  <motion.h1
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-xl font-bold text-white tracking-tight"
                  >
                    Selamat Datang
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm text-slate-500 mt-1"
                  >
                    Masuk untuk melanjutkan
                  </motion.p>
                </div>

                <div className="p-6">
                    <LoginFormBody
  showError={currentScreen === "error"}
  appError={appError}
  isLoggingIn={isLoggingIn}
  showPassword={showPassword}
  onTogglePassword={() => setShowPassword((prev) => !prev)}
  onRetry={handleRetry}
  loginForm={loginForm}
  onSubmit={loginForm.handleSubmit(onLoginSubmit)}
/>
                </div>
              </motion.div>
            )}

            {/* ── SUCCESS card ── */}
            {currentScreen === "success" && (
              <motion.div
                key="success-card"
                variants={cardVariants} initial="hidden" animate="visible" exit="exit"
                className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden"
              >
                <div className="px-6 pt-8 pb-6 text-center border-b border-slate-800/60">
                  <h1 className="text-xl font-bold text-white tracking-tight">Selamat Datang</h1>
                </div>
                <div className="p-10 flex flex-col items-center gap-5">
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                    className="w-28 h-28 rounded-3xl bg-emerald-950/60 border-2 border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-900/30"
                  >
                    <CheckCircle2 className="h-14 w-14 text-emerald-400" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center"
                  >
                    <p className="text-slate-400 text-sm mb-1">Status absensi hari ini</p>
                    <h2 className="text-3xl font-black text-white tracking-tight">TRABSEN! 🎉</h2>
                    <p className="text-slate-500 text-xs mt-3">Mengalihkan ke beranda...</p>
                  </motion.div>
                  <motion.div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-emerald-500 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3, ease: "linear" }}
                    />
                  </motion.div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Bottom note */}
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="text-center text-xs text-slate-600 mt-5"
          >
            &copy; {new Date().getFullYear()} Sistem Absensi · Dilindungi keamanan end-to-end
          </motion.p>
        </div>
      </div>

      {/* ══ TOKEN MODAL ══ */}
      <Dialog open={showTokenModal} onOpenChange={handleCloseTokenModal}>
        <DialogContent
          className="
            sm:max-w-sm bg-slate-900/95 backdrop-blur-xl
            border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/60
            text-slate-100 p-0 overflow-hidden gap-0
          "
        >
          {/* Modal header */}
          <div className="bg-blue-600/10 border-b border-blue-800/40 px-6 py-5">
            <DialogHeader>
              <div className="flex items-center justify-center gap-2.5 mb-1">
                <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4 text-blue-400" />
                </div>
                <DialogTitle className="text-base font-bold text-white">Verifikasi Absensi</DialogTitle>
              </div>
              <p className="text-slate-400 text-xs text-center">
                Masukkan token absen yang diberikan guru hari ini
              </p>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-4">

            {/* Attempt indicator dots */}
            {tokenAttempts > 0 && !tokenBlocked && (
              <motion.div
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-1.5"
              >
                {Array.from({ length: MAX_TOKEN_ATTEMPTS }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i < tokenAttempts ? "bg-red-500" : "bg-slate-700"
                    }`}
                  />
                ))}
                <span className="text-xs text-slate-500 ml-1">percobaan</span>
              </motion.div>
            )}

            {/* Token error banner */}
            <AnimatePresence>
              {tokenError && (
                <motion.div
                  variants={errorBannerVariants} initial="hidden" animate="visible" exit="exit"
                  className={`flex items-start gap-2.5 rounded-xl p-3 border ${
                    tokenBlocked
                      ? "bg-red-950/80 border-red-700/60"
                      : "bg-red-950/60 border-red-800/50"
                  }`}
                >
                  {tokenBlocked
                    ? <ShieldX className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                    : <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  }
                  <p className="text-sm text-red-300">{tokenError}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={tokenForm.handleSubmit(onTokenSubmit)} className="space-y-4">
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-blue-400 transition-colors z-10" />
                <Input
                  id="token"
                  type="text"
                  placeholder={tokenBlocked ? "Token diblokir" : "Masukkan Token"}
                  disabled={isSubmittingToken || tokenBlocked}
                  className="
                    pl-10 bg-slate-800/60 border-slate-700/60 text-slate-100
                    placeholder:text-slate-600 rounded-xl h-11
                    focus-visible:ring-1 focus-visible:ring-blue-500/60 focus-visible:border-blue-500/60
                    transition-all duration-200 tracking-[0.15em] font-mono
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                  {...tokenForm.register("token")}
                />
              </div>

              {tokenForm.formState.errors.token && (
                <p className="text-xs text-red-400 flex items-center gap-1 -mt-2">
                  <AlertCircle className="h-3 w-3" />
                  {tokenForm.formState.errors.token.message}
                </p>
              )}

              {tokenBlocked ? (
                /* Blocked state — close button only */
                <Button
                  type="button"
                  onClick={handleCloseTokenModal}
                  className="
                    w-full h-11 rounded-xl font-semibold
                    bg-slate-700 hover:bg-slate-600
                    transition-all duration-200
                  "
                >
                  Tutup & Coba Login Ulang
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmittingToken}
                  className="
                    w-full h-11 rounded-xl font-semibold
                    bg-blue-600 hover:bg-blue-500 active:scale-[0.98]
                    transition-all duration-200 shadow-lg shadow-blue-900/40
                    disabled:opacity-60
                  "
                >
                  {isSubmittingToken ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memverifikasi...</>
                  ) : (
                    <><ArrowRight className="mr-2 h-4 w-4" /> Konfirmasi Absen</>
                  )}
                </Button>
              )}
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}