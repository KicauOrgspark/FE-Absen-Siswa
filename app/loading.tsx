import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-8 shadow-sm text-center flex flex-col items-center gap-4">
        {/* Animated Brand Icon */}
        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Loader2 className="h-7 w-7 text-primary animate-spin" />
        </div>

        <div>
          <h2 className="font-serif text-lg font-bold text-foreground tracking-tight">
            Memuat Halaman...
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-sans">
            Mohon tunggu sebentar, menyiapkan data presensi.
          </p>
        </div>

        {/* Brand indicator */}
        <div className="pt-3 border-t border-border w-full text-center mt-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
            SMK PLUS PNB · Absensi Digital
          </span>
        </div>
      </div>
    </div>
  );
}