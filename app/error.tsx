"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Home, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden relative"
          style={{ borderTopWidth: 4, borderTopColor: "var(--destructive)" }}
        >
          {/* Header */}
          <div className="px-6 pt-8 pb-6 text-center border-b border-border">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-4"
            >
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <h1 className="text-xl font-bold text-foreground font-serif tracking-tight">
                Terjadi Kesalahan Sistem
              </h1>
              <p className="text-xs text-muted-foreground mt-1.5 font-sans leading-relaxed">
                Aplikasi mengalami kendala yang tidak terduga. Silakan coba muat ulang halaman.
              </p>
            </motion.div>
          </div>

          {/* Error Details */}
          {error.message && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mx-6 mt-4 p-3.5 bg-destructive/10 border border-destructive/20 rounded-xl"
            >
              <p className="text-xs text-destructive font-mono break-all">{error.message}</p>
              {error.digest && (
                <p className="text-[10px] text-muted-foreground font-mono mt-1">
                  Digest ID: {error.digest}
                </p>
              )}
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="p-6 space-y-3 font-sans">
            <Button
              onClick={reset}
              className="w-full h-11 rounded-xl font-semibold bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-all duration-200 cursor-pointer"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Coba Lagi
            </Button>

            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="w-full h-11 rounded-xl font-semibold border-border text-foreground hover:bg-muted transition-all duration-200 cursor-pointer"
            >
              <Home className="mr-2 h-4 w-4" /> Ke Beranda
            </Button>
          </div>
        </motion.div>

        {/* Footer info */}
        <p className="text-center text-xs text-muted-foreground mt-6 font-sans">
          &copy; {new Date().getFullYear()} SMK PLUS PNB · Sistem Absensi Digital
        </p>
      </div>
    </div>
  );
}