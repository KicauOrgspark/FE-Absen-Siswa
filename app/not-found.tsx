"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Home, ArrowLeft, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

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
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 pt-8 pb-6 text-center border-b border-slate-800/60">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4, ease: "backOut" }}
                className="w-14 h-14 rounded-2xl bg-slate-700/40 border border-slate-600/30 flex items-center justify-center mx-auto mb-4"
              >
                <SearchX className="h-7 w-7 text-slate-400" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <p className="text-5xl font-black text-white tracking-tight mb-1">404</p>
                <h1 className="text-lg font-bold text-white tracking-tight">Halaman Tidak Ditemukan</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Halaman yang kamu cari tidak ada atau sudah dipindahkan.
                </p>
              </motion.div>
            </div>

            {/* Actions */}
            <div className="p-6 space-y-3">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <Button
                  onClick={() => router.push("/")}
                  className="
                    w-full h-11 rounded-xl font-semibold tracking-wide
                    bg-blue-600 hover:bg-blue-500 active:scale-[0.98]
                    transition-all duration-200 shadow-lg shadow-blue-900/40
                  "
                >
                  <Home className="mr-2 h-4 w-4" /> Ke Beranda
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  onClick={() => router.back()}
                  variant="ghost"
                  className="
                    w-full h-11 rounded-xl font-semibold
                    text-slate-400 hover:text-slate-200 hover:bg-slate-800/60
                    transition-all duration-200
                  "
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                </Button>
              </motion.div>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-xs text-slate-600 mt-5"
          >
            &copy; {new Date().getFullYear()} Sistem Absensi · Dilindungi keamanan end-to-end
          </motion.p>
        </div>
      </div>
    </>
  );
}