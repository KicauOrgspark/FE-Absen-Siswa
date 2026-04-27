"use client"

import { useEffect, useRef } from "react"
import { Html5Qrcode } from "html5-qrcode"

import {
    Dialog,
    DialogContent
} from "@/components/ui/dialog"

interface Props {
    open: boolean
    onClose: () => void
    onScanSuccess: (token: string) => void
}

export function QRScannerModal({
    open,
    onClose,
    onScanSuccess
}: Props) {

    const scannerRef = useRef<Html5Qrcode | null>(null)
    const startedRef = useRef(false)

    useEffect(() => {

        if (!open || startedRef.current) return

        // ⬇️ INI FIX NYA
        // tunggu modal render <div id="reader">
        const timer = setTimeout(() => {

            const el = document.getElementById("reader")
            if (!el) {
                console.error("reader element not found")
                return
            }

            const scanner = new Html5Qrcode("reader")

            scannerRef.current = scanner
            startedRef.current = true

            scanner.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: {
                        width: 250,
                        height: 250
                    }
                },

                async (decodedText) => {

                    try {
                        await scanner.stop()
                        await scanner.clear()
                    } catch { }

                    startedRef.current = false

                    onScanSuccess(decodedText)
                },

                () => { }
            )

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

    }, [open, onScanSuccess])


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
        <Dialog
            open={open}
            onOpenChange={handleClose}
        >

            <DialogContent className="bg-slate-900 text-white border-slate-700">

                <h2 className="text-lg font-bold mb-4">
                    Scan QR Absensi
                </h2>

                <div
                    id="reader"
                    className="rounded-xl overflow-hidden min-h-[300px]"
                />

                <p className="text-sm text-slate-400 mt-4">
                    Arahkan kamera ke QR guru
                </p>

            </DialogContent>

        </Dialog>
    )

}