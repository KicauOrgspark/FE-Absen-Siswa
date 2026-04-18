"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Fingerprint, CheckCircle2 } from "lucide-react";
import { useLoginPage } from "./hooks/useLoginPage";
import { LoginFormBody } from "../components/LoginFormBody";
import { TokenModal } from "../components/TokenModal";
import { cardVariants } from "../lib/shared";

export default function LoginPage() {
  const {
    currentScreen,
    showTokenModal,
    showPassword,
    appError,
    tokenError,
    tokenAttempts,
    tokenBlocked,
    isLoggingIn,
    isSubmittingToken,
    loginForm,
    tokenForm,
    onLoginSubmit,
    onTokenSubmit,
    handleRetry,
    handleCloseTokenModal,
    setShowPassword,
  } = useLoginPage();

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

      {/* Token Modal */}
      <TokenModal
        open={showTokenModal}
        onClose={handleCloseTokenModal}
        tokenForm={tokenForm}
        onSubmit={tokenForm.handleSubmit(onTokenSubmit)}
        tokenError={tokenError}
        tokenAttempts={tokenAttempts}
        tokenBlocked={tokenBlocked}
        isSubmittingToken={isSubmittingToken}
      />
    </>
  );
}