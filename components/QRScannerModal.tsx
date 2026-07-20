"use client"

import { useEffect, useRef, useId, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle, ScanLine, Camera } from "lucide-react"

import {
    Dialog,
    DialogContent,
    DialogTitle
} from "@/components/ui/dialog"

interface Props {
    open: boolean
    onClose: () => void
    onScanSuccess: (token: string) => void
    expiredError?: string | null
}

export function QRScannerModal({
    open,
    onClose,
    onScanSuccess,
    expiredError
}: Props) {

    const scannerRef = useRef<Html5Qrcode | null>(null)
    const startedRef = useRef(false)
    const [cameraError, setCameraError] = useState<string | null>(null)
    // useId biar id-nya unik & stabil, aman kalau komponen di-render lebih dari sekali
    const uid = useId()
    const readerId = `qr-reader-${uid.replace(/:/g, "")}`

    useEffect(() => {

        if (!open || startedRef.current) return

        const timer = setTimeout(async () => {

            const el = document.getElementById(readerId)
            if (!el) {
                console.error("reader element not found")
                return
            }

            const scanner = new Html5Qrcode(readerId)
            scannerRef.current = scanner
            setCameraError(null)

            const scanConfig = { fps: 10, qrbox: { width: 250, height: 250 } }

            const onSuccess = async (decodedText: string) => {
                try {
                    await scanner.stop()
                    await scanner.clear()
                } catch { }

                startedRef.current = false
                onScanSuccess(decodedText)
            }

            const onFailure = () => { }

            // Coba kamera belakang dulu, lalu depan, lalu kamera mana saja
            const attempts: Array<{ facingMode: string } | string> = [
                { facingMode: "environment" },
                { facingMode: "user" },
            ]

            // Tambahkan device ID kamera pertama yang tersedia sebagai fallback terakhir
            try {
                const devices = await Html5Qrcode.getCameras()
                if (devices.length > 0) {
                    attempts.push(devices[0].id)
                }
            } catch { }

            for (const cameraId of attempts) {
                try {
                    await scanner.start(cameraId, scanConfig, onSuccess, onFailure)
                    startedRef.current = true
                    return // berhasil, keluar dari loop
                } catch {
                    // Gagal dengan kamera ini, coba berikutnya
                }
            }

            // Semua kamera gagal
            setCameraError("Kamera tidak tersedia atau izin ditolak. Pastikan browser mendapat izin akses kamera.")

        }, 300)

        return () => {
            clearTimeout(timer)

            if (scannerRef.current && startedRef.current) {
                scannerRef.current
                    .stop()
                    .then(() => scannerRef.current?.clear())
                    .catch(() => { })
            }

            startedRef.current = false
        }

    }, [open, onScanSuccess, readerId])


    const handleClose = async () => {

        if (scannerRef.current && startedRef.current) {
            try {
                await scannerRef.current.stop()
                await scannerRef.current.clear()
            } catch { }
        }

        startedRef.current = false
        onClose()
    }


    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="bg-[#f4f5f6] text-[#111111] border-[#e2e8f0] shadow-xl">

                <DialogTitle className="text-lg font-bold text-[#111111] flex items-center gap-2">
                    <ScanLine className="h-5 w-5 text-[#c63535]" />
                    Scan QR Absensi
                </DialogTitle>

                {/* ── Expired Token Alert ── */}
                <AnimatePresence>
                    {expiredError && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="flex items-start gap-2.5 rounded-md p-3 border bg-[#b89750]/10 border-[#b89750]/20">
                                <AlertCircle className="h-4 w-4 text-[#b89750] shrink-0 mt-0.5" />
                                <p className="text-sm text-[#7c6330] font-medium">{expiredError}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div
                    id={readerId}
                    className="relative rounded-md overflow-hidden min-h-[300px] flex flex-col items-center justify-center border border-[#e2e8f0] bg-[#f4f5f6]"
                >
                    {cameraError && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-[#f4f5f6]">
                            <Camera className="h-10 w-10 text-slate-400 mb-3" />
                            <p className="text-sm font-medium text-slate-700">{cameraError}</p>
                        </div>
                    )}
                </div>

                <p className="text-sm text-[#8e8b82]">
                    {cameraError ? "Gagal mengakses kamera." : "Arahkan kamera ke QR guru"}
                </p>

            </DialogContent>
        </Dialog>
    )
}