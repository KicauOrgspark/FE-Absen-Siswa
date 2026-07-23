"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Home, ArrowLeft, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden relative"
          style={{ borderTopWidth: 4, borderTopColor: "var(--primary)" }}
        >
          {/* Header */}
          <div className="px-6 pt-8 pb-6 text-center border-b border-border">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4"
            >
              <FileQuestion className="h-8 w-8 text-primary" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <p className="text-4xl font-extrabold text-primary font-serif tracking-tight mb-1">
                404
              </p>
              <h1 className="text-xl font-bold text-foreground font-serif tracking-tight">
                Halaman Tidak Ditemukan
              </h1>
              <p className="text-xs text-muted-foreground mt-1.5 font-sans leading-relaxed">
                Halaman yang Anda cari tidak tersedia, telah dihapus, atau alamat URL yang Anda masukkan salah.
              </p>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 space-y-3 font-sans">
            <Button
              onClick={() => router.push("/")}
              className="w-full h-11 rounded-xl font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 cursor-pointer"
            >
              <Home className="mr-2 h-4 w-4" /> Ke Beranda
            </Button>

            <Button
              onClick={() => router.back()}
              variant="outline"
              className="w-full h-11 rounded-xl font-semibold border-border text-foreground hover:bg-muted transition-all duration-200 cursor-pointer"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
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