"use client";

import { UseFormReturn } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowRight,
  Lock,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ShieldX,
  MapPin,
} from "lucide-react";
import { TokenFormData, MAX_TOKEN_ATTEMPTS, errorBannerVariants } from "../lib/shared";

interface TokenModalProps {
  open: boolean;
  onClose: () => void;
  tokenForm: UseFormReturn<TokenFormData>;
  onSubmit: (e: React.BaseSyntheticEvent) => void;
  tokenError: string;
  tokenAttempts: number;
  tokenBlocked: boolean;
  isSubmittingToken: boolean;
}

export function TokenModal({
  open,
  onClose,
  tokenForm,
  onSubmit,
  tokenError,
  tokenAttempts,
  tokenBlocked,
  isSubmittingToken,
}: TokenModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
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

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Token input */}
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

            {/* GPS info */}
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <MapPin className="h-3 w-3" />
              Absen memerlukan akses lokasi GPS kamu
            </p>

            {tokenForm.formState.errors.token && (
              <p className="text-xs text-red-400 flex items-center gap-1 -mt-2">
                <AlertCircle className="h-3 w-3" />
                {tokenForm.formState.errors.token.message}
              </p>
            )}

            {tokenBlocked ? (
              <Button
                type="button"
                onClick={onClose}
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
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengecek lokasi & memverifikasi...</>
                ) : (
                  <><MapPin className="mr-2 h-4 w-4" /> Konfirmasi Absen</>
                )}
              </Button>
            )}
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}