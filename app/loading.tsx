import { Loader2 } from "lucide-react";

export default function Loading() {
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
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <Loader2 className="h-7 w-7 text-blue-400 animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-300">Memuat...</p>
            <p className="text-xs text-slate-600 mt-1">Mohon tunggu sebentar</p>
          </div>
        </div>
      </div>
    </>
  );
}